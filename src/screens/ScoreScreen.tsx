import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGame } from '../hooks/useGame';
import { Colors } from '../constants/Colors';

export function ScoreScreen() {
    const router = useRouter();
    const { gameState, getCurrentPatient, nextPatient } = useGame();

    const currentPatient = getCurrentPatient();
    const totalScore = gameState.testScore + gameState.diagnosisScore;
    const maxScore = 10;

    const handleNextPatient = () => {
        nextPatient();
        router.replace('/chat');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.patientInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color="white" />
                    </View>
                    <Text style={styles.patientName}>{currentPatient.name}</Text>
                </View>

                <Text style={styles.pointsText}>{gameState.score} points</Text>
            </View>

            {/* Score Content */}
            <View style={styles.scoreContainer}>
                <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
                </View>

                <Text style={styles.scoreTitle}>YOUR SCORE</Text>
                <Text style={styles.mainScore}>{totalScore}/{maxScore} Points</Text>

                {/* Score Breakdown */}
                <View style={styles.breakdownContainer}>
                    <View style={styles.scoreItem}>
                        <View style={styles.scoreIcon}>
                            <Ionicons name="flask" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.scoreCategory}>LAB TEST</Text>
                        <Text style={styles.scoreValue}>{gameState.testScore}/5 Points</Text>
                    </View>

                    <View style={styles.scoreItem}>
                        <View style={styles.scoreIcon}>
                            <Ionicons name="medical" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.scoreCategory}>DIAGNOSIS</Text>
                        <Text style={styles.scoreValue}>{gameState.diagnosisScore}/5 Points</Text>
                    </View>
                </View>
            </View>

            {/* Next Patient Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNextPatient}>
                    <Text style={styles.nextButtonText}>NEXT PATIENT</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    pointsText: {
        color: 'white',
        fontSize: 14,
    },
    scoreContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    checkmarkContainer: {
        marginBottom: 24,
    },
    scoreTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    mainScore: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 48,
    },
    breakdownContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    scoreItem: {
        alignItems: 'center',
    },
    scoreIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    scoreCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    buttonContainer: {
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    nextButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});