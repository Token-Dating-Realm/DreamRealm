/**
 * Messaging API Helpers
 *
 * Reusable conversation and message CRUD functions for web and mobile.
 * Accept a typed Supabase client so callers bring their own instance.
 *
 * All functions enforce RLS naturally via the client's JWT.
 *
 * TODO: Add E2E encryption wrapper before sendMessage / after getConversationMessages.
 */

import type { TypedSupabaseClient } from "./index";
import type {
  Conversation,
  ConversationMember,
  Message,
  CreateConversationInput,
  CreateMessageInput,
} from "@dreamrealm/types";
import { createMessageInputSchema } from "@dreamrealm/types";

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
      .filter(Boolean) ?? [];

  return conversations;
}

export async function getConversationMessages(
  client: TypedSupabaseClient,
  conversationId: string,
  limit = 50,
  before?: string
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
  return (data ?? []).reverse() as Message[];
}

export async function sendMessage(
  client: TypedSupabaseClient,
  input: CreateMessageInput
): Promise<Message> {
  const parsed = createMessageInputSchema.parse(input);

  // RLS will reject if not a conversation member
  const { data, error } = await client
    .from("messages")
    .insert(parsed)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
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
    role: idx === 0 && pid === user.id ? "owner" : "member",
  }));

  const { error: membersError } = await client
    .from("conversation_members")
    .insert(members);

  if (membersError) throw membersError;

  return convo as Conversation;
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
 * TODO: Handle encrypted payloads by decrypting before calling the callback.
 */
export function subscribeToMessages(
  client: TypedSupabaseClient,
  conversationId: string,
  onMessage: (message: Message) => void
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
        onMessage(payload.new as Message);
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
