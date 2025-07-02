// import { chatService } from "./chatService";

// let syncInterval: ReturnType<typeof setInterval> | null = null;
// let isSyncing = false;

// const syncQueuedActions = async (
//   queuedActions: QueuedAction[],
//   removeQueuedAction: (id: string) => Promise<void>,
//   saveQueuedAction: (action: QueuedAction) => Promise<void>
// ): Promise<void> => {
//   for (const action of queuedActions) {
//     try {
//       await chatService.processQueuedAction(action);
//       await removeQueuedAction(action.id);
//     } catch (error) {
//       console.error("Failed to sync queued action:", error);
//       // Increment retry count
//       const updatedAction = { ...action, retryCount: action.retryCount + 1 };
//       if (updatedAction.retryCount < 3) {
//         await saveQueuedAction(updatedAction);
//       } else {
//         // Remove after 3 failed attempts
//         await removeQueuedAction(action.id);
//       }
//     }
//   }
// };

// const startAutoSync = (
//   getQueuedActions: () => Promise<QueuedAction[]>,
//   removeQueuedAction: (id: string) => Promise<void>,
//   saveQueuedAction: (action: QueuedAction) => Promise<void>
// ) => {
//   if (syncInterval) return;

//   syncInterval = setInterval(async () => {
//     await syncIfOnline(getQueuedActions, removeQueuedAction, saveQueuedAction);
//   }, 30000); // Sync every 30 seconds
// };

// const stopAutoSync = () => {
//   if (syncInterval) {
//     clearInterval(syncInterval);
//     syncInterval = null;
//   }
// };

// const syncIfOnline = async (
//   getQueuedActions: () => Promise<QueuedAction[]>,
//   removeQueuedAction: (id: string) => Promise<void>,
//   saveQueuedAction: (action: QueuedAction) => Promise<void>
// ) => {
//   if (isSyncing) return;

//   try {
//     isSyncing = true;
//     const queuedActions = await getQueuedActions();
//     await syncQueuedActions(
//       queuedActions,
//       removeQueuedAction,
//       saveQueuedAction
//     );
//   } catch (error) {
//     console.error("Sync failed:", error);
//   } finally {
//     isSyncing = false;
//   }
// };

// const forceSync = async (
//   getQueuedActions: () => Promise<QueuedAction[]>,
//   removeQueuedAction: (id: string) => Promise<void>,
//   saveQueuedAction: (action: QueuedAction) => Promise<void>
// ) => {
//   await syncIfOnline(getQueuedActions, removeQueuedAction, saveQueuedAction);
// };

// export const syncService = {
//   startAutoSync,
//   stopAutoSync,
//   syncIfOnline,
//   forceSync,
// };
