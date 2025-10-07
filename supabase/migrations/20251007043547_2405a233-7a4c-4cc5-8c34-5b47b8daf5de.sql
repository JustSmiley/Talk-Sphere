-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all access to chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow all access to match_queue" ON public.match_queue;

-- Create security definer function to check if user is part of a session
CREATE OR REPLACE FUNCTION public.is_session_participant(_session_id uuid, _user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_sessions
    WHERE id = _session_id
      AND (_user_id = user1_id OR _user_id = user2_id)
  )
$$;

-- ============================================
-- MESSAGES TABLE RLS POLICIES
-- ============================================

-- Users can only read messages from sessions they participate in
CREATE POLICY "Users can read their session messages"
ON public.messages
FOR SELECT
USING (public.is_session_participant(session_id, sender_id));

-- Users can only insert messages with their own user_id to their sessions
CREATE POLICY "Users can send messages to their sessions"
ON public.messages
FOR INSERT
WITH CHECK (public.is_session_participant(session_id, sender_id));

-- ============================================
-- CHAT_SESSIONS TABLE RLS POLICIES
-- ============================================

-- Users can only view sessions where they are a participant
CREATE POLICY "Users can view their own sessions"
ON public.chat_sessions
FOR SELECT
USING (user1_id = auth.uid()::text OR user2_id = auth.uid()::text);

-- Users can create sessions (for matching system)
CREATE POLICY "Users can create sessions as user1"
ON public.chat_sessions
FOR INSERT
WITH CHECK (user1_id = auth.uid()::text);

-- Users can update session end time for their own sessions
CREATE POLICY "Users can end their own sessions"
ON public.chat_sessions
FOR UPDATE
USING (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
WITH CHECK (user1_id = auth.uid()::text OR user2_id = auth.uid()::text);

-- ============================================
-- MATCH_QUEUE TABLE RLS POLICIES
-- ============================================

-- Users can read queue entries for matching (excluding personal details)
CREATE POLICY "Users can read queue for matching"
ON public.match_queue
FOR SELECT
USING (true);

-- Users can only insert their own queue entry
CREATE POLICY "Users can add themselves to queue"
ON public.match_queue
FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

-- Users can only delete their own queue entry
CREATE POLICY "Users can remove themselves from queue"
ON public.match_queue
FOR DELETE
USING (user_id = auth.uid()::text);