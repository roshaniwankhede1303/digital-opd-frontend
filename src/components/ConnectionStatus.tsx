// src/components/ConnectionStatus.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';

export const ConnectionStatus: React.FC = () => {
    const { connectionStatus, unsyncedActionsCount, isSyncing } = useOfflineSync();
    const [showBanner, setShowBanner] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [currentStatus, setCurrentStatus] = useState<string>('');

    useEffect(() => {
        let newStatus = '';
        let shouldShow = false;

        if (isSyncing) {
            newStatus = 'Syncing...';
            shouldShow = true;
        } else if (!connectionStatus.isOnline) {
            newStatus = 'Offline';
            shouldShow = true;
        } else if (unsyncedActionsCount > 0) {
            newStatus = `${unsyncedActionsCount} actions pending sync`;
            shouldShow = true;
        } else if (connectionStatus.lastSyncAt && Date.now() - connectionStatus.lastSyncAt < 3000) {
            newStatus = 'Synced';
            shouldShow = true;
        }

        // Only show banner if status changed or if we need to show something
        if (newStatus !== currentStatus && shouldShow) {
            setCurrentStatus(newStatus);
            setShowBanner(true);

            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto-hide after 3 seconds (except for persistent states)
            if (newStatus !== 'Offline' && newStatus !== 'Syncing...') {
                setTimeout(() => {
                    // Fade out
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowBanner(false);
                    });
                }, 3000);
            }
        } else if (!shouldShow && showBanner) {
            // Hide banner immediately for states that shouldn't be shown
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowBanner(false);
            });
        }
    }, [connectionStatus, unsyncedActionsCount, isSyncing, currentStatus]);

    if (!showBanner) {
        return null;
    }

    const getStatusColor = () => {
        if (isSyncing) return '#FF9500';
        if (!connectionStatus.isOnline) return '#FF3B30';
        if (unsyncedActionsCount > 0) return '#FF9500';
        return '#34C759';
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: getStatusColor(),
                    opacity: fadeAnim
                }
            ]}
        >
            <Text style={styles.text}>{currentStatus}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'center',
        marginVertical: 8,
        position: 'absolute',
        top: 10,
        zIndex: 1000
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    }
});
