import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, PhoneOff, Flag, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const chatType = searchParams.get("type") || "text";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "other", text: "Hey! Nice to meet you!", timestamp: new Date() },
    { id: 2, sender: "me", text: "Hi! How are you doing?", timestamp: new Date() },
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, sender: "me", text: message, timestamp: new Date() },
      ]);
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {chatType === "text" ? (
          <TextChatView messages={messages} />
        ) : (
          <VideoChatView isMuted={isMuted} isVideoOff={isVideoOff} />
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
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="w-14 h-14 rounded-full"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full"
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

const TextChatView = ({ messages }: { messages: any[] }) => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.sender === "me"
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoChatView = ({ isMuted, isVideoOff }: { isMuted: boolean; isVideoOff: boolean }) => {
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
            {isVideoOff && (
              <p className="text-sm text-muted-foreground mt-2">Camera Off</p>
            )}
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
