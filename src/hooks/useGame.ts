import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Global socket instance outside of React
let globalSocket: Socket | null = null;

export function useGame() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventName, setEventName] = useState<string>("next-patient");
  const [testScore, setTestScore] = useState<number>(0);
  const [diagnosisScore, setDiagnosisScore] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [isLoadingNextPatient, setIsLoadingNextPatient] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [showScore, setShowScore] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);

  console.log("isLoadingNextPatient", isLoadingNextPatient);

  // Initialize global socket only once
  useEffect(() => {
    if (globalSocket) {
      setIsConnected(globalSocket.connected);
      return;
    }

    const SOCKET_URL = "http://192.168.1.33:3000";
    console.log("🔌 Creating global socket connection to:", SOCKET_URL);

    globalSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      upgrade: false,
      rememberUpgrade: false,
      autoConnect: true,
    });

    globalSocket.on("connect", () => {
      console.log("✅ Global socket connected!");
      setIsConnected(true);
    });

    globalSocket.on("disconnect", (reason) => {
      console.log("❌ Global socket disconnected:", reason);
      setIsConnected(false);
    });

    globalSocket.on("error", (error) => {
      console.error("🚨 Global socket error:", error);
    });

    return () => {
      // Don't disconnect on component unmount
      console.log("🔄 Component cleanup - keeping socket alive");
    };
  }, []);

  // Handle initial game join
  useEffect(() => {
    if (globalSocket && isConnected && !hasJoined) {
      console.log("🎮 Initial game join");
      globalSocket.emit("join");
      setHasJoined(true);
    }
  }, [isConnected, hasJoined]);

  // Set up game listeners
  useEffect(() => {
    if (!globalSocket) return;

    console.log("🎮 Setting up game listeners");

    const handleGameReady = (data: any) => {
      console.log("Game ready");
      setIsReady(true);
    };

    const handleCaseStarted = (data: any) => {
      console.log("✅ case started:", data);
      setMessages([]);
      setPatientInfo({
        patientName: data?.patient_info,
        patientQuery: data?.patient_query,
      });
      setIsReady(true);
      setTestScore(0);
      setDiagnosisScore(0);
      setEventName("submit-test");
      setShowScore(false);
      setIsLoadingNextPatient(false);
    };

    const handleSeniorDoctorMessage = (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: data.message,
          sender: "ai",
          testResult: "",
        },
      ]);

      setTestScore(data.test_score ? data?.test_score : 0);
      setDiagnosisScore(data.diagnosis_score ? data.diagnosis_score : 0);

      if (data.next_event === "next-patient") {
        setTimeout(() => {
          setShowScore(true);
        }, 2000);
      } else {
        setEventName(data.next_event);
      }

      setIsLoading(false);
    };

    globalSocket.on("game_ready", handleGameReady);
    globalSocket.on("case_started", handleCaseStarted);
    globalSocket.on("senior_doctor_message", handleSeniorDoctorMessage);

    return () => {
      globalSocket?.off("game_ready", handleGameReady);
      globalSocket?.off("case_started", handleCaseStarted);
      globalSocket?.off("senior_doctor_message", handleSeniorDoctorMessage);
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!globalSocket || !isReady) {
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
      globalSocket.emit(eventName, content);
      return true;
    },
    [isReady, eventName]
  );

  // Ultra-simple next patient handler
  const handleNextPatient = useCallback(() => {
    console.log("🔄 Next patient clicked");

    // Use the simplest possible approach
    if (globalSocket && globalSocket.connected) {
      console.log("🚀 Emitting next-patient");
      globalSocket.emit("next-patient");
    } else {
      console.error("❌ Global socket not connected");
    }
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    isConnected,
    isReady,
    testScore,
    diagnosisScore,
    eventName,
    handleNextPatient,
    patientInfo,
    isLoadingNextPatient,
    showScore,
  };
}
