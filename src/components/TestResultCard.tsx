import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { TestResult } from '../utils/types';

interface TestResultCardProps {
    testResult: TestResult;
}

export function TestResultCard({ testResult }: TestResultCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={16} color={Colors.primary} />
                </View>
                <Text style={styles.title}>XRAY</Text>
            </View>

            <Text style={styles.result}>{testResult.result}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    result: {
        fontSize: 14,
        color: Colors.text.primary,
        lineHeight: 20,
    },
});