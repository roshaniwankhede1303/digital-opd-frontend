import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNetworkStatus } from "../services/networkService";
import * as SyncService from "../services/syncService";
import * as DatabaseService from "../services/databaseService";
import { Message, PatientInfo, GameSession } from "../utils/types";

// Global socket instance outside of React
let globalSocket: Socket | null = null;

interface GameData {
  patient_info?: string;
  patient_query?: string;
  message?: string;
  test_score?: number;
  diagnosis_score?: number;
  next_event?: string;
}

interface UseGameReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<boolean>;
  isLoading: boolean;
  isConnected: boolean;
  isReady: boolean;
  testScore: number;
  diagnosisScore: number;
  eventName: string;
  handleNextPatient: () => void;
  patientInfo: PatientInfo | null;
  isLoadingNextPatient: boolean;
  showScore: boolean;
  isInitialLoading: boolean;
  isNetworkConnected: boolean;
  connectionType: string | null;
  syncStatus: string;
  patientQuery?: string;
  handleRetrySync: () => void;
  queuedEventsCount: number;
}

export function useGame(): UseGameReturn {
  // Game state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>("next-patient");
  const [testScore, setTestScore] = useState<number>(0);
  const [diagnosisScore, setDiagnosisScore] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isLoadingNextPatient, setIsLoadingNextPatient] =
    useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [showScore, setShowScore] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string>("idle");
  const [queuedEventsCount, setQueuedEventsCount] = useState<number>(0);

  // Network status with NetInfo
  const { isConnected: isNetworkConnected, connectionType } =
    useNetworkStatus();

  // Refs
  const currentPatientIdRef = useRef<string>("default");
  const previousNetworkState = useRef<boolean>(isNetworkConnected);

  // Update queued events count
  const updateQueuedCount = useCallback(async () => {
    const count = await SyncService.getQueuedEventCount();
    setQueuedEventsCount(count);
  }, []);

  // Sync status callback
  useEffect(() => {
    const handleSyncStatus = (status: string): void => {
      setSyncStatus(status);
      // Update queued count after sync operations
      if (status === "synced" || status === "sync_failed") {
        updateQueuedCount();
      }
    };

    SyncService.addSyncCallback(handleSyncStatus);
    return () => SyncService.removeSyncCallback(handleSyncStatus);
  }, [updateQueuedCount]);

  // Handle network state changes - CONDITIONAL SYNC
  useEffect(() => {
    const handleNetworkChange = async () => {
      // Network just came back online
      console.log(
        "📡 Network restored - switching to ONLINE mode",
        !previousNetworkState.current,
        isNetworkConnected
      );
      if (previousNetworkState.current && isNetworkConnected) {
        // Simple force reconnection
        setTimeout(() => {
          if (globalSocket && !globalSocket.connected) {
            console.log(
              "🔄 Forcing socket reconnection due to network restoration"
            );
            globalSocket.connect();
          }
        }, 1500); // Give network time to stabilize

        // Update queued count
        setTimeout(async () => {
          await updateQueuedCount();
        }, 2000);
      }

      // Network went offline
      else if (previousNetworkState.current && !isNetworkConnected) {
        console.log("📱 Network lost - switching to OFFLINE mode");
        setIsConnected(false);
      }

      previousNetworkState.current = isNetworkConnected;
    };

    handleNetworkChange();
  }, [isNetworkConnected, queuedEventsCount, updateQueuedCount]);

  // Load offline data on app start
  useEffect(() => {
    const loadOfflineData = async (): Promise<void> => {
      try {
        console.log("🔄 Loading offline data...");

        // Load latest game session
        const latestSession: GameSession | null =
          await DatabaseService.getLatestGameSession();
        if (latestSession) {
          console.log("📱 Found offline session:", latestSession.patient_name);
          setPatientInfo({
            patientName: latestSession.patient_name,
            patientQuery: latestSession.patient_query,
          });
          setTestScore(latestSession.test_score || 0);
          setDiagnosisScore(latestSession.diagnosis_score || 0);
          currentPatientIdRef.current = latestSession.patient_id;
        }

        // Load offline messages
        const offlineMessages: Message[] = await SyncService.getOfflineMessages(
          currentPatientIdRef.current
        );
        if (offlineMessages.length > 0) {
          console.log("📱 Found", offlineMessages.length, "offline messages");
          setMessages(offlineMessages);
        }

        // Update queued events count
        await updateQueuedCount();

        setIsInitialLoading(false);

        // Allow offline usage
        setIsReady(true);
      } catch (error) {
        console.error("❌ Error loading offline data:", error);
        setIsInitialLoading(false);
        setIsReady(true); // Still allow usage even if offline data fails
      }
    };

    loadOfflineData();
  }, [updateQueuedCount]);

  // Initialize socket connection - CONDITIONAL
  useEffect(() => {
    if (!isNetworkConnected) {
      console.log("📱 OFFLINE MODE - No socket connection");
      setIsConnected(false);
      setHasJoined(false);
      if (globalSocket) {
        globalSocket.disconnect();
      }
      return;
    }

    console.log("🌐 ONLINE MODE - Establishing socket connection");

    if (globalSocket?.connected) {
      setIsConnected(true);
      return;
    }

    const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_BASE_URL;
    console.log("🔌 Creating socket connection to:", SOCKET_URL);

    if (globalSocket) {
      globalSocket.connect();
    } else {
      globalSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        upgrade: false,
        rememberUpgrade: false,
        autoConnect: true,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    globalSocket.on("connect", async () => {
      console.log("✅ Socket connected - ONLINE MODE active");
      setIsConnected(true);

      // Update queued count and sync if needed
      await updateQueuedCount();
      if (queuedEventsCount > 0) {
        console.log(`🔄 Auto-syncing ${queuedEventsCount} offline items...`);
        setTimeout(() => {
          SyncService.syncOfflineData(globalSocket!);
        }, 500);
      }
    });

    globalSocket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setHasJoined(false);
    });

    globalSocket.on("error", (error: Error) => {
      console.error("🚨 Socket error:", error);
      setIsConnected(false);
    });

    return () => {
      console.log("🔄 Component cleanup - keeping socket alive");
    };
  }, [isNetworkConnected, queuedEventsCount, updateQueuedCount]);

  // Handle initial game join - CONDITIONAL
  useEffect(() => {
    if (globalSocket && isConnected && !hasJoined && isNetworkConnected) {
      console.log("🎮 Initial game join - ONLINE MODE");
      globalSocket.emit("join");
      setHasJoined(true);
    }
  }, [isConnected, hasJoined, isNetworkConnected]);

  // Set up game listeners - ONLINE MODE ONLY
  useEffect(() => {
    if (!globalSocket || !isNetworkConnected) return;

    console.log("🎮 Setting up game listeners - ONLINE MODE");

    const handleGameReady = (data: any): void => {
      console.log("🌐 Game ready - ONLINE MODE");
      setIsReady(true);
    };

    const handleCaseStarted = async (data: GameData): Promise<void> => {
      console.log("✅ Case started - ONLINE MODE:", data);

      const patientId = `patient_${Date.now()}`;
      currentPatientIdRef.current = patientId;

      setMessages([]);
      setPatientInfo({
        patientName: data?.patient_info || "",
        patientQuery: data?.patient_query || "",
      });
      setIsReady(true);
      setTestScore(0);
      setDiagnosisScore(0);
      setEventName("submit-test");
      setShowScore(false);
      setIsInitialLoading(false);
      setIsLoadingNextPatient(false);

      // Save to offline storage as backup
      await SyncService.saveGameSessionOffline({
        patient_id: patientId,
        patient_name: data?.patient_info || "",
        patient_query: data?.patient_query || "",
        test_score: 0,
        diagnosis_score: 0,
        stage: "test",
      });

      // Update queued count
      await updateQueuedCount();
    };

    const handleSeniorDoctorMessage = async (data: GameData): Promise<void> => {
      console.log("🌐 Senior doctor message - ONLINE MODE:", data);

      const message: Message = {
        id: Date.now(),
        content: data.message || "",
        sender: "ai",
        timestamp: Date.now(),
        patient_id: currentPatientIdRef.current,
        testResult: "",
      };

      setMessages((prev) => [...prev, message]);

      // Save message offline as backup
      await SyncService.saveMessageOffline(message);

      setTestScore(data.test_score ? data.test_score : 0);
      setDiagnosisScore(data.diagnosis_score ? data.diagnosis_score : 0);

      if (data.next_event === "next-patient") {
        setTimeout(() => {
          setShowScore(true);
        }, 2000);
      } else {
        setEventName(data.next_event || "submit-test");
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
  }, [isNetworkConnected, updateQueuedCount]);

  // CONDITIONAL sendMessage function
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!isReady) {
        console.error("❌ Not ready to send");
        return false;
      }

      const message: Message = {
        id: Date.now(),
        content,
        sender: "user",
        timestamp: Date.now(),
        patient_id: currentPatientIdRef.current,
      };

      setMessages((prev) => [...prev, message]);

      if (isNetworkConnected && globalSocket?.connected) {
        // ONLINE MODE: Send immediately
        console.log("🌐 ONLINE MODE: Sending message immediately");
        setIsLoading(true);
        globalSocket.emit(eventName, content);

        // Also save offline as backup
        await SyncService.saveMessageOffline(message);
      } else {
        // OFFLINE MODE: Save for later sync
        console.log("📱 OFFLINE MODE: Saving message for later sync");
        await SyncService.saveMessageOffline(message);
        await SyncService.addEventToQueue(eventName, content);
        await updateQueuedCount();

        // Simulate loading briefly to show user it's processing
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
      }

      return true;
    },
    [isReady, eventName, isNetworkConnected, updateQueuedCount]
  );

  // CONDITIONAL handleNextPatient function
  const handleNextPatient = useCallback(async (): Promise<void> => {
    console.log("🔄 Next patient clicked");

    if (isNetworkConnected && globalSocket?.connected) {
      // ONLINE MODE: Send immediately
      console.log("🌐 ONLINE MODE: Requesting next patient immediately");
      setIsLoadingNextPatient(true);
      globalSocket.emit("next-patient");
    } else {
      // OFFLINE MODE: Queue for later
      console.log("📱 OFFLINE MODE: Queuing next patient request");
      await SyncService.addEventToQueue("next-patient", {});
      await updateQueuedCount();

      // Reset score screen and show feedback
      setShowScore(false);
      // You could show a toast or alert here
      console.log("📱 Next patient request saved for sync");
    }
  }, [isNetworkConnected, updateQueuedCount]);

  // Manual retry sync
  const handleRetrySync = useCallback(async (): Promise<void> => {
    if (globalSocket?.connected && isNetworkConnected) {
      console.log("🔄 Manual retry sync requested");
      await SyncService.forceRetrySync(globalSocket);
      await updateQueuedCount();
    } else {
      console.log("⚠️ Cannot retry sync - not connected");
    }
  }, [isNetworkConnected, updateQueuedCount]);

  // Cleanup function for unmounting
  useEffect(() => {
    return () => {
      // Clean up sync callbacks
      SyncService.removeSyncCallback(() => {});
    };
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    isConnected: isNetworkConnected && isConnected,
    isReady,
    testScore,
    diagnosisScore,
    eventName,
    handleNextPatient,
    patientInfo,
    isLoadingNextPatient,
    showScore,
    isInitialLoading,
    // Network-specific returns
    isNetworkConnected,
    connectionType,
    syncStatus,
    patientQuery: patientInfo?.patientQuery,
    handleRetrySync,
    queuedEventsCount,
  };
}
