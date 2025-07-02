export type GamePhase =
  | "test_selection"
  | "test_results"
  | "diagnosis"
  | "completed";

export interface GameState {
  currentPatientIndex: number;
  phase: GamePhase;
  score: number;
  testAttempts: number;
  diagnosisAttempts: number;
  testScore: number;
  diagnosisScore: number;
}
