// src/hooks/usePatientChat.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '../services/database';
import { socketService } from '../services/socketService';
import { ChatMessage, UserAction, GameSession, PatientCase } from '../utils/types';
import { ScoringHelper } from '../utils/scoring';
import * as Haptics from 'expo-haptics';

export const usePatientChat = (patientId: string) => {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chatMessages', patientId],
    queryFn: () => databaseService.getChatMessages(patientId),
    refetchInterval: 1000 // Refetch every second for real-time updates
  });

  // Fetch patient case
  const { data: patientCase } = useQuery({
    queryKey: ['patientCase', patientId],
    queryFn: () => databaseService.getPatientCase(patientId)
  });

  // Fetch game session
  const { data: gameSession } = useQuery({
    queryKey: ['gameSession', patientId],
    queryFn: () => databaseService.getGameSession(patientId)
  });

  // Initialize session if needed
  useEffect(() => {
    if (!gameSession && patientCase) {
      const newSession: GameSession = {
        id: `session_${patientId}_${Date.now()}`,
        patientId,
        userId: 'user_1', // TODO: Get from auth context
        testAttempts: 0,
        diagnosisAttempts: 0,
        totalPoints: 0,
        labTestPoints: 0,
        diagnosisPoints: 0,
        isCompleted: false,
        startedAt: Date.now()
      };

      databaseService.saveGameSession(newSession);
      setCurrentSession(newSession);

      // Add initial doctor message
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'doctor',
        content: `The patient is a ${patientCase.patient.age}-year-old ${patientCase.patient.gender.toLowerCase()} with a history of ${patientCase.patient.history}. He presents with a ${patientCase.patient.symptoms} and ${patientCase.patient.additionalInfo}. These symptoms warrant further investigation. Let's go to the lab to diagnose further. What test should we run?`,
        timestamp: Date.now(),
        patientId
      };

      databaseService.saveChatMessage(welcomeMessage);
      queryClient.invalidateQueries({ queryKey: ['chatMessages', patientId] });
    } else if (gameSession) {
      setCurrentSession(gameSession);
    }
  }, [gameSession, patientCase, patientId, queryClient]);

  // Submit test request
  const submitTestMutation = useMutation({
    mutationFn: async (testName: string) => {
      if (!currentSession || !patientCase) throw new Error('Session not initialized');

      const newAttempts = currentSession.testAttempts + 1;
      const isCorrect = testName.toLowerCase().includes(patientCase.correctTest.toLowerCase()) ||
        patientCase.correctTest.toLowerCase().includes(testName.toLowerCase());

      // Save user action
      const userAction: UserAction = {
        id: `action_${Date.now()}`,
        patientId,
        type: 'test_request',
        content: testName,
        timestamp: Date.now(),
        synced: false,
        attempt: newAttempts
      };

      await databaseService.saveUserAction(userAction);

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        type: 'user',
        content: `Please run a ${testName}`,
        timestamp: Date.now(),
        patientId
      };

      await databaseService.saveChatMessage(userMessage);

      // Calculate score and prepare response
      const testScore = ScoringHelper.calculateTestScore(newAttempts);

      // Check if test was already completed successfully
      const testAlreadyCompleted = currentSession.labTestPoints > 0;

      if (isCorrect && !testAlreadyCompleted) {
        // Correct test - show results
        const testResultContent = getTestResultContent(patientCase, testName);

        const resultMessage: ChatMessage = {
          id: `msg_result_${Date.now()}`,
          type: 'doctor',
          content: `Great choice, Doctor! Here are the results from the report:\n\n🔬 ${testName.toUpperCase()}\n\n${testResultContent}`,
          timestamp: Date.now() + 1000,
          patientId,
          points: testScore
        };

        await databaseService.saveChatMessage(resultMessage);

        // Follow-up question
        const followUpMessage: ChatMessage = {
          id: `msg_followup_${Date.now()}`,
          type: 'doctor',
          content: 'What is the differential diagnosis we should be doing?',
          timestamp: Date.now() + 2000,
          patientId
        };

        await databaseService.saveChatMessage(followUpMessage);

        // Update session
        const updatedSession: GameSession = {
          ...currentSession,
          testAttempts: newAttempts,
          labTestPoints: testScore,
          totalPoints: testScore + currentSession.diagnosisPoints
        };

        await databaseService.saveGameSession(updatedSession);
        setCurrentSession(updatedSession);

        // Haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      } else if (isCorrect && testAlreadyCompleted) {
        // Test already completed, user gave correct answer again - show results again
        const testResultContent = getTestResultContent(patientCase, testName);

        const resultMessage: ChatMessage = {
          id: `msg_result_${Date.now()}`,
          type: 'doctor',
          content: `You're absolutely right! ${testName} is indeed the correct test. Here are the results again:\n\n🔬 ${testName.toUpperCase()}\n\n${testResultContent}`,
          timestamp: Date.now() + 1000,
          patientId
        };

        await databaseService.saveChatMessage(resultMessage);

        // Since test phase is complete, prompt for diagnosis
        const diagnosisPromptMessage: ChatMessage = {
          id: `msg_diagnosis_prompt_${Date.now()}`,
          type: 'doctor',
          content: 'Since we have the test results, what is your diagnosis for this patient?',
          timestamp: Date.now() + 2000,
          patientId
        };

        await databaseService.saveChatMessage(diagnosisPromptMessage);

        // Just update attempt count, don't change score
        const updatedSession: GameSession = {
          ...currentSession,
          testAttempts: newAttempts
        };

        await databaseService.saveGameSession(updatedSession);
        setCurrentSession(updatedSession);

        // Haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      } else {
        // Incorrect test
        const isFirstWrongAttempt = newAttempts === 1;
        const responseMessage: ChatMessage = {
          id: `msg_response_${Date.now()}`,
          type: 'doctor',
          content: isFirstWrongAttempt ?
            `I understand your thinking, but a ${testName} might not give us the most relevant information for this case.\n\nRemember, the patient is presenting with ${patientCase.patient.symptoms}, and has a history of ${patientCase.patient.history}. These symptoms suggest we should focus on examining the specific lesion. Consider what test would allow us to get a definitive tissue diagnosis. Would you like to suggest another test?` :
            `That's still not the most appropriate test for this case. Think about what type of examination would give us the most definitive information about this raised red lesion. What test allows us to examine the tissue structure directly?`,
          timestamp: Date.now() + 1000,
          patientId,
          points: testScore
        };

        await databaseService.saveChatMessage(responseMessage);

        // Update session - only update lab test points if this is the first time getting points
        const updatedSession: GameSession = {
          ...currentSession,
          testAttempts: newAttempts,
          labTestPoints: testAlreadyCompleted ? currentSession.labTestPoints : testScore,
          totalPoints: (testAlreadyCompleted ? currentSession.labTestPoints : testScore) + currentSession.diagnosisPoints
        };

        await databaseService.saveGameSession(updatedSession);
        setCurrentSession(updatedSession);

        // Haptic feedback for error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Send to server via socket
      socketService.sendTestRequest(patientId, testName, newAttempts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', patientId] });
      queryClient.invalidateQueries({ queryKey: ['gameSession', patientId] });
    }
  });

  // Submit diagnosis
  const submitDiagnosisMutation = useMutation({
    mutationFn: async (diagnosis: string) => {
      if (!currentSession || !patientCase) throw new Error('Session not initialized');

      const newAttempts = currentSession.diagnosisAttempts + 1;
      const isCorrect = diagnosis.toLowerCase().includes(patientCase.correctDiagnosis.toLowerCase()) ||
        patientCase.correctDiagnosis.toLowerCase().includes(diagnosis.toLowerCase());

      // Save user action
      const userAction: UserAction = {
        id: `action_${Date.now()}`,
        patientId,
        type: 'diagnosis_submission',
        content: diagnosis,
        timestamp: Date.now(),
        synced: false,
        attempt: newAttempts
      };

      await databaseService.saveUserAction(userAction);

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        type: 'user',
        content: diagnosis,
        timestamp: Date.now(),
        patientId
      };

      await databaseService.saveChatMessage(userMessage);

      // Calculate score
      const diagnosisScore = ScoringHelper.calculateDiagnosisScore(newAttempts);
      const finalScore = ScoringHelper.getScoreBreakdown(
        currentSession.testAttempts,
        newAttempts
      );

      // Check if diagnosis was already completed successfully
      const diagnosisAlreadyCompleted = currentSession.diagnosisPoints > 0;

      if (isCorrect && !diagnosisAlreadyCompleted) {
        // Correct diagnosis for the first time
        const responseMessage: ChatMessage = {
          id: `msg_response_${Date.now()}`,
          type: 'doctor',
          content: `Excellent work, Doctor! You've correctly diagnosed the patient with ${patientCase.correctDiagnosis}.`,
          timestamp: Date.now() + 1000,
          patientId,
          points: diagnosisScore
        };

        await databaseService.saveChatMessage(responseMessage);

        // Update session
        const updatedSession: GameSession = {
          ...currentSession,
          diagnosisAttempts: newAttempts,
          diagnosisPoints: diagnosisScore,
          totalPoints: finalScore.total,
          isCompleted: true,
          completedAt: Date.now()
        };

        await databaseService.saveGameSession(updatedSession);
        setCurrentSession(updatedSession);

        // Haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      } else if (isCorrect && diagnosisAlreadyCompleted) {
        // Diagnosis already completed, user gave correct answer again
        const confirmationMessage: ChatMessage = {
          id: `msg_response_${Date.now()}`,
          type: 'doctor',
          content: `That's absolutely correct! You've already successfully diagnosed this case. Well done on your medical reasoning skills.`,
          timestamp: Date.now() + 1000,
          patientId
        };

        await databaseService.saveChatMessage(confirmationMessage);

        // Just update attempt count, don't change completion status or score
        const updatedSession: GameSession = {
          ...currentSession,
          diagnosisAttempts: newAttempts
        };

        await databaseService.saveGameSession(updatedSession);
        setCurrentSession(updatedSession);

        // Haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      } else {
        // Incorrect diagnosis
        const hintMessage = getDiagnosisHint(patientCase, newAttempts);

        const responseMessage: ChatMessage = {
          id: `msg_response_${Date.now()}`,
          type: 'doctor',
          content: hintMessage,
          timestamp: Date.now() + 1000,
          patientId,
          points: diagnosisScore
        };

        await databaseService.saveChatMessage(responseMessage);

        // Update session - only update diagnosis points if this is the first time getting points
        const updatedSession: GameSession = {
          ...currentSession,
          diagnosisAttempts: newAttempts,
          diagnosisPoints: diagnosisAlreadyCompleted ? currentSession.diagnosisPoints : diagnosisScore,
          totalPoints: currentSession.labTestPoints + (diagnosisAlreadyCompleted ? currentSession.diagnosisPoints : diagnosisScore),
          isCompleted: false
        };

        await databaseService.saveGameSession(updatedSession);
        setCurrentSession(updatedSession);

        // Haptic feedback for error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Send to server
      socketService.sendDiagnosis(patientId, diagnosis, newAttempts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', patientId] });
      queryClient.invalidateQueries({ queryKey: ['gameSession', patientId] });
    }
  });

  // Helper function to get case-specific test results
  const getTestResultContent = (patientCase: PatientCase, testName: string): string => {
    const { correctDiagnosis, patient } = patientCase;

    if (correctDiagnosis.toLowerCase().includes('glomus tumor')) {
      if (testName.toLowerCase().includes('biopsy')) {
        return `Shows nests of round cells + branching vascular spaces. The tissue architecture is consistent with a vascular tumor of the dermis/subcutis.`;
      }
      return `Shows a well-defined lesion with characteristic histological features.`;
    } else if (correctDiagnosis.toLowerCase().includes('abruptio placenta')) {
      if (testName.toLowerCase().includes('ultrasound') || testName.toLowerCase().includes('examination')) {
        return `Reveals retroplacental hematoma with partial placental separation. Fetal distress noted on monitoring.`;
      }
      return `Confirms placental abnormalities consistent with separation.`;
    } else if (correctDiagnosis.toLowerCase().includes('otitis media')) {
      if (testName.toLowerCase().includes('otoscopy') || testName.toLowerCase().includes('audiometry')) {
        return `Otoscopy shows retraction pocket in posterior superior quadrant with debris. Audiometry reveals conductive hearing loss.`;
      }
      return `Shows chronic changes in the middle ear with evidence of infection.`;
    } else {
      // Generic result
      return `Shows findings consistent with the clinical presentation. Further analysis needed for definitive diagnosis.`;
    }
  };

  // Helper function to get diagnosis hints
  const getDiagnosisHint = (patientCase: PatientCase, attemptNumber: number): string => {
    const { correctDiagnosis, patient } = patientCase;

    // Customize hints based on the specific case and attempt number
    if (correctDiagnosis.toLowerCase().includes('glomus tumor')) {
      if (attemptNumber === 1) {
        return `That's not quite right. Let me give you another hint about the diagnosis. Think about what type of tumor commonly presents as a painful raised red lesion, especially one that shows nests of round cells with branching vascular spaces on biopsy.`;
      } else if (attemptNumber === 2) {
        return `Consider the histological findings: nests of round cells + branching vascular spaces. This is characteristic of a specific type of benign tumor that commonly occurs in the extremities, particularly under the nails or on fingertips, and is known for being quite painful.`;
      } else {
        return `The key clue is in the biopsy findings: "nests of round cells + branching vascular spaces." This is pathognomonic for a Glomus tumor - a benign tumor arising from the glomus body that is characteristically very painful.`;
      }
    } else if (correctDiagnosis.toLowerCase().includes('abruptio placenta')) {
      if (attemptNumber === 1) {
        return `That's not quite right. Consider the key symptoms: a pregnant patient with bleeding, pain, tender uterus, and absent fetal heart sounds. What obstetric emergency involves premature separation of the placenta?`;
      } else {
        return `Think about placental complications during pregnancy. The combination of bleeding, uterine tenderness, and absent fetal heart sounds suggests premature placental separation.`;
      }
    } else if (correctDiagnosis.toLowerCase().includes('otitis media')) {
      if (attemptNumber === 1) {
        return `That's not quite right. Focus on the ear pathology - a posterior superior retraction pocket in a child suggests chronic infection. What type of otitis media is considered "unsafe"?`;
      } else {
        return `The retraction pocket in the posterior superior quadrant is a sign of chronic suppurative otitis media, specifically the "unsafe" type that can lead to complications.`;
      }
    } else {
      // Generic hints
      if (attemptNumber === 1) {
        return `That's not quite right. Let me give you another hint about the diagnosis. Review the key symptoms and test results carefully.`;
      } else {
        return `Consider all the clinical findings and test results together. What condition best explains all the patient's symptoms?`;
      }
    }
  };

  return {
    messages,
    patientCase,
    gameSession: currentSession,
    isLoading,
    submitTest: submitTestMutation.mutate,
    submitDiagnosis: submitDiagnosisMutation.mutate,
    isSubmittingTest: submitTestMutation.isPending,
    isSubmittingDiagnosis: submitDiagnosisMutation.isPending
  };
};