import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface NetworkBannerProps {
    isOnline: boolean;
}

export function NetworkBanner({ isOnline }: NetworkBannerProps) {
    const [previousOnlineState, setPreviousOnlineState] = useState(isOnline);
    const [showBanner, setShowBanner] = useState(false);
    const [bannerType, setBannerType] = useState<'offline' | 'syncing' | 'synced'>('offline');
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (previousOnlineState !== isOnline) {
            if (!isOnline) {
                // Going offline
                setBannerType('offline');
                setShowBanner(true);
            } else {
                // Coming online
                setBannerType('syncing');
                setShowBanner(true);

                // Simulate sync process
                setTimeout(() => {
                    setBannerType('synced');
                    setTimeout(() => {
                        setShowBanner(false);
                    }, 2000);
                }, 1500);
            }
            setPreviousOnlineState(isOnline);
        }
    }, [isOnline, previousOnlineState]);

    useEffect(() => {
        if (showBanner) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [showBanner, fadeAnim]);

    const getBannerConfig = () => {
        switch (bannerType) {
            case 'offline':
                return {
                    text: 'Offline - Changes will sync when online',
                    icon: 'cloud-offline-outline',
                    color: Colors.error,
                };
            case 'syncing':
                return {
                    text: 'Syncing...',
                    icon: 'sync-outline',
                    color: Colors.warning,
                };
            case 'synced':
                return {
                    text: 'Synced',
                    icon: 'checkmark-circle-outline',
                    color: Colors.success,
                };
        }
    };

    if (!showBanner) return null;

    const config = getBannerConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: config.color, opacity: fadeAnim }
            ]}
        >
            <Ionicons name={config.icon as any} size={16} color="white" />
            <Text style={styles.text}>{config.text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 6,
    },
});