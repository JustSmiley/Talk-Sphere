import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: Date;
}

export const useChatSession = (
  sessionId: string | null,
  onSessionEnded?: () => void
) => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Load existing messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      setMessages(
        data.map((msg) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))
      );
    };

    loadMessages();

    // Listen for new messages and control broadcasts
    const messagesChannel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              sender_id: newMsg.sender_id,
              content: newMsg.content,
              timestamp: new Date(newMsg.created_at),
            },
          ]);
        }
      )
      .on("broadcast", { event: "control" }, (payload) => {
        const type = (payload?.payload as any)?.type;
        if (type === "end" && onSessionEnded) {
          onSessionEnded();
        }
      })
      .subscribe();

    channelRef.current = messagesChannel;

    // Listen for session end
    const sessionChannel = supabase
      .channel(`session-end-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new.ended_at && onSessionEnded) {
            onSessionEnded();
          }
        }
      )
      .subscribe();

    // Check if partner is connected
    setPartnerConnected(true);

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(sessionChannel);
      channelRef.current = null;
    };
  }, [sessionId, onSessionEnded]);

  const sendMessage = async (content: string) => {
    if (!sessionId || !content.trim() || !userId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        session_id: sessionId,
        sender_id: userId,
        content: content.trim(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      // Notify partner immediately via realtime broadcast
      try {
        await channelRef.current?.send({
          type: "broadcast",
          event: "control",
          payload: { type: "end" },
        });
      } catch (e) {
        console.warn("Broadcast send failed (will rely on DB update)", e);
      }

      // Persist session end in database (fallback + consistency)
      await supabase
        .from("chat_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  return { messages, sendMessage, endSession, partnerConnected };
};
