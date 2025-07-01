// src/services/database.ts
import * as SQLite from "expo-sqlite";
import {
  ChatMessage,
  UserAction,
  GameSession,
  PatientCase,
} from "../utils/types";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    this.db = await SQLite.openDatabaseAsync("digitalOpd.db");

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        patient_id TEXT NOT NULL,
        points INTEGER,
        synced INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS user_actions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        attempt INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        test_attempts INTEGER DEFAULT 0,
        diagnosis_attempts INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        lab_test_points INTEGER DEFAULT 0,
        diagnosis_points INTEGER DEFAULT 0,
        is_completed INTEGER DEFAULT 0,
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        synced INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS patient_cases (
        id TEXT PRIMARY KEY,
        patient_data TEXT NOT NULL,
        correct_test TEXT NOT NULL,
        correct_diagnosis TEXT NOT NULL
      );
    `);
  }

  // Chat Messages
  async saveChatMessage(message: ChatMessage): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO chat_messages 
       (id, type, content, timestamp, patient_id, points, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.type,
        message.content,
        message.timestamp,
        message.patientId,
        message.points || null,
        0,
      ]
    );
  }

  async getChatMessages(patientId: string): Promise<ChatMessage[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      `SELECT * FROM chat_messages WHERE patient_id = ? ORDER BY timestamp ASC`,
      [patientId]
    );

    return result.map((row: any) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      timestamp: row.timestamp,
      patientId: row.patient_id,
      points: row.points,
    }));
  }

  // User Actions
  async saveUserAction(action: UserAction): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO user_actions 
       (id, patient_id, type, content, timestamp, synced, attempt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        action.id,
        action.patientId,
        action.type,
        action.content,
        action.timestamp,
        action.synced ? 1 : 0,
        action.attempt,
      ]
    );
  }

  async getUnsyncedActions(): Promise<UserAction[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      `SELECT * FROM user_actions WHERE synced = 0 ORDER BY timestamp ASC`
    );

    return result.map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      type: row.type,
      content: row.content,
      timestamp: row.timestamp,
      synced: row.synced === 1,
      attempt: row.attempt,
    }));
  }

  async markActionAsSynced(actionId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(`UPDATE user_actions SET synced = 1 WHERE id = ?`, [
      actionId,
    ]);
  }

  // Game Sessions
  async saveGameSession(session: GameSession): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO game_sessions 
       (id, patient_id, user_id, test_attempts, diagnosis_attempts, 
        total_points, lab_test_points, diagnosis_points, is_completed, 
        started_at, completed_at, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.patientId,
        session.userId,
        session.testAttempts,
        session.diagnosisAttempts,
        session.totalPoints,
        session.labTestPoints,
        session.diagnosisPoints,
        session.isCompleted ? 1 : 0,
        session.startedAt,
        session.completedAt || null,
        0,
      ]
    );
  }

  async getGameSession(patientId: string): Promise<GameSession | null> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      `SELECT * FROM game_sessions WHERE patient_id = ?`,
      [patientId]
    );

    if (!result) return null;

    const row = result as any;
    return {
      id: row.id,
      patientId: row.patient_id,
      userId: row.user_id,
      testAttempts: row.test_attempts,
      diagnosisAttempts: row.diagnosis_attempts,
      totalPoints: row.total_points,
      labTestPoints: row.lab_test_points,
      diagnosisPoints: row.diagnosis_points,
      isCompleted: row.is_completed === 1,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    };
  }

  // Patient Cases
  async savePatientCase(patientCase: PatientCase): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO patient_cases 
       (id, patient_data, correct_test, correct_diagnosis) 
       VALUES (?, ?, ?, ?)`,
      [
        patientCase.id,
        JSON.stringify(patientCase.patient),
        patientCase.correctTest,
        patientCase.correctDiagnosis,
      ]
    );
  }

  async getPatientCase(id: string): Promise<PatientCase | null> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      `SELECT * FROM patient_cases WHERE id = ?`,
      [id]
    );

    if (!result) return null;

    const row = result as any;
    return {
      id: row.id,
      patient: JSON.parse(row.patient_data),
      correctTest: row.correct_test,
      correctDiagnosis: row.correct_diagnosis,
    };
  }

  async getAllPatientCases(): Promise<PatientCase[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      `SELECT * FROM patient_cases ORDER BY id`
    );

    return result.map((row: any) => ({
      id: row.id,
      patient: JSON.parse(row.patient_data),
      correctTest: row.correct_test,
      correctDiagnosis: row.correct_diagnosis,
    }));
  }

  // Clear all game data but keep patient cases
  async clearAllGameData(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      DELETE FROM chat_messages;
      DELETE FROM user_actions;
      DELETE FROM game_sessions;
    `);

    console.log("All game data cleared - fresh start!");
  }

  // Complete database reset (including patient cases)
  async resetDatabase(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      DROP TABLE IF EXISTS chat_messages;
      DROP TABLE IF EXISTS user_actions;
      DROP TABLE IF EXISTS game_sessions;
      DROP TABLE IF EXISTS patient_cases;
    `);

    // Recreate tables
    await this.initialize();

    console.log("Database completely reset!");
  }
}

export const databaseService = new DatabaseService();
