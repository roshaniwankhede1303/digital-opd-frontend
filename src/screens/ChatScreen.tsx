import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
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
        showScore
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
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading next patient...</Text>
                    {/* You can add a spinner here */}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {patientInfo?.patientName || "Loading..."}
                </Text>
                <TouchableOpacity onPress={handleNextPatient}><Text>New Patient</Text></TouchableOpacity>
            </View>

            {/* Status */}
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
                <View style={styles.chatContainer}>
                    {/* <View style={styles.status}>
                        <Text>Socket: {isConnected ? "✅" : "❌"}</Text>
                        <Text>Ready: {isReady ? "✅" : "❌"}</Text>
                    </View> */}
                    <ScrollView style={styles.messages}>
                        {/* Patient Info */}
                        <View style={styles.patientCard}>
                            <Text style={styles.greeting}>
                                Hi, Dr. Shreya. Good to see you.
                            </Text>
                            <Text style={styles.symptoms}>
                                I've been having a persistent cough lately, and I've noticed I'm
                                losing weight without trying. I'm a bit concerned because I've
                                been a smoker for many years.
                            </Text>
                        </View>
                        {/* Chat Messages */}
                        {messages.map((msg, index) => (
                            <View
                                key={index}
                                style={msg.sender === "user" ? styles.userMsg : styles.aiMsg}
                            >
                                {msg.sender === "ai" && (
                                    <View style={styles.aiHeader}>
                                        <Text style={styles.aiTitle}>SENIOR DOCTOR</Text>
                                        <Text style={styles.scoreText}>
                                            ({testScore} points)({diagnosisScore} points)
                                        </Text>
                                    </View>
                                )}
                                <Text
                                    style={
                                        msg.sender === "user" ? styles.userText : styles.aiText
                                    }
                                >
                                    {msg.content}
                                </Text>
                            </View>
                        ))}

                        {isLoading && (
                            <View style={styles.loading}>
                                <Text>AI Doctor is thinking...</Text>
                            </View>
                        )}
                    </ScrollView>
                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Enter your response"
                            editable={isReady && !isLoading}
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
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    header: {
        backgroundColor: "#4A90E2",
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { color: "white", fontSize: 16, fontWeight: "bold" },
    points: { color: "white", fontSize: 14 },
    status: {
        backgroundColor: "#e0e0e0",
        padding: 8,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    btn: {
        backgroundColor: "#ff6b6b",
        padding: 8,
        borderRadius: 4,
    },
    // 🔥 MAIN FIX: Add proper flex structure
    chatContainer: {
        flex: 1, // This makes it take remaining space
        flexDirection: "column",
    },
    messages: {
        flex: 1, // This makes ScrollView take available space
        padding: 16,
    },
    patientCard: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    greeting: { fontSize: 16, marginBottom: 12 },
    symptoms: { fontSize: 16, lineHeight: 22 },
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
    },
    userText: { color: "white", fontSize: 16 },
    aiText: { fontSize: 16 },
    aiTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#4A90E2",
        marginBottom: 4,
    },
    loading: {
        padding: 16,
        alignItems: "center",
    },
    inputContainer: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "white",
        alignItems: "center",
        // Add border top to separate from messages
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
    },
    sendBtn: {
        backgroundColor: "#4A90E2",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendText: { color: "white", fontWeight: "bold" },
    aiHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    scoreText: {
        fontSize: 12,
        color: "#666",
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
        minWidth: 200, // Optional: set minimum width
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
    newPatientText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
