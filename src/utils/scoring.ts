// src/utils/scoring.ts
export class ScoringHelper {
  private static readonly MAX_POINTS_PER_SECTION = 5;
  private static readonly DEDUCTION_PER_ATTEMPT = 2;

  static calculateTestScore(attempts: number): number {
    if (attempts <= 0) return 0;

    const score =
      this.MAX_POINTS_PER_SECTION - (attempts - 1) * this.DEDUCTION_PER_ATTEMPT;
    return Math.max(0, score);
  }

  static calculateDiagnosisScore(attempts: number): number {
    if (attempts <= 0) return 0;

    const score =
      this.MAX_POINTS_PER_SECTION - (attempts - 1) * this.DEDUCTION_PER_ATTEMPT;
    return Math.max(0, score);
  }

  static calculateTotalScore(
    testAttempts: number,
    diagnosisAttempts: number
  ): number {
    const testScore = this.calculateTestScore(testAttempts);
    const diagnosisScore = this.calculateDiagnosisScore(diagnosisAttempts);
    return testScore + diagnosisScore;
  }

  static getScoreBreakdown(testAttempts: number, diagnosisAttempts: number) {
    return {
      labTest: this.calculateTestScore(testAttempts),
      diagnosis: this.calculateDiagnosisScore(diagnosisAttempts),
      total: this.calculateTotalScore(testAttempts, diagnosisAttempts),
    };
  }
}
