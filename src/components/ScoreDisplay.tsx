// src/components/ScoreDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameSession } from '../utils/types';

interface Props {
    gameSession: GameSession;
}

export const ScoreDisplay: React.FC<Props> = ({ gameSession }) => {
    return (
        <View style={styles.container}>
            <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
            </View>

            <Text style={styles.scoreTitle}>YOUR SCORE</Text>
            <Text style={styles.scoreValue}>{gameSession.totalPoints}/10 Points</Text>

            <View style={styles.breakdown}>
                <View style={styles.breakdownItem}>
                    <Text style={styles.icon}>🔬</Text>
                    <Text style={styles.label}>LAB TEST</Text>
                    <Text style={styles.points}>{gameSession.labTestPoints}/5 Points</Text>
                </View>

                <View style={styles.breakdownItem}>
                    <Text style={styles.icon}>👨‍⚕️</Text>
                    <Text style={styles.label}>DIAGNOSIS</Text>
                    <Text style={styles.points}>{gameSession.diagnosisPoints}/5 Points</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    checkmark: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    checkmarkText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold'
    },
    scoreTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        letterSpacing: 1
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 40
    },
    breakdown: {
        width: '100%',
        gap: 24
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 12
    },
    icon: {
        fontSize: 24,
        marginRight: 16
    },
    label: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 0.5
    },
    points: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black'
    }
});