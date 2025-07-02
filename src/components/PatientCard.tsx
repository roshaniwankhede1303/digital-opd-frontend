import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Patient } from '../utils/types';
import { Colors } from '../constants/Colors';

interface PatientCardProps {
    patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Hi, Dr. Shreya. Good to see you.</Text>

            <Text style={styles.symptoms}>
                I've been having a persistent cough lately, and I've noticed I'm losing weight without trying. I'm a bit concerned because I've been a smoker for many years.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 0, // No border radius to match Figma
    },
    greeting: {
        fontSize: 16,
        color: Colors.text.primary,
        marginBottom: 20,
        lineHeight: 22,
    },
    symptoms: {
        fontSize: 16,
        color: Colors.text.primary,
        lineHeight: 24,
    },
});