import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useNotes } from '../context/NotesContext';
import { useEvents } from '../context/EventsContext';
import { processAICommand } from '../utils/aiLogic';
import TimelineItem from '../components/TimelineItem';

const AIScreen = ({ theme }) => {
    const { entries } = useNotes();
    const { events } = useEvents();
    const [messages, setMessages] = useState([
        { id: '1', type: 'bot', content: "Hi! I'm your offline assistant. How can I help you manage your notes today?" }
    ]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now().toString(), type: 'user', content: inputText };
        setMessages(prev => [...prev, userMessage]);

        const response = processAICommand(inputText, entries, events);

        setTimeout(() => {
            const botMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: response.content,
                dataType: response.type, // 'text' or 'list'
                data: response.data
            };
            setMessages(prev => [...prev, botMessage]);
        }, 500); // Simulate processing delay

        setInputText('');
    };

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const renderMessage = ({ item }) => {
        const isUser = item.type === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.botBubble,
                { backgroundColor: isUser ? theme.primary : theme.surface }
            ]}>
                <Text style={[
                    styles.messageText,
                    { color: isUser ? '#fff' : theme.text }
                ]}>
                    {item.content}
                </Text>

                {item.dataType === 'list' && item.data && (
                    <View style={styles.listContainer}>
                        {item.data.map((note, index) => (
                            <View key={note.id} style={[styles.miniNote, { borderColor: theme.border }]}>
                                <Text style={[styles.miniNoteTitle, { color: theme.text }]}>
                                    {note.title || 'Untitled Note'}
                                </Text>
                                <Text style={[styles.miniNoteContent, { color: theme.textSecondary }]} numberOfLines={2}>
                                    {note.content}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
            />

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                    placeholder="Ask me something..."
                    placeholderTextColor={theme.textSecondary}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: theme.primary }]}
                    onPress={handleSend}
                >
                    <Text style={styles.sendButtonText}>→</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        marginRight: 12,
        fontSize: 16,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContainer: {
        marginTop: 12,
    },
    miniNote: {
        borderLeftWidth: 3,
        paddingLeft: 8,
        marginBottom: 8,
    },
    miniNoteTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    miniNoteContent: {
        fontSize: 12,
    },
});

export default AIScreen;
