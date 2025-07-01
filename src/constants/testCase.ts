import { PatientCase } from "../utils/types";

export const TEST_CASES: PatientCase[] = [
  {
    id: "1",
    patient: {
      id: "1",
      // name: "John Doe",
      age: 32,
      gender: "Female",
      history: "Pregnant",
      symptoms: "Mild bleeding and pain",
      additionalInfo: "Uterus tender, fetal heart sounds absent",
    },
    correctTest: "Physical examination and ultrasound",
    correctDiagnosis: "Abruptio placenta",
  },
  {
    id: "2",
    patient: {
      id: "2",
      // name: "Sahil Hariyani",
      age: 5,
      gender: "Male",
      history: "Posterior superior retraction pocket",
      symptoms: "—",
      additionalInfo: "Posterior superior retraction pocket present",
    },
    correctTest: "Otoscopy and audiometry",
    correctDiagnosis: "Chronic suppurative otitis media (unsafe type)",
  },
  {
    id: "3",
    patient: {
      id: "3",
      // name: "Roshani",
      age: 48,
      gender: "Male",
      history: "—",
      symptoms: "Painful raised red lesion on hand",
      additionalInfo: "Nests of round cells + branching vascular spaces",
    },
    correctTest: "Skin biopsy",
    correctDiagnosis: "Glomus tumor",
  },
];
