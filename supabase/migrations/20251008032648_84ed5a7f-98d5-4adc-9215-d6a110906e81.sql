-- Add language preferences to chat sessions so both users retain their original settings
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS user1_languages text,
ADD COLUMN IF NOT EXISTS user2_languages text;

-- Update the find_match function to store language preferences
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
  _languages_str text;
BEGIN
  current_user_id := auth.uid()::text;
  _languages_str := array_to_string(_languages, ',');
  
  -- Find a compatible match from the queue
  SELECT * INTO matched_user_record
  FROM public.match_queue
  WHERE topic = _topic
    AND chat_type = _chat_type
    AND user_id != current_user_id
    AND (
      'any' = ANY(_languages)
      OR 'any' = ANY(languages)
      OR languages && _languages
    )
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- If match found, create session with language preferences
  IF matched_user_record.user_id IS NOT NULL THEN
    INSERT INTO public.chat_sessions (
      user1_id, 
      user2_id, 
      topic, 
      chat_type,
      user1_languages,
      user2_languages
    )
    VALUES (
      current_user_id, 
      matched_user_record.user_id, 
      _topic, 
      _chat_type,
      _languages_str,
      array_to_string(matched_user_record.languages, ',')
    )
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