-- 013_enable_realtime_messaging.sql
-- Phase 3 — Enable Supabase Realtime for messaging tables
-- and add trigger to update last_message_at on new messages.

-- Enable realtime publication for messaging tables
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_members;

-- Function: update last_message_at on conversation when a message is inserted
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, auth;

REVOKE ALL ON FUNCTION public.update_conversation_last_message() FROM PUBLIC;

CREATE TRIGGER on_message_inserted_update_conversation
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();
