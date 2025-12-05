import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, Animated, Pressable } from 'react-native';

const InputArea = ({ onSend, theme, editingItem, onCancelEdit }) => {
    const [text, setText] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (editingItem) {
            setText(editingItem.content);
        } else {
            setText('');
        }
    }, [editingItem]);

    useEffect(() => {
        if (text.trim()) {
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [text]);

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            if (!editingItem) setText('');
        }
    };

    const characterCount = text.length;
    const maxLength = 500;
    const isNearLimit = characterCount > maxLength * 0.8;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={[styles.container, { backgroundColor: theme.surface }]}
        >
            {/* Top decorative line */}
            <View style={[styles.topLine, { backgroundColor: theme.divider }]} />

            {editingItem && (
                <View style={[styles.editBanner, { backgroundColor: theme.primaryLight }]}>
                    <View style={styles.editBannerLeft}>
                        <View style={[styles.editIndicator, { backgroundColor: theme.primary }]} />
                        <Text style={[styles.editBannerText, { color: theme.primary }]}>Editing note</Text>
                    </View>
                    <TouchableOpacity onPress={onCancelEdit} style={[styles.cancelButton, { backgroundColor: theme.dangerLight }]}>
                        <Text style={[styles.cancelText, { color: theme.danger }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.backgroundSecondary || theme.background,
                                color: theme.text,
                                borderColor: text.trim() ? theme.primary : 'transparent',
                            }
                        ]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={theme.textTertiary || theme.textSecondary}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={maxLength}
                    />
                    {/* Character counter */}
                    <View style={styles.counterContainer}>
                        <Text style={[
                            styles.counterText,
                            { color: isNearLimit ? theme.warning : theme.textTertiary || theme.textSecondary }
                        ]}>
                            {characterCount}/{maxLength}
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={handleSend}
                    onPressIn={() => {
                        Animated.spring(scaleAnim, {
                            toValue: 0.9,
                            useNativeDriver: true,
                        }).start();
                    }}
                    onPressOut={() => {
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            useNativeDriver: true,
                        }).start();
                    }}
                    disabled={!text.trim()}
                >
                    <Animated.View style={[
                        styles.sendButton,
                        {
                            backgroundColor: text.trim() ? theme.primary : theme.border,
                            transform: [{ scale: scaleAnim }],
                            shadowColor: text.trim() ? theme.primary : 'transparent',
                            shadowOpacity: text.trim() ? 0.4 : 0,
                        }
                    ]}>
                        <Text style={styles.sendIcon}>
                            {editingItem ? '✓' : '↑'}
                        </Text>
                    </Animated.View>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    topLine: {
        height: 1,
    },
    editBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 10,
    },
    editBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editIndicator: {
        width: 3,
        height: 16,
        borderRadius: 1.5,
        marginRight: 10,
    },
    editBannerText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    cancelButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    cancelText: {
        fontSize: 13,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        marginRight: 12,
    },
    input: {
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 14,
        fontSize: 15,
        maxHeight: 120,
        borderWidth: 2,
        letterSpacing: 0.2,
    },
    counterContainer: {
        alignItems: 'flex-end',
        paddingRight: 8,
        paddingTop: 6,
    },
    counterText: {
        fontSize: 11,
        fontWeight: '500',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    sendIcon: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
    },
});

export default InputArea;

