import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TestResultCard } from './TestResultCard';
import { Message } from '../utils/types';
import { Colors } from '../constants/Colors';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.sender === 'user';

    if (isUser) {
        return (
            <View style={styles.userContainer}>
                <Text style={styles.youLabel}>YOU</Text>
                <View style={styles.userAvatar}>
                    <Ionicons name="person" size={16} color={Colors.primary} />
                </View>
                <View style={styles.userBubble}>
                    <Text style={styles.userText}>{message.content}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.aiContainer}>
            <View style={styles.aiAvatar}>
                <Ionicons name="person" size={16} color={Colors.primary} />
            </View>

            <View style={styles.aiBubble}>
                <View style={styles.aiHeader}>
                    <Text style={styles.senderName}>SENIOR DOCTOR</Text>
                    {message.testResult && (
                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreText}>5/5 points</Text>
                            <View style={styles.scoreIcon}>
                                <Ionicons name="information" size={12} color="white" />
                            </View>
                        </View>
                    )}
                </View>

                {message.testResult ? (
                    <View>
                        <Text style={styles.aiText}>Great choice, Doctor! Here are the results from the report:</Text>
                        <TestResultCard testResult={message.testResult} />
                        <Text style={styles.aiText}>What is the differential diagnosis we should be doing?</Text>
                    </View>
                ) : (
                    <Text style={styles.aiText}>{message.content}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    userContainer: {
        flexDirection: 'row',
        marginVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    aiContainer: {
        flexDirection: 'row',
        marginVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'flex-start',
    },
    youLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        marginRight: 8,
        marginBottom: 4,
    },
    userAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 4,
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
    userBubble: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomRightRadius: 4,
        maxWidth: '70%',
    },
    aiBubble: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        flex: 1,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    aiHeader: {
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
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    scoreText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    scoreIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userText: {
        color: 'white',
        fontSize: 16,
        lineHeight: 22,
    },
    aiText: {
        color: Colors.text.primary,
        fontSize: 16,
        lineHeight: 22,
    },
});