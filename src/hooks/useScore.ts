import { useMemo } from "react";
import { GameAttempts, GameState, ScoreBreakdown } from "../utils/types";

const calculateScore = (attempts: GameAttempts): ScoreBreakdown => {
  const maxTestScore = 5;
  const maxDiagnosisScore = 5;
  const deductionPerAttempt = 2;

  // Calculate test score (5 points minus 2 for each extra attempt)
  const testScore = Math.max(
    0,
    maxTestScore - (attempts.testAttempts - 1) * deductionPerAttempt
  );

  // Calculate diagnosis score (5 points minus 2 for each extra attempt)
  const diagnosisScore = Math.max(
    0,
    maxDiagnosisScore - (attempts.diagnosisAttempts - 1) * deductionPerAttempt
  );

  return {
    testScore,
    diagnosisScore,
    totalScore: testScore + diagnosisScore,
    maxTestScore,
    maxDiagnosisScore,
    maxTotalScore: maxTestScore + maxDiagnosisScore,
  };
};

export function useScore(gameState: GameState | null): ScoreBreakdown {
  return useMemo(() => {
    if (!gameState) {
      return {
        testScore: 0,
        diagnosisScore: 0,
        totalScore: 0,
        maxTestScore: 5,
        maxDiagnosisScore: 5,
        maxTotalScore: 10,
      };
    }

    return calculateScore(gameState.attempts);
  }, [gameState]);
}
