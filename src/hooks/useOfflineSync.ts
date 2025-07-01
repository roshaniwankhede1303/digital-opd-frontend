// src/hooks/useOfflineSync.ts
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { databaseService } from "../services/database";
import { socketService } from "../services/socketService";
import { ConnectionStatus } from "../utils/types";

export const useOfflineSync = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: false,
    isSyncing: false,
  });

  // Check for unsynced actions
  const { data: unsyncedActions = [] } = useQuery({
    queryKey: ["unsyncedActions"],
    queryFn: () => databaseService.getUnsyncedActions(),
    refetchInterval: 5000, // Check every 5 seconds
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (unsyncedActions.length === 0) return;

      setConnectionStatus((prev) => ({ ...prev, isSyncing: true }));

      try {
        // Send actions to server
        socketService.syncActions(unsyncedActions);

        // Mark as synced (in real implementation, wait for server confirmation)
        for (const action of unsyncedActions) {
          await databaseService.markActionAsSynced(action.id);
        }

        setConnectionStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncAt: Date.now(),
        }));
      } catch (error) {
        console.error("Sync failed:", error);
        setConnectionStatus((prev) => ({ ...prev, isSyncing: false }));
      }
    },
  });

  // Listen to connection changes
  useEffect(() => {
    const unsubscribe = socketService.onConnectionChange((connected) => {
      setConnectionStatus((prev) => ({ ...prev, isOnline: connected }));

      // Auto-sync when connection is restored
      if (connected && unsyncedActions.length > 0) {
        syncMutation.mutate();
      }
    });

    return unsubscribe;
  }, [unsyncedActions.length]);

  return {
    connectionStatus,
    unsyncedActionsCount: unsyncedActions.length,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending || connectionStatus.isSyncing,
  };
};
