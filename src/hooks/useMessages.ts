import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

export function useChatMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    console.log("🔧 SETTING UP LISTENERS");

    // CRITICAL: Handle game_initialized
    const handleGameInit = (data: any) => {
      console.log("🎮 GAME_INITIALIZED RECEIVED:", data);

      if (data.sessionId) {
        console.log("✅ SETTING SESSION ID:", data.sessionId);
        setSessionId(data.sessionId);
        setGameState(data.gameState);
      }
    };

    const handleAIResponse = (data: any) => {
      console.log("🤖 AI_RESPONSE:", data);
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          content: data.message,
          sender: "ai",
        },
      ]);
      setIsLoading(false);
    };

    const handlePong = (data: any) => {
      console.log("🏓 PONG:", data);
    };

    // Register listeners
    socket.on("game_initialized", handleGameInit);
    socket.on("ai_response", handleAIResponse);
    socket.on("pong", handlePong);

    // Log ALL events for debugging
    socket.onAny((eventName, ...args) => {
      // console.log(`📡 EVENT: ${eventName}`, args);
    });

    return () => {
      socket.off("game_initialized", handleGameInit);
      socket.off("ai_response", handleAIResponse);
      socket.off("pong", handlePong);
      socket.offAny();
    };
  }, [socket]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!socket || !sessionId) {
        console.error("❌ CANNOT SEND - NO SOCKET OR SESSION");
        return false;
      }

      console.log("📤 SENDING:", content);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content,
          sender: "user",
        },
      ]);
      setIsLoading(true);

      socket.emit("user_message", {
        message: content,
        sessionId,
        gameState,
      });

      return true;
    },
    [socket, sessionId, gameState]
  );

  const restartGame = useCallback(() => {
    if (socket) {
      console.log("🔄 RESTART");
      setMessages([]);
      setSessionId(null);
      setGameState(null);
      socket.emit("restart_game");
    }
  }, [socket]);

  const sendPing = useCallback(() => {
    if (socket) {
      console.log("🏓 PING");
      socket.emit("ping");
    }
  }, [socket]);

  return {
    messages,
    sendMessage,
    restartGame,
    sendPing,
    isLoading,
    isConnected,
    sessionId,
    gameState,
  };
}
