export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  testResult?: TestResult;
}

export interface TestResult {
  testName: string;
  result: string;
  isCorrect: boolean;
}
