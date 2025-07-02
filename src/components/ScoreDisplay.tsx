import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScoreBreakdown } from '../utils/types';
import { Colors } from '../constants/Colors';

interface ScoreDisplayProps {
    scoreBreakdown: ScoreBreakdown;
    showBreakdown?: boolean;
}

export function ScoreDisplay({ scoreBreakdown, showBreakdown = true }: ScoreDisplayProps) {
    const getScoreColor = () => {
        const percentage = (scoreBreakdown.totalScore / scoreBreakdown.maxTotalScore) * 100;
        if (percentage >= 80) return Colors.success;
        if (percentage >= 60) return Colors.warning;
        return Colors.error;
    };

    return (
        <View style={styles.container}>
            <View style={styles.totalScoreContainer}>
                <Text style={styles.scoreLabel}>Total Score</Text>
                <Text style={[styles.totalScore, { color: getScoreColor() }]}>
                    {scoreBreakdown.totalScore}/{scoreBreakdown.maxTotalScore}
                </Text>
            </View>

            {showBreakdown && (
                <View style={styles.breakdownContainer}>
                    <View style={styles.scoreItem}>
                        <Ionicons name="flask" size={16} color={Colors.primary} />
                        <Text style={styles.scoreItemLabel}>Test</Text>
                        <Text style={styles.scoreItemValue}>
                            {scoreBreakdown.testScore}/{scoreBreakdown.maxTestScore}
                        </Text>
                    </View>

                    <View style={styles.scoreItem}>
                        <Ionicons name="medical" size={16} color={Colors.primary} />
                        <Text style={styles.scoreItemLabel}>Diagnosis</Text>
                        <Text style={styles.scoreItemValue}>
                            {scoreBreakdown.diagnosisScore}/{scoreBreakdown.maxDiagnosisScore}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalScoreContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: 4,
    },
    totalScore: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    breakdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    scoreItem: {
        alignItems: 'center',
        flex: 1,
    },
    scoreItemLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        marginTop: 4,
        marginBottom: 2,
    },
    scoreItemValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
});