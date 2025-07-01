// src/services/syncService.ts
import { databaseService } from "./database";
import { socketService } from "./socketService";
import { UserAction, ChatMessage, GameSession } from "../utils/types";

class SyncService {
  private syncInProgress = false;
  private syncCallbacks: ((status: "syncing" | "synced" | "error") => void)[] =
    [];

  async performSync(): Promise<boolean> {
    if (this.syncInProgress) {
      return false;
    }

    if (!socketService.isConnected()) {
      console.log("Cannot sync: not connected to server");
      return false;
    }

    this.syncInProgress = true;
    this.notifyCallbacks("syncing");

    try {
      // Get all unsynced actions
      const unsyncedActions = await databaseService.getUnsyncedActions();

      if (unsyncedActions.length === 0) {
        this.syncInProgress = false;
        this.notifyCallbacks("synced");
        return true;
      }

      console.log(`Syncing ${unsyncedActions.length} actions...`);

      // Group actions by patient for batch processing
      const actionsByPatient = this.groupActionsByPatient(unsyncedActions);

      // Process each patient's actions
      for (const [patientId, actions] of Object.entries(actionsByPatient)) {
        await this.syncPatientActions(patientId, actions);
      }

      console.log("Sync completed successfully");
      this.syncInProgress = false;
      this.notifyCallbacks("synced");
      return true;
    } catch (error) {
      console.error("Sync failed:", error);
      this.syncInProgress = false;
      this.notifyCallbacks("error");
      return false;
    }
  }

  private groupActionsByPatient(
    actions: UserAction[]
  ): Record<string, UserAction[]> {
    return actions.reduce((groups, action) => {
      if (!groups[action.patientId]) {
        groups[action.patientId] = [];
      }
      groups[action.patientId].push(action);
      return groups;
    }, {} as Record<string, UserAction[]>);
  }

  private async syncPatientActions(
    patientId: string,
    actions: UserAction[]
  ): Promise<void> {
    // Sort actions by timestamp to maintain order
    const sortedActions = actions.sort((a, b) => a.timestamp - b.timestamp);

    for (const action of sortedActions) {
      try {
        // Send action to server via socket
        if (action.type === "test_request") {
          socketService.sendTestRequest(
            patientId,
            action.content,
            action.attempt
          );
        } else if (action.type === "diagnosis_submission") {
          socketService.sendDiagnosis(
            patientId,
            action.content,
            action.attempt
          );
        }

        // Mark as synced locally
        await databaseService.markActionAsSynced(action.id);

        // Small delay to avoid overwhelming the server
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        throw error;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Event subscription
  onSyncStatusChange(
    callback: (status: "syncing" | "synced" | "error") => void
  ): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyCallbacks(status: "syncing" | "synced" | "error") {
    this.syncCallbacks.forEach((callback) => callback(status));
  }

  // Auto-sync when connection is restored
  setupAutoSync() {
    socketService.onConnectionChange((connected) => {
      if (connected) {
        // Wait a bit for connection to stabilize
        setTimeout(() => {
          this.performSync();
        }, 1000);
      }
    });
  }

  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

export const syncService = new SyncService();
