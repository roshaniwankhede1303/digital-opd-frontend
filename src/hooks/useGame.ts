import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

export function useGame() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [eventName, setEventName] = useState<string>();
  const [testScore, setTestScore] = useState<number>(0);
  const [diagnosisScore, setDiagnosisScore] = useState<number>(0);

  const [isReady, setIsReady] = useState(false);
  const { socket, isConnected } = useSocket();
  useEffect(() => {
    console.log("🎮 scores new", testScore, diagnosisScore);
  }, [testScore, diagnosisScore]);

  useEffect(() => {
    if (!socket) return;

    console.log("🎮 Setting up game listeners");

    // 🔥 LOG ALL INCOMING EVENTS
    socket.onAny((eventName, ...args) => {
      console.log(`📡 [EVENT] ${eventName}:`, args);
    });

    // Log all outgoing events too
    socket.onAnyOutgoing((eventName, ...args) => {
      // console.log(`📤 [SENT] ${eventName}:`, args);
    });

    socket.on("game_ready", (data) => {
      setIsReady(true);
    });

    socket.on("case_started", (data) => {
      // console.log("✅ case started:", data);
      setGameData(data.gameData);
      setIsReady(true);
      setTestScore(0);
      setDiagnosisScore(0);
    });

    socket.on("senior_doctor_message", (data) => {
      // console.log("🤖 AI response:", data);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: data.message,
          sender: "ai",
          testResult: "",
        },
      ]);

      // setGameData(data);

      setEventName(data.next_event);
      setTestScore(data.testScore ? data.testScore : 0);
      setDiagnosisScore(data.diagnosisScore ? data.diagnosisScore : 0);
      setIsLoading(false);
      // console.log("🤖 event name:", data.next_event);
    });

    return () => {
      // socket.off("game_ready");
      // socket.off("ai_response");
    };
  }, [socket]);

  const sendMessage = useCallback(
    async (content: string) => {
      const eventNameUpdated = eventName;
      if (!socket || !isReady) {
        console.error("❌ Not ready to send");
        return false;
      }

      // console.log("📤 Sending:", eventNameUpdated, content);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content,
          sender: "user",
        },
      ]);

      setIsLoading(true);
      socket.emit(eventNameUpdated, content);
      return true;
    },
    [socket, isReady, eventName]
  );

  const restartGame = useCallback(() => {
    if (socket) {
      console.log("🔄 Restarting");
      setMessages([]);
      socket.on("case_started", (data) => {
        // console.log("✅ case started:", data);
        setGameData(data.gameData);
        setIsReady(true);
        setTestScore(0);
        setDiagnosisScore(0);
      });
    }
  }, [socket]);

  return {
    messages,
    sendMessage,
    restartGame,
    isLoading,
    isConnected,
    gameData,
    isReady,
    testScore,
    diagnosisScore,
  };
}
