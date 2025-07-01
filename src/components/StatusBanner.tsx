// src/components/StatusBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBannerProps {
    status: 'offline' | 'syncing' | 'synced';
    unsyncedCount?: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, unsyncedCount = 0 }) => {
    if (status === 'synced' && unsyncedCount === 0) return null;

    const getStatusInfo = () => {
        switch (status) {
            case 'offline':
                return {
                    text: `Offline${unsyncedCount > 0 ? ` (${unsyncedCount} pending)` : ''}`,
                    backgroundColor: '#FF6B6B',
                };
            case 'syncing':
                return {
                    text: 'Syncing...',
                    backgroundColor: '#FFA726',
                };
            case 'synced':
                return {
                    text: 'Synced',
                    backgroundColor: '#66BB6A',
                };
        }
    };

    const { text, backgroundColor } = getStatusInfo();

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});