import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface LoadingSpinnerProps {
    text?: string;
    size?: 'small' | 'large';
}

export function LoadingSpinner({ text = 'Loading...', size = 'large' }: LoadingSpinnerProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={Colors.primary} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.text.secondary,
    },
});