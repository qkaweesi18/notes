import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, width * 0.85);

const ProfileModal = ({ visible, onClose, theme }) => {
    const { user, logout } = useAuth();
    const [message, setMessage] = useState('');

    // Animation value (starts off-screen to the right)
    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

    // Fade opacity for backdrop
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset message
            setMessage('');

            // Animate In
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Reset position immediately if invisible (usually handled by handleClose before prop change)
            slideAnim.setValue(DRAWER_WIDTH);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const handleClose = () => {
        // Animate Out
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: DRAWER_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            onClose();
        });
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <Pressable style={styles.backdropPressable} onPress={handleClose} />
                </Animated.View>

                {/* Side Drawer */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            backgroundColor: theme.surface,
                            transform: [{ translateX: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Text style={{ color: theme.primary, fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.scrollContent}>
                        <View style={styles.profileInfo}>
                            <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.avatarText, { color: theme.primary }]}>
                                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <Text style={[styles.name, { color: theme.text }]}>
                                {user?.displayName || 'User'}
                            </Text>
                            <Text style={[styles.email, { color: theme.textSecondary }]}>
                                {user?.email || 'No email'}
                            </Text>
                            {user?.isGuest && (
                                <Text style={[styles.guestBadge, { color: theme.accent1 }]}>Guest Account</Text>
                            )}
                        </View>

                        <View style={styles.actions}>
                            {!user?.isGuest && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
                                    onPress={() => setMessage('Feature coming soon.')}
                                >
                                    <Text style={[styles.actionText, { color: theme.text }]}>Change Password</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.dangerLight, marginTop: 12 }]}
                                onPress={handleLogout}
                            >
                                <Text style={[styles.actionText, { color: theme.danger }]}>
                                    {user?.isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                                </Text>
                            </TouchableOpacity>
                            {message ? <Text style={[styles.message, { color: theme.primary }]}>{message}</Text> : null}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Version 1.0.0</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropPressable: {
        flex: 1,
    },
    content: {
        width: DRAWER_WIDTH,
        height: '100%',
        paddingVertical: 24,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        flex: 1,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
    },
    guestBadge: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        width: '100%',
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    message: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 13,
    },
    footer: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    }
});

export default ProfileModal;
