-- Create match_queue table for users waiting to be matched
CREATE TABLE public.match_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('text', 'voice', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_sessions table for active chats
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('text', 'voice', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table for text chat history
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access since anonymous)
ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (anonymous matching)
CREATE POLICY "Allow all access to match_queue" ON public.match_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to chat_sessions" ON public.chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for instant matching
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster matching queries
CREATE INDEX idx_match_queue_topic_type ON public.match_queue(topic, chat_type);
CREATE INDEX idx_messages_session ON public.messages(session_id, created_at);