// src/components/ChatMessage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage as ChatMessageType } from '../utils/types';

interface Props {
    message: ChatMessageType;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
    const isUser = message.type === 'user';
    const isDoctor = message.type === 'doctor';
    const isSystem = message.type === 'system';

    const getAvatar = () => {
        if (isUser) return '👨‍⚕️';
        if (isDoctor) return '👩‍⚕️';
        return '🔬';
    };

    const getContainerStyle = () => {
        if (isUser) return [styles.container, styles.userContainer];
        return [styles.container, styles.doctorContainer];
    };

    const getMessageStyle = () => {
        if (isUser) return [styles.message, styles.userMessage];
        return [styles.message, styles.doctorMessage];
    };

    return (
        <View style={getContainerStyle()}>
            {!isUser && (
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{getAvatar()}</Text>
                </View>
            )}

            <View style={styles.messageContainer}>
                {!isUser && (
                    <Text style={styles.senderName}>
                        {isDoctor ? 'SENIOR AI DOCTOR' : 'SYSTEM'}
                        {message.type === 'doctor' && <Text style={styles.soundIcon}> 🔊</Text>}
                    </Text>
                )}

                <View style={getMessageStyle()}>
                    <Text style={isUser ? styles.userText : styles.doctorText}>
                        {message.content}
                    </Text>
                </View>

                {message.points !== undefined && (
                    <View style={styles.pointsContainer}>
                        <Text style={styles.pointsText}>{message.points}/5 points</Text>
                    </View>
                )}
            </View>

            {isUser && (
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{getAvatar()}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'flex-start'
    },
    userContainer: {
        justifyContent: 'flex-end'
    },
    doctorContainer: {
        justifyContent: 'flex-start'
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8
    },
    avatar: {
        fontSize: 20
    },
    messageContainer: {
        flex: 1,
        maxWidth: '75%'
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    soundIcon: {
        fontSize: 10
    },
    message: {
        padding: 12,
        borderRadius: 18,
        marginBottom: 4
    },
    userMessage: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4
    },
    doctorMessage: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 4
    },
    userText: {
        color: 'white',
        fontSize: 16
    },
    doctorText: {
        color: 'black',
        fontSize: 16
    },
    pointsContainer: {
        backgroundColor: '#34C759',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 4
    },
    pointsText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    }
});