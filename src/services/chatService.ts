// import { GamePhase, Message, QueuedAction } from "../utils/types";

// const API_URL =
//   process.env.EXPO_PUBLIC_SOCKET_BASE_URL || "http://localhost:3000";

// const queueMessage = async (
//   message: Message,
//   phase: GamePhase
// ): Promise<QueuedAction> => {
//   const queuedAction: QueuedAction = {
//     id: Date.now().toString() + "_chat",
//     type: "message",
//     data: { message, phase },
//     timestamp: new Date().toISOString(),
//     patientId: message.patientId,
//     synced: false,
//     retryCount: 0,
//   };

//   return queuedAction;
// };

// const sendMessage = async (
//   message: string,
//   patientId: string,
//   phase: GamePhase
// ): Promise<any> => {
//   const response = await fetch(`${API_URL}/api/chat`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       message,
//       patientId,
//       phase,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to send message");
//   }

//   return response.json();
// };

// const processQueuedAction = async (action: QueuedAction): Promise<void> => {
//   const response = await fetch(`${API_URL}/api/sync`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       type: action.type,
//       data: action.data,
//       patientId: action.patientId,
//       timestamp: action.timestamp,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to sync action");
//   }
// };

// export const chatService = {
//   queueMessage,
//   sendMessage,
//   processQueuedAction,
// };
