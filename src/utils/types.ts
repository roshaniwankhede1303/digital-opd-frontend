// src/utils/types.ts
export interface Patient {
  id: string;
  // name: string;
  age: number;
  gender: "Male" | "Female";
  history: string;
  symptoms: string;
  additionalInfo: string;
}

export interface PatientCase {
  id: string;
  patient: Patient;
  correctTest: string;
  correctDiagnosis: string;
}

export interface ChatMessage {
  id: string;
  type: "patient" | "doctor" | "user" | "system";
  content: string;
  timestamp: number;
  patientId: string;
  points?: number;
}

export interface UserAction {
  id: string;
  patientId: string;
  type: "test_request" | "diagnosis_submission";
  content: string;
  timestamp: number;
  synced: boolean;
  attempt: number;
}

export interface GameSession {
  id: string;
  patientId: string;
  userId: string;
  testAttempts: number;
  diagnosisAttempts: number;
  totalPoints: number;
  labTestPoints: number;
  diagnosisPoints: number;
  isCompleted: boolean;
  startedAt: number;
  completedAt?: number;
}

export interface ConnectionStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: number;
}
