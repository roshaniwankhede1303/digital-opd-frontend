export interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: number;
  patient_id: string;
  testResult?: string;
  synced?: boolean;
}

export interface PatientInfo {
  patientName: string;
  patientQuery: string;
}

export interface GameSession {
  id?: number;
  patient_id: string;
  patient_name: string;
  patient_query: string;
  test_score: number;
  diagnosis_score: number;
  stage: "intro" | "test" | "diagnosis" | "done";
  synced?: boolean;
  created_at?: string;
  completed_at?: string;
}

export interface OfflineQueueItem {
  id: number;
  eventType: string;
  eventData: any;
  timestamp: number;
  synced?: boolean;
}

export interface NetworkState {
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
  rawIsConnected: boolean;
}

export interface SyncStatus {
  status: "idle" | "syncing" | "synced" | "sync_failed";
  message?: string;
}

export type SyncCallback = (status: string) => void;
