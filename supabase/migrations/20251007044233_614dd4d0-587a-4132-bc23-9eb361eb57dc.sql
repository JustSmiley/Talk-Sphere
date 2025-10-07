-- Phase 2: Create secure server-side matching function
CREATE OR REPLACE FUNCTION public.find_match(
  _topic text,
  _languages text[],
  _chat_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_user_record record;
  new_session_id uuid;
  current_user_id text;
BEGIN
  current_user_id := auth.uid()::text;
  
  -- Find a compatible match from the queue
  SELECT * INTO matched_user_record
  FROM public.match_queue
  WHERE topic = _topic
    AND chat_type = _chat_type
    AND user_id != current_user_id
    AND (
      'any' = ANY(_languages)
      OR 'any' = ANY(languages)
      OR languages && _languages  -- Array overlap
    )
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- If match found, create session
  IF matched_user_record.user_id IS NOT NULL THEN
    INSERT INTO public.chat_sessions (user1_id, user2_id, topic, chat_type)
    VALUES (current_user_id, matched_user_record.user_id, _topic, _chat_type)
    RETURNING id INTO new_session_id;
    
    -- Remove both users from queue
    DELETE FROM public.match_queue
    WHERE user_id IN (current_user_id, matched_user_record.user_id);
    
    RETURN json_build_object(
      'matched', true,
      'session_id', new_session_id
    );
  ELSE
    -- No match, add current user to queue
    INSERT INTO public.match_queue (user_id, topic, languages, chat_type)
    VALUES (current_user_id, _topic, _languages, _chat_type)
    ON CONFLICT (user_id) DO UPDATE
    SET topic = _topic,
        languages = _languages,
        chat_type = _chat_type,
        created_at = now();
    
    RETURN json_build_object(
      'matched', false,
      'session_id', null
    );
  END IF;
END;
$$;

-- Update match_queue RLS: Restrict SELECT to own entries only
DROP POLICY IF EXISTS "Users can read queue for matching" ON public.match_queue;
CREATE POLICY "Users can read own queue entry"
ON public.match_queue
FOR SELECT
USING (user_id = auth.uid()::text);

-- Add unique constraint to prevent duplicate queue entries
ALTER TABLE public.match_queue
ADD CONSTRAINT match_queue_user_id_unique UNIQUE (user_id);

-- Create rate limiting table for translation function
CREATE TABLE IF NOT EXISTS public.translation_rate_limits (
  user_id text PRIMARY KEY,
  request_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now()
);

ALTER TABLE public.translation_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limit"
ON public.translation_rate_limits
FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage rate limits"
ON public.translation_rate_limits
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');