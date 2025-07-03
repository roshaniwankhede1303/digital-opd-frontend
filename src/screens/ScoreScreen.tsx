import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../hooks/useGame';
import { Colors } from '../constants/Colors';

export function ScoreScreen() {
    const { testScore, diagnosisScore } = useGame();
    const maxScore = 10;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Score Content */}
            <View style={styles.scoreContainer}>
                <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
                </View>

                <Text style={styles.scoreTitle}>YOUR SCORE</Text>
                <Text style={styles.mainScore}>{testScore + diagnosisScore}/{maxScore} Points</Text>

                {/* Score Breakdown */}
                <View style={styles.breakdownContainer}>
                    <View style={styles.scoreItem}>
                        <View style={styles.scoreIcon}>
                            <Ionicons name="flask" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.scoreCategory}>LAB TEST</Text>
                        <Text style={styles.scoreValue}>{testScore}/5 Points</Text>
                    </View>

                    <View style={styles.scoreItem}>
                        <View style={styles.scoreIcon}>
                            <Ionicons name="medical" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.scoreCategory}>DIAGNOSIS</Text>
                        <Text style={styles.scoreValue}>{diagnosisScore}/5 Points</Text>
                    </View>
                </View>
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
});