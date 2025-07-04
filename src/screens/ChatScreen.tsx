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
    Alert,
} from "react-native";
import { useGame } from "../hooks/useGame";
import { Colors } from "../constants/Colors";
import { ScoreScreen } from "./ScoreScreen";
import { NetworkBanner } from "../components/NetworkBanner";

export function ChatScreen(): React.ReactElement {
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
        isInitialLoading,
        isNetworkConnected,
        connectionType,
        syncStatus,
        patientQuery,
        handleRetrySync,
        queuedEventsCount,
    } = useGame();

    const handleSend = async (): Promise<void> => {
        if (!inputText.trim() || !isReady) return;

        const success = await sendMessage(inputText.trim());
        if (success) {
            setInputText("");
        }
    };

    // Debug function for testing (remove in production)
    const showDebugInfo = (): void => {
        Alert.alert(
            "Debug Info",
            `Network: ${isNetworkConnected}\nSocket: ${isConnected}\nSync: ${syncStatus}\nQueued: ${queuedEventsCount}\nMode: ${isNetworkConnected ? 'ONLINE' : 'OFFLINE'}`,
            [{ text: "OK" }]
        );
    };

    // Show initial loading screen
    if (isInitialLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading patient data...</Text>
                    <Text style={styles.loadingSubText}>
                        {isNetworkConnected ? "Connecting to server..." : "Loading offline data..."}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show loading screen when loading next patient (only when online)
    if (isLoadingNextPatient && isNetworkConnected) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
                <NetworkBanner
                    isConnected={isNetworkConnected}
                    syncStatus={syncStatus}
                    connectionType={connectionType}
                    onRetrySync={handleRetrySync}
                />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading next patient...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

            {/* Network Status Banner */}
            <NetworkBanner
                isConnected={isNetworkConnected}
                syncStatus={syncStatus}
                connectionType={connectionType}
                onRetrySync={handleRetrySync}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>
                        {patientInfo?.patientName || "Loading..."}
                    </Text>
                    <Text style={styles.connectionStatus}>
                        {isNetworkConnected ?
                            (isConnected ? "🌐 Online" : "🔄 Connecting...") :
                            "📱 Offline"
                        }
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {queuedEventsCount > 0 && (
                        <View style={styles.queueBadge}>
                            <Text style={styles.queueBadgeText}>{queuedEventsCount}</Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={handleNextPatient} style={styles.newPatientButton}>
                        <Text style={styles.nextPatientText}>New Patient</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Debug Button - Remove in production */}
            {/* {__DEV__ && (
                <TouchableOpacity
                    style={styles.debugButton}
                    onPress={showDebugInfo}
                >
                    <Text style={styles.debugButtonText}>DEBUG</Text>
                </TouchableOpacity>
            )} */}

            {/* Show Score Screen or Chat Interface */}
            {showScore ? (
                <View style={styles.nextPatientContainer}>
                    <ScoreScreen testScore={testScore} diagnosisScore={diagnosisScore} />
                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            { backgroundColor: isNetworkConnected ? Colors.primary : '#ff9500' }
                        ]}
                        onPress={handleNextPatient}
                    >
                        <Text style={styles.nextButtonText}>
                            {isNetworkConnected ? "NEXT PATIENT" : "QUEUE NEXT PATIENT"}
                        </Text>
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
                                {patientQuery || "Patient information will load when connected..."}
                            </Text>
                            {!isNetworkConnected && (
                                <Text style={styles.offlineNotice}>
                                    📱 Viewing offline data. Connect to internet for latest information.
                                </Text>
                            )}
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
                                                Test: {testScore}/5
                                            </Text>
                                            <Text style={styles.scoreText}>
                                                Diagnosis: {diagnosisScore}/5
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.userHeader}>
                                        <Text style={styles.userTitle}>YOU</Text>
                                        <View style={styles.userStatusContainer}>
                                            {!isNetworkConnected && (
                                                <Text style={styles.offlineIndicator}>📱</Text>
                                            )}
                                            {msg.synced === false && (
                                                <Text style={styles.pendingIndicator}>⏳</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                                <Text
                                    style={
                                        msg.sender === "user" ? styles.userText : styles.aiText
                                    }
                                >
                                    {msg.content}
                                </Text>
                                {msg.sender === "user" && !isNetworkConnected && (
                                    <Text style={styles.offlineMessageNote}>
                                        Saved offline - will send when connected
                                    </Text>
                                )}
                            </View>
                        ))}

                        {/* Loading State */}
                        {isLoading && (
                            <View style={styles.loading}>
                                <Text style={styles.loadingText}>
                                    {isNetworkConnected ?
                                        "AI Doctor is thinking..." :
                                        "Message saved - will send when online"
                                    }
                                </Text>
                            </View>
                        )}

                        {/* Empty State for No Messages */}
                        {messages.length === 0 && !isLoading && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    {isNetworkConnected ?
                                        "Start the conversation by describing your symptoms" :
                                        "Previous conversation will appear here when available"
                                    }
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Container */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    !isNetworkConnected && styles.textInputOffline
                                ]}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder={
                                    isNetworkConnected ?
                                        "Enter your response..." :
                                        "Type message (will sync when online)..."
                                }
                                placeholderTextColor={isNetworkConnected ? "#999" : "#ff9500"}
                                editable={isReady}
                                multiline={false}
                                returnKeyType="send"
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                style={[
                                    styles.sendBtn,
                                    {
                                        opacity: isReady && inputText.trim() ? 1 : 0.5,
                                        backgroundColor: isNetworkConnected ? "#4A90E2" : "#ff9500"
                                    },
                                ]}
                                disabled={!isReady || !inputText.trim()}
                            >
                                <Text style={styles.sendText}>
                                    {isNetworkConnected ? "SEND" : "SAVE"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Connection Status Footer */}
                        <View style={styles.connectionFooter}>
                            <Text style={styles.connectionFooterText}>
                                {isNetworkConnected ?
                                    (isConnected ? "✅ Connected to server" : "🔄 Connecting to server...") :
                                    `📱 Offline mode • ${queuedEventsCount} items queued for sync`
                                }
                            </Text>
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
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 70,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    connectionStatus: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 12,
        fontWeight: "500",
    },
    queueBadge: {
        backgroundColor: "#ff9500",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: "center",
    },
    queueBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    newPatientButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    nextPatientText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold"
    },
    debugButton: {
        position: "absolute",
        top: 120,
        right: 10,
        backgroundColor: "red",
        padding: 8,
        borderRadius: 4,
        zIndex: 1000,
    },
    debugButtonText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
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
        paddingBottom: 20,
    },
    patientCard: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    symptoms: {
        fontSize: 16,
        lineHeight: 22,
        color: "#333",
        marginBottom: 8,
    },
    offlineNotice: {
        fontSize: 12,
        color: "#ff9500",
        fontStyle: "italic",
        marginTop: 8,
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userText: {
        color: "white",
        fontSize: 16,
        lineHeight: 20,
    },
    aiText: {
        fontSize: 16,
        color: "#333",
        lineHeight: 20,
    },
    aiTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#4A90E2",
    },
    userTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFF",
    },
    aiHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userStatusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    scoreContainer: {
        flexDirection: "row",
        gap: 8,
    },
    scoreText: {
        fontSize: 11,
        color: "#666",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    offlineIndicator: {
        fontSize: 12,
    },
    pendingIndicator: {
        fontSize: 12,
    },
    offlineMessageNote: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.7)",
        fontStyle: "italic",
        marginTop: 4,
    },
    loading: {
        padding: 16,
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 8,
        marginVertical: 8,
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    loadingSubText: {
        fontSize: 12,
        color: "#999",
        textAlign: "center",
        marginTop: 4,
    },
    emptyState: {
        padding: 32,
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        lineHeight: 20,
    },
    inputWrapper: {
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
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
    textInputOffline: {
        borderColor: "#ff9500",
        backgroundColor: "#fff7e6",
    },
    sendBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        minWidth: 70,
        alignItems: "center",
    },
    sendText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    connectionFooter: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 0 : 8,
        paddingTop: 4,
    },
    connectionFooterText: {
        fontSize: 11,
        color: "#666",
        textAlign: "center",
    },
    nextPatientContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    nextButton: {
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
        padding: 20,
    },
});