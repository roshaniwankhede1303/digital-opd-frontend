// src/app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { databaseService } from '../services/database';
import { TEST_CASES } from '../constants/testCase';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
        },
    },
});

export default function RootLayout() {
    useEffect(() => {
        // Initialize database and load test cases
        const initializeApp = async () => {
            try {
                await databaseService.initialize();

                // Load test cases into database
                for (const testCase of TEST_CASES) {
                    await databaseService.savePatientCase(testCase);
                }

                console.log('App initialized successfully');
            } catch (error) {
                console.error('Failed to initialize app:', error);
            }
        };

        initializeApp();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#6B9AFF',
                    },
                    headerTintColor: 'white',
                    headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: 18,
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Digital OPD',
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="patient/[id]"
                    options={{
                        title: 'Patient Case',
                        headerBackTitle: 'Back',
                    }}
                />
            </Stack>
        </QueryClientProvider>
    );
}