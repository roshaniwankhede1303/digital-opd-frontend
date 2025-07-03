import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from "react-native";
import { useGame } from "../hooks/useGame";
import { Colors } from "../constants/Colors";
import { ScoreScreen } from "./ScoreScreen";

export function ChatScreen() {
    const [inputText, setInputText] = useState<string>("");

    const {
        messages,
        sendMessage,
        isLoading,
        isConnected,
        isReady,
        testScore,
        diagnosisScore,
        eventName,
        handleNextPatient,
        patientInfo,
        isLoadingNextPatient,
        showScore,
        patientQuery,
    } = useGame();

    const handleSend = async () => {
        if (!inputText.trim() || !isReady) return;

        const success = await sendMessage(inputText.trim());
        if (success) {
            setInputText("");
        }
    };

    // Show loading screen when loading next patient
    if (isLoadingNextPatient) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading next patient...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {patientInfo?.patientName || "Loading..."}
                </Text>
                <TouchableOpacity onPress={handleNextPatient}>
                    <Text style={styles.nextPatientText}>New Patient</Text>
                </TouchableOpacity>
            </View>

            {/* Show Score Screen or Chat Interface */}
            {showScore ? (
                <View style={styles.nextPatientContainer}>
                    <ScoreScreen />
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNextPatient}
                    >
                        <Text style={styles.nextButtonText}>NEXT PATIENT</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        style={styles.messages}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Patient Info */}
                        <View style={styles.patientCard}>
                            <Text style={styles.symptoms}>
                                {patientQuery}
                            </Text>
                        </View>

                        {/* Chat Messages */}
                        {messages.map((msg, index) => (
                            <View
                                key={index}
                                style={msg.sender === "user" ? styles.userMsg : styles.aiMsg}
                            >
                                {msg.sender === "ai" ? (
                                    <View style={styles.aiHeader}>
                                        <Text style={styles.aiTitle}>SENIOR AI DOCTOR</Text>
                                        <View style={styles.scoreContainer}>
                                            <Text style={styles.scoreText}>
                                                Test: {testScore}
                                            </Text>
                                            <Text style={styles.scoreText}>
                                                Diagnosis: {diagnosisScore}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.userHeader}>
                                        <Text style={styles.userTitle}>YOU</Text>
                                    </View>
                                )}
                                <Text
                                    style={
                                        msg.sender === "user" ? styles.userText : styles.aiText
                                    }
                                >
                                    {msg.content ? msg.content : "Loading..."}
                                </Text>
                            </View>
                        ))}

                        {isLoading && (
                            <View style={styles.loading}>
                                <Text>AI Doctor is thinking...</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Container - Fixed position */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Enter your response"
                                editable={isReady && !isLoading}
                                multiline={false}
                                returnKeyType="send"
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                style={[
                                    styles.sendBtn,
                                    { opacity: isReady && inputText.trim() ? 1 : 0.5 },
                                ]}
                                disabled={!isReady || !inputText.trim() || isLoading}
                            >
                                <Text style={styles.sendText}>SEND</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    header: {
        backgroundColor: "#4A90E2",
        paddingTop: Platform.OS === 'android' ? 10 : 0, // ✅ Fix: Remove extra padding, SafeAreaView handles it
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // ✅ Fix: Ensure header doesn't overlap
        minHeight: 60,
    },
    title: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    nextPatientText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold"
    },
    chatContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    messages: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 20, // ✅ Add bottom padding for better spacing
    },
    patientCard: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    symptoms: {
        fontSize: 16,
        lineHeight: 22,
        color: "#333"
    },
    userMsg: {
        backgroundColor: "#4A90E2",
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        alignSelf: "flex-end",
        maxWidth: "80%",
    },
    aiMsg: {
        backgroundColor: "white",
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        alignSelf: "flex-start",
        maxWidth: "80%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userText: {
        color: "white",
        fontSize: 16
    },
    aiText: {
        fontSize: 16,
        color: "#333"
    },
    aiTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#4A90E2",
    },
    userTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#fff",
    },
    aiHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 8,
    },
    scoreContainer: {
        flexDirection: "row",
        gap: 10,
    },
    scoreText: {
        fontSize: 11,
        color: "#666",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    loading: {
        padding: 16,
        alignItems: "center",
    },
    // ✅ Fix: Separate wrapper for consistent positioning
    inputWrapper: {
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        // ✅ Fix: Use safe area padding
        paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        backgroundColor: "#f9f9f9",
        fontSize: 16,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: "#4A90E2",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        minWidth: 60,
        alignItems: "center",
    },
    sendText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    nextPatientContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
    },
    nextButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: "center",
        minWidth: 200,
        position: "absolute",
        bottom: 30,
    },
    nextButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
});