/**
 * Messaging API Helpers
 *
 * Reusable conversation and message CRUD functions for web and mobile.
 * Accept a typed Supabase client so callers bring their own instance.
 *
 * All functions enforce RLS naturally via the client's JWT.
 *
 * End-to-end encryption is opt-in and additive: pass a `conversationKey`
 * (from `getConversationKeyForMember`) to encrypt on send / decrypt on read.
 * Callers that omit it keep working exactly as before (plaintext `content`).
 */

import type { TypedSupabaseClient } from "./index";
import type { Conversation, Message, CreateConversationInput, CreateMessageInput } from "@dreamrealm/types";
import { createMessageInputSchema } from "@dreamrealm/types";
import {
  isE2EEAvailable,
  getOrCreateIdentityKeyPair,
  generateConversationKey,
  wrapConversationKey,
  unwrapConversationKey,
  importPublicKey,
  exportPublicKey,
  encryptMessage,
  decryptMessage,
} from "./crypto";

export interface ConversationWithLastMessage extends Conversation {
  last_message_content?: string | null;
  last_message_sender?: string | null;
  last_message_created_at?: string | null;
  unread_count?: number;
  members?: { profile_id: string }[];
}

export async function getMyConversations(
  client: TypedSupabaseClient
): Promise<ConversationWithLastMessage[]> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  // Fetch my profile id first (conversation_members stores profile_id)
  const { data: myProfile } = await client
    .from("profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  if (!myProfile) return [];

  // Get conversations where I am a member
  const { data, error } = await client
    .from("conversation_members")
    .select(
      `conversation_id,
       conversations(
         id, type, title, created_by, is_encrypted, encryption_key_fingerprint, last_message_at, created_at
       )`
    )
    .eq("profile_id", myProfile.id)
    .order("joined_at", { ascending: false });

  if (error) throw error;

  const conversations: ConversationWithLastMessage[] =
    data
      ?.map((row: Record<string, unknown>) => {
        const convo = row.conversations as Record<string, unknown> | null;
        if (!convo) return null;
        return {
          id: convo.id as string,
          type: convo.type as string,
          title: convo.title as string | null,
          created_by: convo.created_by as string,
          is_encrypted: convo.is_encrypted as boolean,
          encryption_key_fingerprint: convo.encryption_key_fingerprint as string | null,
          last_message_at: convo.last_message_at as string | null,
          created_at: convo.created_at as string,
        } as ConversationWithLastMessage;
      })
      .filter((c): c is ConversationWithLastMessage => c !== null) ?? [];

  return conversations;
}

export async function getConversationMessages(
  client: TypedSupabaseClient,
  conversationId: string,
  limit = 50,
  before?: string,
  conversationKey?: CryptoKey | null
): Promise<Message[]> {
  let query = client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) throw error;
  const messages = (data ?? []).reverse() as Message[];

  if (!conversationKey) return messages;
  return Promise.all(messages.map((m) => decryptMessageForDisplay(m, conversationKey)));
}

export async function sendMessage(
  client: TypedSupabaseClient,
  input: CreateMessageInput,
  conversationKey?: CryptoKey | null
): Promise<Message> {
  const parsed = createMessageInputSchema.parse(input);

  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: myProfile } = await client
    .from("profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();
  if (!myProfile) throw new Error("No profile found");

  const withSender = { ...parsed, sender_profile_id: myProfile.id };

  const toInsert =
    conversationKey && withSender.content
      ? { ...withSender, content: null, encrypted_payload: await encryptMessage(conversationKey, withSender.content) }
      : withSender;

  // RLS will reject if not a conversation member
  const { data, error } = await client
    .from("messages")
    .insert(toInsert)
    .select()
    .single();

  if (error) throw error;
  return conversationKey ? decryptMessageForDisplay(data as Message, conversationKey) : (data as Message);
}

async function decryptMessageForDisplay(message: Message, conversationKey: CryptoKey): Promise<Message> {
  if (!message.encrypted_payload) return message;
  try {
    return { ...message, content: await decryptMessage(conversationKey, message.encrypted_payload) };
  } catch {
    return { ...message, content: "[unable to decrypt message]" };
  }
}

export async function createConversation(
  client: TypedSupabaseClient,
  input: CreateConversationInput
): Promise<Conversation> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  // Start a transaction-like sequence: create conversation then add members
  const { data: convo, error: convoError } = await client
    .from("conversations")
    .insert({
      type: input.type,
      title: input.title ?? null,
      created_by: user.id,
      is_encrypted: input.is_encrypted,
    })
    .select()
    .single();

  if (convoError || !convo) throw convoError ?? new Error("Failed to create conversation");

  // Add all members including creator as owner
  const members = input.member_profile_ids.map((pid, idx) => ({
    conversation_id: convo.id,
    profile_id: pid,
    role: (idx === 0 && pid === user.id ? "owner" : "member") as "owner" | "member",
  }));

  const { error: membersError } = await client
    .from("conversation_members")
    .insert(members);

  if (membersError) throw membersError;

  if (convo.is_encrypted) {
    await setupEncryptedConversationKeys(client, convo.id, user.id, input.member_profile_ids);
  }

  return convo as Conversation;
}

// ---------------------------------------------------------------------------
// End-to-end encryption setup
// ---------------------------------------------------------------------------

/**
 * Publishes the current user's ECDH public key on their profile so others
 * can wrap conversation keys for them. Safe to call on every sign-in; it's
 * a no-op on platforms without E2EE support (see `isE2EEAvailable`).
 */
export async function ensureIdentityPublished(
  client: TypedSupabaseClient,
  userId: string,
  profileId: string
): Promise<void> {
  const pair = await getOrCreateIdentityKeyPair(userId);
  if (!pair) return;

  const { data: profile } = await client.from("profiles").select("public_key").eq("id", profileId).single();
  const publicKeyB64 = await exportPublicKey(pair.publicKey);
  if (profile?.public_key === publicKeyB64) return;

  await client.from("profiles").update({ public_key: publicKeyB64 }).eq("id", profileId);
}

/**
 * Generates a conversation AES key and wraps a copy for every member whose
 * public key has been published. Members without a published key simply
 * can't decrypt yet — their `wrapped_key` stays null until they sign in and
 * `ensureIdentityPublished` runs, matching how real E2EE clients behave.
 */
export async function setupEncryptedConversationKeys(
  client: TypedSupabaseClient,
  conversationId: string,
  creatorUserId: string,
  memberProfileIds: string[]
): Promise<void> {
  if (!isE2EEAvailable()) return;

  const creatorPair = await getOrCreateIdentityKeyPair(creatorUserId);
  if (!creatorPair) return;

  const conversationKey = await generateConversationKey();

  const { data: memberProfiles, error } = await client
    .from("profiles")
    .select("id, public_key")
    .in("id", memberProfileIds);
  if (error) throw error;

  await Promise.all(
    (memberProfiles ?? []).map(async (member) => {
      if (!member.public_key) return;
      const theirPublicKey = await importPublicKey(member.public_key);
      const wrappedKey = await wrapConversationKey(conversationKey, creatorPair.privateKey, theirPublicKey);
      await client
        .from("conversation_members")
        .update({ wrapped_key: wrappedKey })
        .eq("conversation_id", conversationId)
        .eq("profile_id", member.id);
    })
  );
}

/**
 * Resolves the current member's usable conversation key, or null if E2EE
 * isn't available or this member hasn't received a wrapped key yet.
 */
export async function getConversationKeyForMember(
  client: TypedSupabaseClient,
  conversationId: string,
  currentUserId: string,
  currentProfileId: string
): Promise<CryptoKey | null> {
  if (!isE2EEAvailable()) return null;

  const { data: convo } = await client
    .from("conversations")
    .select("created_by")
    .eq("id", conversationId)
    .single();
  if (!convo) return null;

  const { data: creatorProfile } = await client
    .from("profiles")
    .select("public_key")
    .eq("id", convo.created_by)
    .single();
  if (!creatorProfile?.public_key) return null;

  const { data: memberRow } = await client
    .from("conversation_members")
    .select("wrapped_key")
    .eq("conversation_id", conversationId)
    .eq("profile_id", currentProfileId)
    .single();
  if (!memberRow?.wrapped_key) return null;

  const myPair = await getOrCreateIdentityKeyPair(currentUserId);
  if (!myPair) return null;

  const creatorPublicKey = await importPublicKey(creatorProfile.public_key);
  return unwrapConversationKey(memberRow.wrapped_key, myPair.privateKey, creatorPublicKey);
}

export async function addConversationMember(
  client: TypedSupabaseClient,
  conversationId: string,
  profileId: string,
  role: "member" | "admin" = "member"
): Promise<void> {
  const { error } = await client.from("conversation_members").insert({
    conversation_id: conversationId,
    profile_id: profileId,
    role,
  });
  if (error) throw error;
}

export async function updateLastRead(
  client: TypedSupabaseClient,
  conversationId: string
): Promise<void> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return;

  const { error } = await client
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Supabase Realtime Subscriptions
// ---------------------------------------------------------------------------

/**
 * Subscribe to new messages in a specific conversation.
 * Returns a cleanup function to unsubscribe.
 *
 * Pass `conversationKey` (from `getConversationKeyForMember`) to transparently
 * decrypt incoming encrypted payloads before they reach `onMessage`.
 */
export function subscribeToMessages(
  client: TypedSupabaseClient,
  conversationId: string,
  onMessage: (message: Message) => void,
  conversationKey?: CryptoKey | null
): () => void {
  const channel = client
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const message = payload.new as Message;
        if (!conversationKey) {
          onMessage(message);
          return;
        }
        decryptMessageForDisplay(message, conversationKey).then(onMessage);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to conversation list changes (last_message_at updates, new members).
 * Returns a cleanup function to unsubscribe.
 */
export function subscribeToConversations(
  client: TypedSupabaseClient,
  onChange: () => void
): () => void {
  const channel = client
    .channel("conversations:public")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
      },
      () => {
        onChange();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "conversation_members",
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
