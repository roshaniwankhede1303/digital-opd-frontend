// / src/app / patient / [id].tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Keyboard,
    Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ChatMessage } from '../../components/ChatMessage';
import { ScoreDisplay } from '../../components/ScoreDisplay';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import { usePatientChat } from '../../hooks/usePatientChat';

const { height: screenHeight } = Dimensions.get('window');

export default function PatientScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [inputText, setInputText] = useState('');
    const [showScore, setShowScore] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(10);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const {
        messages,
        patientCase,
        gameSession,
        isLoading,
        submitTest,
        submitDiagnosis,
        isSubmittingTest,
        isSubmittingDiagnosis
    } = usePatientChat(id || '');

    // Handle keyboard events
    useEffect(() => {
        const keyboardWillShow = (event: any) => {
            setKeyboardHeight(event.endCoordinates.height + 30);
            setIsKeyboardVisible(true);
            // Scroll to bottom when keyboard appears
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        };

        const keyboardWillHide = () => {
            setKeyboardHeight(10);
            setIsKeyboardVisible(false);
        };

        const keyboardDidShow = (event: any) => {
            setKeyboardHeight(event.endCoordinates.height + 30);
            setIsKeyboardVisible(true);
        };

        const keyboardDidHide = () => {
            setKeyboardHeight(10);
            setIsKeyboardVisible(false);
        };

        let keyboardWillShowSub: any, keyboardWillHideSub: any, keyboardDidShowSub: any, keyboardDidHideSub: any;

        if (Platform.OS === 'ios') {
            keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
            keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
        } else {
            keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
            keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
        }

        return () => {
            keyboardWillShowSub?.remove();
            keyboardWillHideSub?.remove();
            keyboardDidShowSub?.remove();
            keyboardDidHideSub?.remove();
        };
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    // Show score screen when game is completed
    useEffect(() => {
        if (gameSession?.isCompleted && !showScore) {
            setTimeout(() => {
                setShowScore(true);
            }, 2000); // Delay to let user see the final message
        }
    }, [gameSession?.isCompleted, showScore]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !gameSession) return;

        const message = inputText.trim();
        setInputText('');

        // Determine if this is a test request or diagnosis
        if (gameSession.testAttempts === 0 ||
            (gameSession.labTestPoints === 0 && gameSession.testAttempts > 0)) {
            // Still working on the test phase
            submitTest(message);
        } else {
            // Test is complete, now working on diagnosis
            submitDiagnosis(message);
        }
    };

    const handleNextPatient = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading patient case...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!patientCase) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Patient case not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (showScore && gameSession) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen
                    options={{
                        title: `MR. ${patientCase?.patient.id.toUpperCase()} (${patientCase?.patient.age} Y/O)`,
                        headerRight: () => (
                            <View style={styles.headerPointsContainer}>
                                <Text style={styles.headerPoints}>{gameSession.totalPoints} points</Text>
                                <View style={styles.headerInfoIcon}>
                                    <Text style={styles.headerInfoText}>ℹ️</Text>
                                </View>
                            </View>
                        ),
                    }}
                />
                <ScoreDisplay gameSession={gameSession} />
                <TouchableOpacity
                    style={styles.nextPatientButton}
                    onPress={handleNextPatient}
                >
                    <Text style={styles.nextPatientButtonText}>NEXT PATIENT</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const isSubmitting = isSubmittingTest || isSubmittingDiagnosis;
    const canSend = inputText.trim().length > 0 && !isSubmitting;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: patientCase ? `👨‍⚕️ MR. ${patientCase.patient.id.toUpperCase()} (${patientCase.patient.age} Y/O)` : 'Patient Case',
                    headerRight: () => gameSession ? (
                        <View style={styles.headerPointsContainer}>
                            <Text style={styles.headerPoints}>{gameSession.totalPoints} points</Text>
                            <View style={styles.headerInfoIcon}>
                                <Text style={styles.headerInfoText}>ℹ️</Text>
                            </View>
                        </View>
                    ) : null,
                }}
            />

            <View style={styles.mainContainer}>
                <ConnectionStatus />

                {/* Chat Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={[
                        styles.messagesContainer,
                        {
                            marginBottom: isKeyboardVisible ? keyboardHeight + 70 : 70
                        }
                    ]}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}

                    {isSubmitting && (
                        <View style={styles.typingIndicator}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.typingText}>
                                {isSubmittingTest ? 'Processing test request...' : 'Analyzing diagnosis...'}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area - Fixed at bottom */}
                <View
                    style={[
                        styles.inputContainer,
                        {
                            bottom: isKeyboardVisible ? keyboardHeight : 0,
                            position: 'absolute',
                            left: 0,
                            right: 0
                        }
                    ]}
                >
                    <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Enter your response"
                        multiline
                        maxLength={500}
                        editable={!isSubmitting}
                        onFocus={() => {
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { opacity: canSend ? 1 : 0.5 }
                        ]}
                        onPress={handleSendMessage}
                        disabled={!canSend}
                    >
                        <Text style={styles.sendButtonText}>➤</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    mainContainer: {
        flex: 1,
        position: 'relative'
    },
    headerPointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8
    },
    headerPoints: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4
    },
    headerInfoIcon: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerInfoText: {
        fontSize: 8,
        color: 'white'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        fontSize: 18,
        color: '#FF3B30',
        marginBottom: 20,
        textAlign: 'center'
    },
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    messagesContent: {
        paddingVertical: 16,
        paddingBottom: 20
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    typingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        minHeight: 70,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        maxHeight: 100,
        fontSize: 16,
        marginRight: 12,
        backgroundColor: 'white'
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sendButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },
    nextPatientButton: {
        backgroundColor: '#007AFF',
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    nextPatientButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1
    }
});
