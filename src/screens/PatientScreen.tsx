import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { patientService } from '../services/patientService';
import { useLocalDatabase } from '../hooks/useLocalDatabase';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Patient } from '../utils/types';
import { Colors } from '../constants/Colors';

export function PatientsScreen() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();
    const { getPatients, savePatient } = useLocalDatabase();

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setIsLoading(true);
            const patientsData = await patientService.getPatients(getPatients, savePatient);
            setPatients(patientsData);
        } catch (error) {
            console.error('Failed to load patients:', error);
            Alert.alert('Error', 'Failed to load patients');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            const patientsData = await patientService.fetchPatientsFromServer(savePatient);
            setPatients(patientsData);
        } catch (error) {
            console.error('Failed to refresh patients:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handlePatientSelect = (patient: Patient) => {
        router.push(`/chat/${patient.id}`);
    };

    const renderPatientCard = ({ item: patient }: { item: Patient }) => (
        <TouchableOpacity
            style={styles.patientCard}
            onPress={() => handlePatientSelect(patient)}
            activeOpacity={0.7}
        >
            <View style={styles.patientCardHeader}>
                <View style={styles.patientAvatar}>
                    <Ionicons
                        name="person"
                        size={24}
                        color={Colors.primary}
                    />
                </View>
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientAge}>
                        {patient.age} years old • {patient.gender}
                    </Text>
                </View>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.text.disabled}
                />
            </View>

            <View style={styles.patientDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="medical" size={16} color={Colors.text.secondary} />
                    <Text style={styles.detailText} numberOfLines={2}>
                        {patient.symptoms}
                    </Text>
                </View>

                {patient.history && (
                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={Colors.text.secondary} />
                        <Text style={styles.detailText} numberOfLines={2}>
                            {patient.history}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Digital OPD</Text>
                </View>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Digital OPD</Text>
                <Text style={styles.headerSubtitle}>Choose a patient to diagnose</Text>
            </View>

            {/* Patients List */}
            <FlatList
                data={patients}
                keyExtractor={(item) => item.id}
                renderItem={renderPatientCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="medical" size={48} color={Colors.text.disabled} />
                        <Text style={styles.emptyText}>No patients available</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={loadPatients}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Practice your diagnostic skills with virtual patients
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    patientCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    patientCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    patientAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    patientAge: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    patientDetails: {
        paddingLeft: 62,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
    },
    footerText: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
});