import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const AuthScreen = ({ theme }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const { login, signup, error } = useAuth();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const formSlide = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        Animated.spring(formSlide, {
            toValue: isLogin ? 0 : 1,
            tension: 65,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, [isLogin]);

    const handleSubmit = async () => {
        setLocalError('');

        if (!email.trim() || !password.trim()) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (!isLogin && !displayName.trim()) {
            setLocalError('Please enter your name');
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                const result = await login(email, password);
                if (!result.success) {
                    setLocalError(result.error);
                }
            } else {
                const result = await signup(email, password, displayName);
                if (!result.success) {
                    setLocalError(result.error);
                }
            }
        } catch (err) {
            setLocalError('An unexpected error occurred');
        }

        setIsLoading(false);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setLocalError('');
    };

    const displayError = localError || error;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.primaryLight }]}>
                            <Text style={styles.logoEmoji}>📝</Text>
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>Timeline</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            {isLogin ? 'Welcome back!' : 'Create your account'}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        {/* Accent bar */}
                        <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

                        {/* Form content */}
                        <View style={styles.formContent}>
                            {!isLogin && (
                                <Animated.View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: theme.backgroundSecondary || theme.background,
                                                color: theme.text,
                                                borderColor: theme.border
                                            }
                                        ]}
                                        placeholder="Your name"
                                        placeholderTextColor={theme.textTertiary || theme.textSecondary}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        autoCapitalize="words"
                                    />
                                </Animated.View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.backgroundSecondary || theme.background,
                                            color: theme.text,
                                            borderColor: theme.border
                                        }
                                    ]}
                                    placeholder="your@email.com"
                                    placeholderTextColor={theme.textTertiary || theme.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.backgroundSecondary || theme.background,
                                            color: theme.text,
                                            borderColor: theme.border
                                        }
                                    ]}
                                    placeholder="••••••••"
                                    placeholderTextColor={theme.textTertiary || theme.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            {/* Error message */}
                            {displayError ? (
                                <View style={[styles.errorContainer, { backgroundColor: theme.dangerLight }]}>
                                    <Text style={[styles.errorText, { color: theme.danger }]}>
                                        {displayError}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Submit button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: theme.primary },
                                    isLoading && { opacity: 0.7 }
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
                                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                            </View>

                            {/* Toggle mode */}
                            <TouchableOpacity
                                style={[styles.toggleButton, { borderColor: theme.border }]}
                                onPress={toggleMode}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.toggleButtonText, { color: theme.text }]}>
                                    {isLogin ? 'Create new account' : 'I already have an account'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <Text style={[styles.footer, { color: theme.textTertiary || theme.textSecondary }]}>
                        Your notes, synced everywhere
                    </Text>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        letterSpacing: 0.2,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    accentBar: {
        height: 4,
    },
    formContent: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    submitButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 13,
        fontWeight: '500',
    },
    toggleButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
    },
    toggleButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 13,
    },
});

export default AuthScreen;
