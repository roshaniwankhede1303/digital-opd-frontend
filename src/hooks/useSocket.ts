import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const SOCKET_URL = "http://192.168.1.33:3000"; // UPDATE THIS

    console.log("🔌 Connecting to:", SOCKET_URL);

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      console.log("✅ Connected!");
      setIsConnected(true);
      socketRef.current?.emit("join");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected");
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { socket: socketRef.current, isConnected };
}
