import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Users } from "lucide-react";
import { useMatching } from "@/hooks/useMatching";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Matching = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { loading: authLoading } = useAuth();
  const chatType = searchParams.get("type") || "text";
  const topic = searchParams.get("topic") || "General";
  const languagesParam = searchParams.get("languages") || "en";
  // Handle translator mode format: "translator:en" or regular "en,es,fr"
  const languages = languagesParam.startsWith("translator:") 
    ? [languagesParam.replace("translator:", "")] 
    : languagesParam.split(",");
  
  const { joinQueue, leaveQueue, listenForMatch } = useMatching();
  const [isSearching, setIsSearching] = useState(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleQuit = () => {
    leaveQueue();
    try {
      cleanupRef.current?.();
    } catch {}
    navigate("/");
  };

  useEffect(() => {
    // Wait for auth to initialize before starting matching
    if (authLoading) return;

    let cleanupListener: (() => void) | undefined;

    const startMatching = async () => {
      try {
      const result = await joinQueue(topic, languagesParam, chatType);
      
      if (result.matched) {
        navigate(`/chat?type=${chatType}&session=${result.sessionId}&topic=${topic}&languages=${languagesParam}`);
      } else {
        // Set up realtime listener for match
        const cleanup = listenForMatch((sessionId) => {
          navigate(`/chat?type=${chatType}&session=${sessionId}&topic=${topic}&languages=${languagesParam}`);
        });
        cleanupRef.current = cleanup;
      }
      } catch (error) {
        console.error("Matching error:", error);
        toast({
          title: "Matching Error",
          description: "Failed to join matching queue. Please try again.",
          variant: "destructive",
        });
      }
    };

    startMatching();

    return () => {
      leaveQueue();
      if (cleanupListener) cleanupListener();
    };
  }, [authLoading, navigate, chatType, topic, languages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {authLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-muted-foreground">Initializing...</span>
          </div>
        ) : (
          <>
            {/* Animated Icon */}
            <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto animate-pulse shadow-2xl shadow-primary/40">
            <Users className="w-16 h-16 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-primary/30 mx-auto animate-ping" />
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Finding Your Match
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connecting you with someone who shares your interests...
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-muted-foreground">This usually takes just a few seconds</span>
        </div>

        {/* Stats */}
        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6 max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">1.2M+</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">50K+</div>
              <div className="text-xs text-muted-foreground">Conversations/Day</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">150+</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>

            {/* Quit Button */}
            <div className="flex justify-center">
              <Button variant="ghost" onClick={handleQuit}>
                Quit and return home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Matching;
