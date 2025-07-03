import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const SOCKET_URL = "http://192.168.1.33:3000";

    console.log("🔌 Connecting to:", SOCKET_URL);

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      upgrade: false,
      rememberUpgrade: false,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected!");
      setIsConnected(true);
      // Remove automatic join - let the game hook handle it
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Add a manual join function
  const joinGame = () => {
    if (socketRef.current && isConnected) {
      console.log("🎮 Joining game");
      socketRef.current.emit("join");
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinGame,
  };
}
