import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export function AIInitialMessage() {
    return (
        <View style={styles.container}>
            <View style={styles.aiAvatar}>
                <Ionicons name="person" size={16} color={Colors.primary} />
            </View>

            <View style={styles.bubble}>
                <View style={styles.headerRow}>
                    <Text style={styles.senderName}>SENIOR AI DOCTOR</Text>
                    <Ionicons name="volume-medium" size={16} color={Colors.text.disabled} />
                </View>

                <Text style={styles.messageText}>
                    The patient is a 60-year-old male with a history of smoking. He presents with a cough and unintentional weight loss. These symptoms warrant further investigation. Let's go to the lab to diagnose further. What test should we run?
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'flex-start',
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: 4,
    },
    bubble: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        color: Colors.text.primary,
    },
});