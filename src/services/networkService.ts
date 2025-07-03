import NetInfo from "@react-native-community/netinfo";
import { useState, useEffect } from "react";

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    // Get initial network state
    const getInitialState = async () => {
      try {
        const state = await NetInfo.fetch();
        console.log("📡 Initial network state:", state);
        setIsConnected(state.isConnected);
        setConnectionType(state.type);
        setIsInternetReachable(state.isInternetReachable);
      } catch (error) {
        console.error("❌ Error fetching initial network state:", error);
        setIsConnected(false);
      }
    };

    getInitialState();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("📡 Network state changed:", {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });

      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // More accurate connectivity check
  const isReallyConnected = isConnected && isInternetReachable !== false;

  return {
    isConnected: isReallyConnected,
    connectionType,
    isInternetReachable,
    rawIsConnected: isConnected,
  };
};

export const checkInternetConnectivity = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      connectionType: state.type,
      hasStrongConnection:
        state.isConnected &&
        state.isInternetReachable &&
        (state.type === "wifi" ||
          (state.type === "cellular" &&
            state.details?.cellularGeneration === "4g")),
    };
  } catch (error) {
    console.error("❌ Error checking connectivity:", error);
    return {
      isConnected: false,
      isInternetReachable: false,
      connectionType: "unknown",
      hasStrongConnection: false,
    };
  }
};
