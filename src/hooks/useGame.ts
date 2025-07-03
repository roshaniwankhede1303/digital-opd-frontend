import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

export function useGame() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventName, setEventName] = useState<string>("next-patient");
  const [testScore, setTestScore] = useState<number>(0);
  const [diagnosisScore, setDiagnosisScore] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const { socket, isConnected } = useSocket();
  const [patientInfo, setPatientInfo] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    console.log("🎮 Setting up game listeners");

    // 🔥 LOG ALL INCOMING EVENTS
    socket.onAny((eventName, ...args) => {
      // console.log(`📡 [EVENT] ${eventName}:`, args);
    });

    // Log all outgoing events too
    socket.onAnyOutgoing((eventName, ...args) => {
      // console.log(`📤 [SENT] ${eventName}:`, args);
    });

    socket.on("game_ready", (data) => {
      setIsReady(true);
    });

    socket.on("case_started", (data) => {
      console.log("✅ case started:", data);
      setPatientInfo({
        ...patientInfo,
        patientName: data?.patient_info,
        patientQuery: data?.patient_query,
      });
      setIsReady(true);
      setTestScore(0);
      setDiagnosisScore(0);
    });

    socket.on("senior_doctor_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: data.message,
          sender: "ai",
          testResult: "",
        },
      ]);

      // Update scores immediately

      setTestScore(data.test_score ? data?.test_score : 0);
      setDiagnosisScore(data.diagnosis_score ? data.diagnosis_score : 0);

      // Set eventName immediately for other events, with delay for "next-patient"
      if (data.next_event === "next-patient") {
        setTimeout(() => {
          setEventName(data.next_event);
        }, 5000); // 2 seconds delay
      } else {
        setEventName(data.next_event); // Immediate for other events
      }

      setIsLoading(false);
    });

    return () => {
      // socket.off("game_ready");
      // socket.off("ai_response");
    };
  }, [socket]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!socket || !isReady) {
        console.error("❌ Not ready to send");
        return false;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content,
          sender: "user",
        },
      ]);

      setIsLoading(true);
      socket.emit(eventName, content);
      return true;
    },
    [socket, isReady, eventName, testScore, diagnosisScore]
  );

  const restartGame = useCallback(() => {
    if (socket) {
      console.log("🔄 Restarting");
      setMessages([]);
      socket.on("case_started", (data) => {
        // console.log("✅ case started:", data);
        setIsReady(true);
        setTestScore(0);
        setDiagnosisScore(0);
      });
    }
  }, [socket]);

  const handleNextPatient = useCallback(() => {
    setEventName("submit-test");
    console.log("🔄 Next patient");
    setIsReady(true);
    setTestScore(0);
    setDiagnosisScore(0);
    setMessages([]);
  }, []); // You're not even using socket here!

  return {
    messages,
    sendMessage,
    restartGame,
    isLoading,
    isConnected,
    isReady,
    testScore,
    diagnosisScore,
    eventName,
    handleNextPatient,
    patientInfo,
  };
}
