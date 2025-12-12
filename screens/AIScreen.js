import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal, SafeAreaView, Animated, Image, Alert, ActivityIndicator } from 'react-native';
import { useNotes } from '../context/NotesContext';
import { useEvents } from '../context/EventsContext';
import { processAICommand, getAIConfig, saveAIConfig, improvePrompt } from '../utils/aiLogic';
import { Ionicons } from '@expo/vector-icons';
import { themes } from '../constants/theme';
import ChatMessage from '../components/ChatMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TypingIndicator = ({ theme }) => {
    const [dot1] = useState(new Animated.Value(0));
    const [dot2] = useState(new Animated.Value(0));
    const [dot3] = useState(new Animated.Value(0));

    useEffect(() => {
        const anim = (dot, delay) => {
            return Animated.sequence([
                Animated.delay(delay),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
                        Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true })
                    ])
                )
            ]);
        };

        const a1 = anim(dot1, 0);
        const a2 = anim(dot2, 200);
        const a3 = anim(dot3, 400);

        Animated.parallel([a1, a2, a3]).start();
    }, []);

    const dotStyle = (dot) => ({
        opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
        transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }]
    });

    return (
        <View style={[styles.botBubble, styles.messageBubble, { backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', height: 46 }]}>
            <Animated.View style={[styles.dot, { backgroundColor: theme.textSecondary }, dotStyle(dot1)]} />
            <Animated.View style={[styles.dot, { backgroundColor: theme.textSecondary }, dotStyle(dot2)]} />
            <Animated.View style={[styles.dot, { backgroundColor: theme.textSecondary }, dotStyle(dot3)]} />
        </View>
    );
};


const AIScreen = ({ theme }) => {
    const { entries } = useNotes();
    const { events, addEvent } = useEvents();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [aiConfig, setAiConfig] = useState({ baseUrl: '', model: '' });
    const [isEnhancing, setIsEnhancing] = useState(false);

    const flatListRef = useRef(null);

    // Persistence: Load Messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const saved = await AsyncStorage.getItem('ai_messages');
                if (saved) setMessages(JSON.parse(saved));
            } catch (e) {
                console.log('Failed to load messages');
            }
        };
        loadMessages();
    }, []);

    // Persistence: Save Messages
    useEffect(() => {
        const saveMessages = async () => {
            try {
                await AsyncStorage.setItem('ai_messages', JSON.stringify(messages));
            } catch (e) {
                console.log('Failed to save messages');
            }
        };
        if (messages.length > 0) saveMessages();
    }, [messages]);

    useEffect(() => {
        const resetConfig = async () => {
            const defaultUrl = Platform.OS === 'web' ? 'http://localhost:11434' : 'http://10.0.2.2:11434';
            const config = { baseUrl: defaultUrl, model: 'llama3.2:1b' }; // Start fresh
            await saveAIConfig(config);
            setAiConfig(config);
        };
        resetConfig();
    }, []);

    const handleSaveConfig = async () => {
        await saveAIConfig(aiConfig);
        setSettingsVisible(false);
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', content: '⚙️ AI Configuration Saved!' }]);
    };

    const clearHistory = async () => {
        setMessages([]);
        await AsyncStorage.removeItem('ai_messages');
    };

    // ----- NEW FEATURE: Prompt Enhancer -----
    const handleEnhance = async () => {
        if (!inputText.trim()) {
            Alert.alert("Empty Prompt", "Please type something first to enhance it! ✨");
            return;
        }

        setIsEnhancing(true);
        try {
            const improved = await improvePrompt(inputText);
            if (improved) {
                setInputText(improved);
            }
        } catch (e) {
            Alert.alert("Enhance Failed", "Could not improve prompt. Check AI connection.");
        } finally {
            setIsEnhancing(false);
        }
    };

    // ----- Placeholders for Mic and Attach -----
    const handleMic = () => {
        Alert.alert("Voice Input", "Voice recognition module is not yet installed. \n\n(Requires native dependencies)");
    };

    const handleAttach = () => {
        Alert.alert("Attachments", "File attachment support is coming in the next update! 📎");
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now().toString(), type: 'user', content: inputText };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        const loadingId = 'loading-' + Date.now();
        setMessages(prev => [...prev, { id: loadingId, type: 'loading', content: '' }]);

        const response = await processAICommand(inputText, entries, events);

        // Remove loading message
        setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== loadingId);
            const newMessages = [...filtered];

            // Add Text Response
            newMessages.push({
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: response.content,
                dataType: response.type,
                data: response.data,
                thought: response.thought
            });

            // Handle Action
            if (response.type === 'action' && response.action.type === 'create_event') {
                const eventData = response.action.data;
                // Add event to context
                addEvent(eventData);

                // Add System Message confirming action
                newMessages.push({
                    id: (Date.now() + 2).toString(),
                    type: 'system',
                    content: `📅 Event Created: ${eventData.title} on ${eventData.date}`
                });
            }

            return newMessages;
        });
    };

    useEffect(() => {
        if (flatListRef.current) {
            setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    const renderMessage = ({ item }) => {
        if (item.type === 'loading') {
            return <TypingIndicator theme={theme} />;
        }
        return <ChatMessage item={item} theme={theme} />;
    };

    const renderGreeting = () => (
        <View style={styles.greetingContainer}>
            <Text style={[styles.greetingTitle, { color: theme.text }]}>Hi User,</Text>
            <Text style={[styles.greetingSubtitle, { color: theme.textSecondary }]}>What can I help you organize today?</Text>

            <View style={styles.suggestionRow}>
                <TouchableOpacity style={[styles.suggestionChip, { backgroundColor: theme.surface }]} onPress={() => setInputText("Schedule a meeting tomorrow")}>
                    <Text style={{ color: theme.text }}>📅 Schedule Meeting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.suggestionChip, { backgroundColor: theme.surface }]} onPress={() => setInputText("Summarize my notes")}>
                    <Text style={{ color: theme.text }}>📝 Summarize Notes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>AI Assistant</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={clearHistory}>
                        <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                        <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {messages.length === 0 ? (
                renderGreeting()
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                />
            )}

            {/* Floating Input Bar (Replit Style) */}
            <View style={styles.floatingInputWrapper}>
                <View style={[styles.floatingInputContainer, { backgroundColor: theme.surfaceElevated, shadowColor: theme.text }]}>

                    {/* Replit-like Left Icons */}
                    <TouchableOpacity style={styles.iconButton} onPress={handleAttach}>
                        <Ionicons name="attach-outline" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleMic}>
                        <Ionicons name="mic-outline" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Ask me something..."
                        placeholderTextColor={theme.textTertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                    />

                    {/* Pencil / Edit Icon (Enhancer) */}
                    <TouchableOpacity style={styles.iconButton} onPress={handleEnhance} disabled={isEnhancing}>
                        {isEnhancing ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <Ionicons name="sparkles-outline" size={20} color={theme.textSecondary} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.primary }]}
                        onPress={handleSend}
                    >
                        <Ionicons name="arrow-up" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Settings Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={settingsVisible}
                onRequestClose={() => setSettingsVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Offline Brain Settings 🧠</Text>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Server URL</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            value={aiConfig.baseUrl}
                            onChangeText={(text) => setAiConfig({ ...aiConfig, baseUrl: text })}
                            placeholder="http://10.0.2.2:11434"
                            placeholderTextColor={theme.textTertiary}
                            autoCapitalize="none"
                        />

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Model Name</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            value={aiConfig.model}
                            onChangeText={(text) => setAiConfig({ ...aiConfig, model: text })}
                            placeholder="llama3.2:1b"
                            placeholderTextColor={theme.textTertiary}
                            autoCapitalize="none"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]} onPress={() => setSettingsVisible(false)}>
                                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.primary }]} onPress={handleSaveConfig}>
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    greetingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 80,
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    greetingSubtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.7,
    },
    suggestionRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    suggestionChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    messagesList: {
        padding: 16,
        paddingBottom: 100,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 18,
        marginBottom: 16,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    floatingInputWrapper: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    floatingInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        height: 56,
        borderRadius: 28,
        paddingHorizontal: 8,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontSize: 16,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    iconButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    modalInput: {
        height: 50,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    systemBubble: {
        alignSelf: 'center',
        padding: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
        marginTop: 4,
    },
    systemText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default AIScreen;
