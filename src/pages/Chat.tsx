import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, PhoneOff, Flag, Mic, MicOff, Video as VideoIcon, SkipForward, Home } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { useMatching } from "@/hooks/useMatching";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const chatType = searchParams.get("type") || "text";
  const sessionId = searchParams.get("session");
  const { userId } = useMatching();
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const targetLanguage = searchParams.get("languages") || "en";
  const useTranslator = searchParams.get("languages") === "any" || targetLanguage.includes(",");
  
  const handleSessionEnded = () => {
    toast({
      title: "Partner left",
      description: "Your chat partner has left the conversation",
    });
    setTimeout(() => {
      const topic = searchParams.get("topic") || "General";
      const languages = searchParams.get("languages") || "en";
      navigate(`/matching?type=${chatType}&topic=${topic}&languages=${languages}`);
    }, 2000);
  };
  
  const { messages, sendMessage, endSession, partnerConnected } = useChatSession(
    sessionId, 
    userId,
    handleSessionEnded
  );

  const handleNextMatch = async () => {
    await endSession();
    const topic = searchParams.get("topic") || "General";
    const languages = searchParams.get("languages") || "en";
    navigate(`/matching?type=${chatType}&topic=${topic}&languages=${languages}`);
  };

  const handleQuitChat = async () => {
    await endSession();
    navigate("/");
  };

  const handleSend = async () => {
    if (message.trim()) {
      await sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-card to-background flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">A</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Anonymous User</h2>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              onClick={handleNextMatch}
              className="gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Next Match
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleQuitChat}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Quit Chatting
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {chatType === "text" ? (
          <TextChatView 
            messages={messages} 
            userId={userId} 
            targetLanguage={useTranslator ? targetLanguage.split(",")[0] : ""} 
          />
        ) : (
          <VideoChatView isMuted={isMuted} />
        )}
      </div>

      {/* Controls */}
      <div className="bg-card/80 backdrop-blur-sm border-t border-border px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {chatType === "text" ? (
            <div className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-background"
              />
              <Button variant="hero" size="icon" onClick={handleSend}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="w-14 h-14 rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full"
                onClick={handleNextMatch}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TextChatView = ({ 
  messages, 
  userId, 
  targetLanguage 
}: { 
  messages: any[]; 
  userId: string; 
  targetLanguage?: string;
}) => {
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!targetLanguage) return;
    
    messages.forEach(async (msg) => {
      if (msg.sender_id !== userId && !translatedMessages[msg.id]) {
        try {
          const { data, error } = await supabase.functions.invoke("translate-message", {
            body: { text: msg.content, targetLanguage }
          });
          
          if (!error && data) {
            setTranslatedMessages(prev => ({
              ...prev,
              [msg.id]: data
            }));
          }
        } catch (error) {
          console.error("Translation error:", error);
        }
      }
    });
  }, [messages, userId, targetLanguage, translatedMessages]);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            Start the conversation by sending a message!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === userId;
          const translation = translatedMessages[msg.id];
          const showTranslation = !isOwn && translation?.needsTranslation;
          
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isOwn
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <p className="text-sm">
                  {showTranslation ? translation.translatedText : msg.content}
                </p>
                {showTranslation && (
                  <p className="text-xs opacity-70 mt-1 italic">
                    Translated from {translation.detectedLanguage}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VideoChatView = ({ isMuted }: { isMuted: boolean }) => {
  return (
    <div className="h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Other User Video */}
      <div className="relative bg-muted rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-primary-foreground font-bold">A</span>
            </div>
            <p className="text-muted-foreground">Anonymous User</p>
          </div>
        </div>
      </div>

      {/* Your Video */}
      <div className="relative bg-muted rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-primary-foreground font-bold">Y</span>
            </div>
            <p className="text-muted-foreground">You</p>
          </div>
        </div>
        {isMuted && (
          <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
            Muted
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
