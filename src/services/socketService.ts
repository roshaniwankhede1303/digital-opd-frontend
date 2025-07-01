// src/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { ChatMessage, UserAction } from "../utils/types";

class SocketService {
  private socket: Socket | null = null;
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];

  connect(serverUrl: string) {
    this.socket = io(serverUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.notifyConnectionCallbacks(true);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.notifyConnectionCallbacks(false);
    });

    this.socket.on("doctor_message", (data: ChatMessage) => {
      this.notifyMessageCallbacks(data);
    });

    this.socket.on("test_result", (data: ChatMessage) => {
      this.notifyMessageCallbacks(data);
    });

    this.socket.on("score_update", (data: any) => {
      // Handle score updates from server
      console.log("Score update received:", data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send user test request
  sendTestRequest(patientId: string, testName: string, attempt: number) {
    if (this.socket?.connected) {
      this.socket.emit("request_test", {
        patientId,
        testName,
        attempt,
        timestamp: Date.now(),
      });
    }
  }

  // Send user diagnosis
  sendDiagnosis(patientId: string, diagnosis: string, attempt: number) {
    if (this.socket?.connected) {
      this.socket.emit("submit_diagnosis", {
        patientId,
        diagnosis,
        attempt,
        timestamp: Date.now(),
      });
    }
  }

  // Sync unsynced actions
  syncActions(actions: UserAction[]) {
    if (this.socket?.connected && actions.length > 0) {
      this.socket.emit("sync_actions", {
        actions,
        timestamp: Date.now(),
      });
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event listeners
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  private notifyMessageCallbacks(message: ChatMessage) {
    this.messageCallbacks.forEach((callback) => callback(message));
  }
}

export const socketService = new SocketService();
