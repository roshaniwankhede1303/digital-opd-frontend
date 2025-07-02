import { Patient } from "../utils/types";

const API_URL =
  process.env.EXPO_PUBLIC_SOCKET_BASE_URL || "http://localhost:3000";

// Mock patient data based on the provided test cases
const mockPatients: Patient[] = [
  {
    id: "1",
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
    id: "2",
    name: "BABY ALEX (5 Y/O)",
    age: 5,
    gender: "Male",
    history: "Posterior superior retraction pocket",
    symptoms: "Ear discomfort",
    additionalInfo: "Posterior superior retraction pocket present",
    correctTest: "Otoscopy and audiometry",
    correctDiagnosis: "Chronic suppurative otitis media (unsafe type)",
  },
  {
    id: "3",
    name: "MR. AMIT (48 Y/O)",
    age: 48,
    gender: "Male",
    history: "Smoker for many years",
    symptoms: "Painful raised red lesion on hand",
    additionalInfo: "Nests of round cells + branching vascular spaces",
    correctTest: "Skin biopsy",
    correctDiagnosis: "Glomus tumor",
  },
];

const initializeMockData = async (
  savePatient: (patient: Patient) => Promise<void>
): Promise<void> => {
  try {
    for (const patient of mockPatients) {
      await savePatient(patient);
    }
  } catch (error) {
    console.error("Failed to initialize mock patients:", error);
  }
};

const getPatients = async (
  getLocalPatients: () => Promise<Patient[]>,
  savePatient: (patient: Patient) => Promise<void>
): Promise<Patient[]> => {
  try {
    const localPatients = await getLocalPatients();
    if (localPatients.length === 0) {
      await initializeMockData(savePatient);
      return mockPatients;
    }
    return localPatients;
  } catch (error) {
    console.error("Failed to get patients:", error);
    return mockPatients;
  }
};

const getPatient = async (
  patientId: string,
  getLocalPatient: (id: string) => Promise<Patient | null>
): Promise<Patient | null> => {
  try {
    const patient = await getLocalPatient(patientId);
    if (!patient) {
      // Fallback to mock data
      return mockPatients.find((p) => p.id === patientId) || null;
    }
    return patient;
  } catch (error) {
    console.error("Failed to get patient:", error);
    return mockPatients.find((p) => p.id === patientId) || null;
  }
};

const fetchPatientsFromServer = async (
  savePatient: (patient: Patient) => Promise<void>
): Promise<Patient[]> => {
  try {
    const response = await fetch(`${API_URL}/api/patients`);
    if (!response.ok) throw new Error("Failed to fetch patients");

    const data = await response.json();

    // Save to local database
    for (const patient of data.patients) {
      await savePatient(patient);
    }

    return data.patients;
  } catch (error) {
    console.error("Failed to fetch patients from server:", error);
    // Return mock patients as fallback
    return mockPatients;
  }
};

export const patientService = {
  getPatients,
  getPatient,
  fetchPatientsFromServer,
  mockPatients,
};
