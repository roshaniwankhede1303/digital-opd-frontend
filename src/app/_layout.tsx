import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="score" />
            </Stack>
            <StatusBar style="light" backgroundColor="#4A90E2" />
        </>
    );
}