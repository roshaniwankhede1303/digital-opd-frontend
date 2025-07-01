// src/components/PatientCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Patient } from '../utils/types';

interface Props {
    patient: Patient;
    points: number;
    onPress: () => void;
}
export const PatientCard: React.FC<Props> = ({ patient, points, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.patientInfo}>
                    <Text style={styles.avatar}>👨‍⚕️</Text>
                    <Text style={styles.patientName}>MR. {patient?.id} ({patient.age} Y/O)</Text>
                </View>
                <View style={styles.pointsContainer}>
                    <Text style={styles.points}>{points} points</Text>
                    <View style={styles.infoIcon}>
                        <Text style={styles.infoText}>ℹ️</Text>
                    </View>
                </View>
            </View>

            <View style={styles.symptoms}>
                <Text style={styles.symptomsText}>
                    {patient.symptoms !== '—' ? patient.symptoms : patient.additionalInfo}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    avatar: {
        fontSize: 20,
        marginRight: 8
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black'
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    points: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4
    },
    infoIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoText: {
        fontSize: 10,
        color: 'white'
    },
    symptoms: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA'
    },
    symptomsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20
    }
});