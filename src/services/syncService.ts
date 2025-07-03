import { checkInternetConnectivity } from "./networkService";
import {
  Message,
  GameSession,
  OfflineQueueItem,
  SyncCallback,
} from "../utils/types";
import { Socket } from "socket.io-client";
import * as DatabaseService from "./databaseService";

// Module-level state
let isSyncing = false;
let syncCallbacks: SyncCallback[] = [];
let retryAttempts = 0;
const maxRetryAttempts = 3;

export const addSyncCallback = (callback: SyncCallback): void => {
  syncCallbacks.push(callback);
};

export const removeSyncCallback = (callback: SyncCallback): void => {
  syncCallbacks = syncCallbacks.filter((cb) => cb !== callback);
};

const notifyCallbacks = (status: string): void => {
  syncCallbacks.forEach((callback) => callback(status));
};

export const syncOfflineData = async (
  socket: Socket,
  forceRetry: boolean = false
): Promise<boolean> => {
  if (isSyncing && !forceRetry) {
    console.log("⚠️ Sync already in progress");
    return false;
  }

  // Check network connectivity first
  const connectivity = await checkInternetConnectivity();
  if (!connectivity.isConnected || !connectivity.isInternetReachable) {
    console.log("⚠️ No internet connectivity for sync");
    return false;
  }

  if (!socket?.connected) {
    console.log("⚠️ Socket not connected for sync");
    return false;
  }

  isSyncing = true;
  notifyCallbacks("syncing");

  try {
    console.log("🔄 Starting offline data sync...");

    // Get offline queue
    const offlineQueue: OfflineQueueItem[] =
      await DatabaseService.getOfflineQueue();
    console.log("📤 Syncing", offlineQueue.length, "offline events");

    if (offlineQueue.length === 0) {
      console.log("✅ No offline data to sync");
      notifyCallbacks("synced");
      return true;
    }

    // Process each queued event
    let syncedCount = 0;
    for (const item of offlineQueue) {
      try {
        console.log("📤 Syncing event:", item.eventType);

        // Check connectivity before each sync
        const currentConnectivity = await checkInternetConnectivity();
        if (!currentConnectivity.isConnected) {
          console.log("⚠️ Lost connectivity during sync");
          throw new Error("Lost connectivity");
        }

        // Emit the event to server with timeout
        await emitWithTimeout(socket, item.eventType, item.eventData, 5000);

        // Mark as synced
        await DatabaseService.markQueueItemSynced(item.id);
        syncedCount++;

        // Small delay to avoid overwhelming server
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error("❌ Error syncing event:", item.eventType, error);
        // Continue with other items
      }
    }

    // Clean up synced data
    await DatabaseService.clearSyncedData();

    console.log(
      `✅ Offline data sync completed - ${syncedCount}/${offlineQueue.length} items synced`
    );
    notifyCallbacks("synced");
    retryAttempts = 0; // Reset retry attempts on success

    return true;
  } catch (error) {
    console.error("❌ Sync failed:", error);
    retryAttempts++;

    if (retryAttempts < maxRetryAttempts) {
      console.log(
        `🔄 Will retry sync (attempt ${retryAttempts}/${maxRetryAttempts})`
      );
      // Retry after delay
      setTimeout(() => {
        syncOfflineData(socket, true);
      }, 2000 * retryAttempts); // Exponential backoff
    } else {
      console.log("❌ Max retry attempts reached");
      notifyCallbacks("sync_failed");
    }

    return false;
  } finally {
    isSyncing = false;

    // Reset status after delay if successful
    if (retryAttempts === 0) {
      setTimeout(() => {
        notifyCallbacks("idle");
      }, 3000);
    }
  }
};

const emitWithTimeout = async (
  socket: Socket,
  eventType: string,
  eventData: any,
  timeout: number = 5000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Socket emit timeout"));
    }, timeout);

    try {
      socket.emit(eventType, eventData);
      clearTimeout(timer);
      resolve();
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
};

export const forceRetrySync = async (socket: Socket): Promise<boolean> => {
  console.log("🔄 Force retry sync requested");
  retryAttempts = 0; // Reset retry attempts
  return await syncOfflineData(socket, true);
};

export const saveMessageOffline = async (
  message: Omit<Message, "id">
): Promise<number | null> => {
  return await DatabaseService.saveMessage(message);
};

export const getOfflineMessages = async (
  patientId: string
): Promise<Message[]> => {
  return await DatabaseService.getMessages(patientId);
};

export const saveGameSessionOffline = async (
  session: Omit<GameSession, "id">
): Promise<number | null> => {
  return await DatabaseService.saveGameSession(session);
};

export const addEventToQueue = async (
  eventType: string,
  eventData: any
): Promise<number | null> => {
  return await DatabaseService.addToOfflineQueue(eventType, eventData);
};

export const getQueuedEventCount = async (): Promise<number> => {
  const queue = await DatabaseService.getOfflineQueue();
  return queue.length;
};
