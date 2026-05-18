-- 005_conversations_and_messages.sql
-- Phase 3 ready — Encrypted and group messaging infrastructure

CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'stream');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'voice', 'system');

CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type conversation_type NOT NULL DEFAULT 'direct',
    title text CHECK (char_length(title) <= 200),
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_encrypted boolean NOT NULL DEFAULT false,
    encryption_key_fingerprint text,
    last_message_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    last_read_at timestamptz,

    CONSTRAINT unique_member UNIQUE (conversation_id, profile_id)
);

CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type message_type NOT NULL DEFAULT 'text',
    content text CHECK (char_length(content) <= 10000),
    encrypted_payload text,
    media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
    reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_type ON public.conversations(type);
CREATE INDEX idx_conversation_members_profile ON public.conversation_members(profile_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Members can read their conversations
CREATE POLICY conversations_member_read ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversations.id
              AND cm.profile_id = (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
              )
        )
    );

-- Members can read member list
CREATE POLICY conversation_members_member_read ON public.conversation_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm2
            WHERE cm2.conversation_id = conversation_members.conversation_id
              AND cm2.profile_id = (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
              )
        )
    );

-- Members can read messages in their conversations
CREATE POLICY messages_member_read ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = messages.conversation_id
              AND cm.profile_id = (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
              )
        )
    );

-- Senders can insert messages
CREATE POLICY messages_sender_insert ON public.messages
    FOR INSERT WITH CHECK (
        sender_profile_id = (
            SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
        )
    );
