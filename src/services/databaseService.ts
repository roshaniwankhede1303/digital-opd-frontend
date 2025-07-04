import * as SQLite from "expo-sqlite";
import { Message, GameSession, OfflineQueueItem } from "../utils/types";

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync("medical_game.db");
    await createTables();
    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
};

const createTables = async (): Promise<void> => {
  if (!db) return;

  try {
    // Messages table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        sender TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        patient_id TEXT,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Game sessions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        patient_name TEXT,
        patient_query TEXT,
        test_score INTEGER DEFAULT 0,
        diagnosis_score INTEGER DEFAULT 0,
        stage TEXT DEFAULT 'test',
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      );
    `);

    // Offline queue table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database tables created");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

// Messages functions
export const saveMessage = async (
  message: Omit<Message, "id">
): Promise<number | null> => {
  if (!db) return null;

  try {
    const result = await db.runAsync(
      "INSERT INTO messages (content, sender, timestamp, patient_id) VALUES (?, ?, ?, ?)",
      [message.content, message.sender, message.timestamp, message.patient_id]
    );
    console.log("✅ Message saved offline:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    // console.error("❌ Error saving message:", error);
    return null;
  }
};

export const getMessages = async (
  patientId: string = "default"
): Promise<Message[]> => {
  if (!db) return [];

  try {
    const result = await db.getAllAsync(
      "SELECT * FROM messages WHERE patient_id = ? ORDER BY timestamp ASC",
      [patientId]
    );

    return result.map((row: any) => ({
      id: row.timestamp,
      content: row.content,
      sender: row.sender as "user" | "ai",
      timestamp: row.timestamp,
      patient_id: row.patient_id,
      synced: row.synced === 1,
    }));
  } catch (error) {
    // console.error("❌ Error getting messages:", error);
    return [];
  }
};

export const markMessagesSynced = async (patientId: string): Promise<void> => {
  if (!db) return;

  try {
    await db.runAsync("UPDATE messages SET synced = 1 WHERE patient_id = ?", [
      patientId,
    ]);
    console.log("✅ Messages marked as synced");
  } catch (error) {
    console.error("❌ Error marking messages synced:", error);
  }
};

// Game session functions
export const saveGameSession = async (
  session: Omit<GameSession, "id">
): Promise<number | null> => {
  if (!db) return null;

  try {
    const result = await db.runAsync(
      "INSERT INTO game_sessions (patient_id, patient_name, patient_query, test_score, diagnosis_score, stage) VALUES (?, ?, ?, ?, ?, ?)",
      [
        session.patient_id,
        session.patient_name,
        session.patient_query,
        session.test_score,
        session.diagnosis_score,
        session.stage,
      ]
    );
    console.log("✅ Game session saved offline:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    // console.error("❌ Error saving game session:", error);
    return null;
  }
};

export const updateGameSession = async (
  patientId: string,
  updates: Partial<GameSession>
): Promise<void> => {
  if (!db) return;

  try {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    values.push(patientId);

    await db.runAsync(
      `UPDATE game_sessions SET ${fields} WHERE patient_id = ?`,
      values
    );
    console.log("✅ Game session updated");
  } catch (error) {
    console.error("❌ Error updating game session:", error);
  }
};

export const getLatestGameSession = async (): Promise<GameSession | null> => {
  if (!db) return null;

  try {
    const result = await db.getFirstAsync(
      "SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT 1"
    );

    if (!result) return null;

    const row = result as any;
    return {
      id: row.id,
      patient_id: row.patient_id,
      patient_name: row.patient_name,
      patient_query: row.patient_query,
      test_score: row.test_score,
      diagnosis_score: row.diagnosis_score,
      stage: row.stage,
      synced: row.synced === 1,
      created_at: row.created_at,
      completed_at: row.completed_at,
    };
  } catch (error) {
    // console.error("❌ Error getting latest session:", error);
    return null;
  }
};

// Offline queue functions
export const addToOfflineQueue = async (
  eventType: string,
  eventData: any
): Promise<number | null> => {
  if (!db) return null;

  try {
    const result = await db.runAsync(
      "INSERT INTO offline_queue (event_type, event_data, timestamp) VALUES (?, ?, ?)",
      [eventType, JSON.stringify(eventData), Date.now()]
    );
    console.log("✅ Added to offline queue:", eventType);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("❌ Error adding to offline queue:", error);
    return null;
  }
};

export const getOfflineQueue = async (): Promise<OfflineQueueItem[]> => {
  if (!db) return [];

  try {
    const result = await db.getAllAsync(
      "SELECT * FROM offline_queue WHERE synced = 0 ORDER BY timestamp ASC"
    );

    return result.map((row: any) => ({
      id: row.id,
      eventType: row.event_type,
      eventData: JSON.parse(row.event_data),
      timestamp: row.timestamp,
      synced: row.synced === 1,
    }));
  } catch (error) {
    // console.error("❌ Error getting offline queue:", error);
    return [];
  }
};

export const markQueueItemSynced = async (id: number): Promise<void> => {
  if (!db) return;

  try {
    await db.runAsync("UPDATE offline_queue SET synced = 1 WHERE id = ?", [id]);
    console.log("✅ Queue item marked as synced:", id);
  } catch (error) {
    console.error("❌ Error marking queue item synced:", error);
  }
};

export const clearSyncedData = async (): Promise<void> => {
  if (!db) return;

  try {
    await db.runAsync("DELETE FROM offline_queue WHERE synced = 1");
    console.log("✅ Cleared synced data");
  } catch (error) {
    console.error("❌ Error clearing synced data:", error);
  }
};

// Initialize database on import
initDatabase();
