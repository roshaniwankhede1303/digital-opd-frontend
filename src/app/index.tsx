// src/app/index.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    RefreshControl,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '../services/database';
import { PatientCard } from '../components/PatientCard';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { useSocket } from '../hooks/useSocket';
import { TEST_CASES } from '../constants/testCase';

const SERVER_URL = 'ws://localhost:3001'; // Change to your server URL

export default function HomeScreen() {
    const router = useRouter();
    const { isConnected } = useSocket(SERVER_URL);

    const {
        data: patientCases = [],
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['allPatientCases'],
        queryFn: () => databaseService.getAllPatientCases()
    });

    // Fetch game sessions to show points
    const { data: allSessions = [] } = useQuery({
        queryKey: ['allGameSessions'],
        queryFn: async () => {
            const sessions = [];
            for (const patientCase of patientCases) {
                const session = await databaseService.getGameSession(patientCase.id);
                if (session) {
                    sessions.push(session);
                }
            }
            return sessions;
        },
        enabled: patientCases.length > 0
    });

    const getPointsForPatient = (patientId: string): number => {
        const session = allSessions.find(s => s.patientId === patientId);
        return session?.totalPoints || 0;
    };

    const handlePatientPress = (patientId: string) => {
        router.push(`/patient/${patientId}`);
    };

    const handleClearData = () => {
        Alert.alert(
            "Clear All Data",
            "This will reset all chat history and scores. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await databaseService.clearAllGameData();

                            // Reload patient cases
                            for (const testCase of TEST_CASES) {
                                await databaseService.savePatientCase(testCase);
                            }

                            refetch();
                            Alert.alert("Success", "All data cleared! You can start fresh.");
                        } catch (error) {
                            Alert.alert("Error", "Failed to clear data");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ConnectionStatus />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refetch}
                    />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Available Patients</Text>
                    <Text style={styles.subtitle}>
                        Select a patient to begin diagnosis
                    </Text>

                    {/* Debug Button - Remove in production */}
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={handleClearData}
                    >
                        <Text style={styles.debugButtonText}>🔄 Clear All Data (Debug)</Text>
                    </TouchableOpacity>
                </View>

                {patientCases.map((patientCase) => (
                    <PatientCard
                        key={patientCase.id}
                        patient={patientCase.patient}
                        points={getPointsForPatient(patientCase.id)}
                        onPress={() => handlePatientPress(patientCase.id)}
                    />
                ))}

                {patientCases.length === 0 && !isLoading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No patients available</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingBottom: 20
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 16,
        color: '#666'
    },
    emptyState: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 16,
        color: '#666'
    },
    debugButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 16,
        alignSelf: 'center'
    },
    debugButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600'
    }
});