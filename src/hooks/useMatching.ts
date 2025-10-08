import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMatching = () => {
  const { userId } = useAuth();

  const joinQueue = async (topic: string, languages: string | string[], chatType: string) => {
    if (!userId) throw new Error("User not authenticated");
    
    try {
      // Convert languages to array format for database
      const languagesArray = Array.isArray(languages) 
        ? languages 
        : languages.includes(',') 
          ? languages.split(',') 
          : [languages];

      // Use secure server-side matching function
      const { data, error } = await supabase.rpc('find_match', {
        _topic: topic,
        _languages: languagesArray,
        _chat_type: chatType,
      });

      if (error) throw error;

      const result = data as { matched: boolean; session_id: string | null };
      return {
        matched: result.matched,
        sessionId: result.session_id,
      };
    } catch (error) {
      console.error("Error joining queue:", error);
      throw error;
    }
  };

  const leaveQueue = async () => {
    try {
      await supabase
        .from("match_queue")
        .delete()
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error leaving queue:", error);
    }
  };

  const listenForMatch = (onMatch: (sessionId: string) => void) => {
    const channel = supabase
      .channel("match-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
          filter: `user2_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Match found!", payload);
          onMatch(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { userId, joinQueue, leaveQueue, listenForMatch };
};
