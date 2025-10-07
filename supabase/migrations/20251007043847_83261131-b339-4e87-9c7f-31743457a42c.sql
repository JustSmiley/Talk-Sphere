-- Drop policies first
DROP POLICY IF EXISTS "Users can read their session messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their sessions" ON public.messages;

-- Now drop the function
DROP FUNCTION IF EXISTS public.is_session_participant(uuid, text);

-- Create new function that validates against actual authenticated user (no parameters needed)
CREATE OR REPLACE FUNCTION public.is_session_participant(_session_id uuid)
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
      AND (auth.uid()::text = user1_id OR auth.uid()::text = user2_id)
  )
$$;

-- Recreate messages policies with fixed function signature
CREATE POLICY "Users can read their session messages"
ON public.messages
FOR SELECT
USING (public.is_session_participant(session_id));

-- Users can only insert messages with their own auth.uid() as sender_id
CREATE POLICY "Users can send messages to their sessions"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()::text 
  AND public.is_session_participant(session_id)
);