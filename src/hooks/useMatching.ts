import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const useMatching = () => {
  const [userId] = useState(() => {
    const stored = localStorage.getItem("talksphere_user_id");
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem("talksphere_user_id", newId);
    return newId;
  });

  const joinQueue = async (topic: string, languages: string[], chatType: string) => {
    try {
      // First, try to find a match
      const { data: existingUsers, error: searchError } = await supabase
        .from("match_queue")
        .select("*")
        .eq("topic", topic)
        .eq("chat_type", chatType)
        .neq("user_id", userId)
        .limit(10);

      if (searchError) throw searchError;

      // Find a user with compatible languages
      let matchedUser = null;
      if (existingUsers && existingUsers.length > 0) {
        for (const user of existingUsers) {
          const hasAnyLanguage = languages.includes("any");
          const userHasAny = user.languages?.includes("any");
          const hasCommonLanguage = languages.some((lang) =>
            user.languages?.includes(lang)
          );

          // Treat "translator mode" as compatible with anyone
          const isTranslatorModeCurrent = Array.isArray(languages) && languages.length === 1 && languages[0] !== "en";
          const isTranslatorModeUser = Array.isArray(user.languages) && user.languages.length === 1 && user.languages[0] !== "en";

          if (
            hasAnyLanguage ||
            userHasAny ||
            hasCommonLanguage ||
            isTranslatorModeCurrent ||
            isTranslatorModeUser
          ) {
            matchedUser = user;
            break;
          }
        }
      }

      if (matchedUser) {
        // Create session with matched user
        const { data: session, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            user1_id: userId,
            user2_id: matchedUser.user_id,
            topic,
            chat_type: chatType,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Remove both users from queue
        await supabase
          .from("match_queue")
          .delete()
          .in("user_id", [userId, matchedUser.user_id]);

        return { matched: true, sessionId: session.id };
      } else {
        // Add to queue and wait for match
        const { error: insertError } = await supabase
          .from("match_queue")
          .insert({
            user_id: userId,
            topic,
            languages,
            chat_type: chatType,
          });

        if (insertError) throw insertError;

        return { matched: false, sessionId: null };
      }
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
