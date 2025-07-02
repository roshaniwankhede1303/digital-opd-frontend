import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>("unknown");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
      setNetworkType(state.type || "unknown");
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      setIsOnline(!!state.isConnected);
      setNetworkType(state.type || "unknown");
    });

    return unsubscribe;
  }, []);

  return { isOnline, networkType };
}
