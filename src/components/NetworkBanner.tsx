import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export const NetworkBanner = ({ isConnected, syncStatus, connectionType, onRetrySync }) => {
    const [slideAnim] = useState(new Animated.Value(-50));
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const shouldShow = !isConnected || ['syncing', 'synced', 'sync_failed'].includes(syncStatus);

        if (shouldShow !== showBanner) {
            setShowBanner(shouldShow);

            Animated.timing(slideAnim, {
                toValue: shouldShow ? 0 : -50,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isConnected, syncStatus, showBanner]);

    const getBannerConfig = () => {
        if (!isConnected) {
            return {
                text: `📱 Offline Mode${connectionType ? ` (${connectionType})` : ''} - Data will sync when connected`,
                backgroundColor: '#ff9500',
                textColor: 'white',
                showRetry: false
            };
        }

        switch (syncStatus) {
            case 'syncing':
                return {
                    text: '🔄 Syncing data...',
                    backgroundColor: '#007AFF',
                    textColor: 'white',
                    showRetry: false
                };
            case 'synced':
                return {
                    text: '✅ Data synced successfully',
                    backgroundColor: '#34C759',
                    textColor: 'white',
                    showRetry: false
                };
            case 'sync_failed':
                return {
                    text: '❌ Sync failed - Tap to retry',
                    backgroundColor: '#FF3B30',
                    textColor: 'white',
                    showRetry: true
                };
            default:
                return null;
        }
    };

    const config = getBannerConfig();

    if (!config || !showBanner) return null;

    return (
        <Animated.View
            style={[
                styles.banner,
                {
                    backgroundColor: config.backgroundColor,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <TouchableOpacity
                style={styles.bannerContent}
                onPress={config.showRetry ? onRetrySync : undefined}
                disabled={!config.showRetry}
            >
                <Text style={[styles.bannerText, { color: config.textColor }]}>
                    {config.text}
                </Text>
                {config.showRetry && (
                    <Text style={[styles.retryText, { color: config.textColor }]}>
                        TAP TO RETRY
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    banner: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    bannerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    retryText: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 2,
        opacity: 0.8,
    },
});