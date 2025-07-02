export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  history: string;
  symptoms: string;
  additionalInfo?: string;
  correctTest: string;
  correctDiagnosis: string;
}

export interface PatientCase {
  patient: Patient;
  correctTest: string;
  correctDiagnosis: string;
  contraIndicatedTests?: string[];
}
