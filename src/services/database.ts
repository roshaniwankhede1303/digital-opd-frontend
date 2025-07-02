import * as SQLite from "expo-sqlite";
import { GameState, QueuedAction } from "../utils/types/game";
import { Message } from "../utils/types/message";
import { Patient } from "../utils/types/patient";

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await SQLite.openDatabaseAsync("digitalopd.db");
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        history TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        additional_info TEXT,
        correct_test TEXT NOT NULL,
        correct_diagnosis TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        sender TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        test_result TEXT,
        metadata TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      );

      CREATE TABLE IF NOT EXISTS game_states (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        user_id TEXT,
        phase TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        test_attempts INTEGER NOT NULL DEFAULT 0,
        diagnosis_attempts INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      );

      CREATE TABLE IF NOT EXISTS queued_actions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON messages(patient_id);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_game_states_patient_id ON game_states(patient_id);
      CREATE INDEX IF NOT EXISTS idx_queued_actions_synced ON queued_actions(synced);
    `);
  }

  async saveMessage(message: Message): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO messages 
       (id, content, sender, timestamp, patient_id, message_type, test_result, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.content,
        message.sender,
        message.timestamp,
        message.patientId,
        message.messageType || "text",
        message.testResult ? JSON.stringify(message.testResult) : null,
        message.metadata ? JSON.stringify(message.metadata) : null,
      ]
    );
  }

  async getMessages(patientId: string): Promise<Message[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM messages WHERE patient_id = ? ORDER BY timestamp ASC",
      [patientId]
    );

    return result.map((row: any) => ({
      id: row.id,
      content: row.content,
      sender: row.sender,
      timestamp: row.timestamp,
      patientId: row.patient_id,
      messageType: row.message_type,
      testResult: row.test_result ? JSON.parse(row.test_result) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  async saveGameState(gameState: GameState): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO game_states 
       (id, patient_id, user_id, phase, score, test_attempts, diagnosis_attempts, started_at, completed_at, is_completed) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gameState.id,
        gameState.patientId,
        gameState.userId || null,
        gameState.phase,
        gameState.score,
        gameState.attempts.testAttempts,
        gameState.attempts.diagnosisAttempts,
        gameState.startedAt,
        gameState.completedAt || null,
        gameState.isCompleted ? 1 : 0,
      ]
    );
  }

  async getGameState(patientId: string): Promise<GameState | null> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      "SELECT * FROM game_states WHERE patient_id = ? ORDER BY started_at DESC LIMIT 1",
      [patientId]
    );

    if (!result) return null;

    return {
      id: (result as any).id,
      patientId: (result as any).patient_id,
      userId: (result as any).user_id,
      phase: (result as any).phase,
      score: (result as any).score,
      attempts: {
        testAttempts: (result as any).test_attempts,
        diagnosisAttempts: (result as any).diagnosis_attempts,
      },
      startedAt: (result as any).started_at,
      completedAt: (result as any).completed_at,
      isCompleted: (result as any).is_completed === 1,
    };
  }

  async saveQueuedAction(action: QueuedAction): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT INTO queued_actions 
       (id, type, data, timestamp, patient_id, synced, retry_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        action.id,
        action.type,
        JSON.stringify(action.data),
        action.timestamp,
        action.patientId,
        action.synced ? 1 : 0,
        action.retryCount,
      ]
    );
  }

  async getQueuedActions(): Promise<QueuedAction[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM queued_actions WHERE synced = 0 ORDER BY timestamp ASC"
    );

    return result.map((row: any) => ({
      id: row.id,
      type: row.type,
      data: JSON.parse(row.data),
      timestamp: row.timestamp,
      patientId: row.patient_id,
      synced: row.synced === 1,
      retryCount: row.retry_count,
    }));
  }

  async removeQueuedAction(actionId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM queued_actions WHERE id = ?", [
      actionId,
    ]);
  }

  async clearPatientData(patientId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      DELETE FROM messages WHERE patient_id = '${patientId}';
      DELETE FROM game_states WHERE patient_id = '${patientId}';
      DELETE FROM queued_actions WHERE patient_id = '${patientId}';
    `);
  }

  async savePatient(patient: Patient): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `INSERT OR REPLACE INTO patients 
       (id, name, age, gender, history, symptoms, additional_info, correct_test, correct_diagnosis, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient.id,
        patient.name,
        patient.age,
        patient.gender,
        patient.history,
        patient.symptoms,
        patient.additionalInfo || null,
        patient.correctTest,
        patient.correctDiagnosis,
        patient.createdAt,
        patient.updatedAt,
      ]
    );
  }

  async getPatients(): Promise<Patient[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM patients ORDER BY created_at DESC"
    );

    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      history: row.history,
      symptoms: row.symptoms,
      additionalInfo: row.additional_info,
      correctTest: row.correct_test,
      correctDiagnosis: row.correct_diagnosis,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getPatient(patientId: string): Promise<Patient | null> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      "SELECT * FROM patients WHERE id = ?",
      [patientId]
    );

    if (!result) return null;

    return {
      id: (result as any).id,
      name: (result as any).name,
      age: (result as any).age,
      gender: (result as any).gender,
      history: (result as any).history,
      symptoms: (result as any).symptoms,
      additionalInfo: (result as any).additional_info,
      correctTest: (result as any).correct_test,
      correctDiagnosis: (result as any).correct_diagnosis,
      createdAt: (result as any).created_at,
      updatedAt: (result as any).updated_at,
    };
  }
}

export const database = new Database();
