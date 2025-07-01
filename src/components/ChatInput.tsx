// src/components/ChatInput.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
    onSend: (message: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    placeholder = "Enter your response",
    disabled = false
}) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, disabled && styles.inputDisabled]}
                value={message}
                onChangeText={setMessage}
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline
                editable={!disabled}
                onSubmitEditing={handleSend}
            />
            <TouchableOpacity
                style={[styles.sendButton, (!message.trim() || disabled) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!message.trim() || disabled}
            >
                <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    inputDisabled: {
        backgroundColor: '#F5F5F5',
        color: '#999',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
});