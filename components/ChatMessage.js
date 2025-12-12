import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatMessage = ({ item, theme }) => {
    const isUser = item.type === 'user';
    const isSystem = item.type === 'system';

    // Typewriter state
    const [displayContent, setDisplayContent] = useState('');
    const [completed, setCompleted] = useState(false);
    const [showThought, setShowThought] = useState(false);

    useEffect(() => {
        if (isUser || isSystem) {
            setDisplayContent(item.content);
            setCompleted(true);
            return;
        }

        if (completed) return;

        // Typewriter effect for bot
        let i = 0;
        const speed = 10;
        const interval = setInterval(() => {
            if (!item.content) {
                clearInterval(interval);
                setCompleted(true);
                return;
            }
            if (i >= item.content.length) {
                clearInterval(interval);
                setCompleted(true);
                return;
            }
            i = Math.min(i + 2, item.content.length);
            setDisplayContent(item.content.substring(0, i));

            if (i >= item.content.length) {
                clearInterval(interval);
                setCompleted(true);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [item.content, isUser, isSystem]);

    if (isSystem) {
        return (
            <View style={[styles.systemBubble, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
                <Text style={[styles.systemText, { color: theme.success }]}>{item.content}</Text>
            </View>
        );
    }

    return (
        <View style={{ marginBottom: 16, maxWidth: '90%', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
            {/* Thought Process Bubble (Collapsible) */}
            {!isUser && item.thought && (
                <TouchableOpacity
                    onPress={() => setShowThought(!showThought)}
                    style={[styles.thoughtContainer, { backgroundColor: theme.surfaceElevated }]}
                >
                    <Text style={[styles.thoughtLabel, { color: theme.textSecondary }]}>
                        {showThought ? 'Hide Thought Process 🧠' : 'View Thought Process 💭'}
                    </Text>
                    {showThought && (
                        <Text style={[styles.thoughtText, { color: theme.textSecondary }]}>
                            {item.thought}
                        </Text>
                    )}
                </TouchableOpacity>
            )}

            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.botBubble,
                { backgroundColor: isUser ? theme.primary : theme.surface }
            ]}>
                {isUser ? (
                    <Text style={[styles.messageText, { color: '#fff' }]}>{item.content}</Text>
                ) : (
                    <Markdown
                        style={getMarkdownStyles(theme)}
                    >
                        {displayContent}
                    </Markdown>
                )}
            </View>
        </View>
    );
};

// Custom Markdown Styles to match app theme
const getMarkdownStyles = (theme) => ({
    body: {
        color: theme.text,
        fontSize: 16,
        lineHeight: 22,
    },
    strong: {
        fontWeight: 'bold',
        color: theme.text,
    },
    link: {
        color: theme.primary,
        textDecorationLine: 'underline',
    },
    code_inline: {
        backgroundColor: theme.background,
        color: theme.text,
        borderRadius: 4,
        paddingHorizontal: 4,
    },
    fence: {
        backgroundColor: theme.background,
        color: theme.text,
        padding: 8,
        borderRadius: 4,
    },
});

const styles = StyleSheet.create({
    messageBubble: {
        maxWidth: '100%',
        padding: 12,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    botBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
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
    },
    thoughtContainer: {
        marginBottom: 8,
        padding: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        width: '100%',
    },
    thoughtLabel: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '600',
    },
    thoughtText: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
        lineHeight: 18,
    }
});

export default ChatMessage;
