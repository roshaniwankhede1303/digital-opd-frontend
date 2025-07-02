import { Patient } from "../utils/types";

export const PATIENTS: Patient[] = [
  {
    id: "1",
    name: "MR. AMIT (45 Y/O)",
    age: 45,
    gender: "Male",
    history: "Smoker for many years",
    symptoms:
      "Persistent cough lately, and losing weight without trying. Concerned because been a smoker for many years.",
    correctTest: "X-ray",
    correctDiagnosis: "Lung cancer",
  },
  {
    id: "2",
    name: "MRS. SARAH (32 Y/O)",
    age: 32,
    gender: "Female",
    history: "Pregnant",
    symptoms: "Mild bleeding and pain",
    additionalInfo: "Uterus tender, fetal heart sounds absent",
    correctTest: "Physical examination and ultrasound",
    correctDiagnosis: "Abruptio placenta",
  },
  {
    id: "3",
    name: "BABY ALEX (5 Y/O)",
    age: 5,
    gender: "Male",
    history: "Posterior superior retraction pocket",
    symptoms: "Ear discomfort",
    additionalInfo: "Posterior superior retraction pocket present",
    correctTest: "Otoscopy and audiometry",
    correctDiagnosis: "Chronic suppurative otitis media (unsafe type)",
  },
];
