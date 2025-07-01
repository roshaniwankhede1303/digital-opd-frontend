// src/hooks/useSocket.ts
import { useState, useEffect } from "react";
import { socketService } from "../services/socketService";

export const useSocket = (serverUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect(serverUrl);

    const unsubscribe = socketService.onConnectionChange(setIsConnected);

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [serverUrl]);

  return {
    isConnected,
    sendTestRequest: socketService.sendTestRequest.bind(socketService),
    sendDiagnosis: socketService.sendDiagnosis.bind(socketService),
    onMessage: socketService.onMessage.bind(socketService),
  };
};
