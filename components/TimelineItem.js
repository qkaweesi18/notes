import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, Platform, UIManager, Animated, Pressable, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import DiffView from './DiffView';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedPressableButton = ({ onPress, style, children, theme }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};

const TimelineItem = ({ item, index, onEdit, onDelete, onPress, theme }) => {
    const [expanded, setExpanded] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Cycle through accent colors for visual variety
    const accentColors = [
        { color: theme.primary, light: theme.primaryLight },
        { color: theme.accent1, light: theme.accent1Light },
        { color: theme.accent2, light: theme.accent2Light },
        { color: theme.accent3, light: theme.accent3Light },
        { color: theme.accent4, light: theme.accent4Light },
    ];
    const accent = accentColors[index % accentColors.length];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: index * 80,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const toggleExpand = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
            },
            update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 0.7,
            },
        });
        setExpanded(!expanded);
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const hasHistory = item.history && item.history.length > 0;

    return (
        <View style={styles.timelineRow}>
            {/* Timeline connector */}
            <View style={styles.timelineConnector}>
                <View style={[styles.timelineLine, { backgroundColor: theme.timelineLine }]} />
                <View style={[styles.timelineDot, { backgroundColor: accent.color, borderColor: theme.surface }]} />
                <View style={[styles.timelineLine, { backgroundColor: theme.timelineLine }]} />
            </View>

            {/* Card content */}
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.surface,
                        shadowColor: theme.shadow,
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                {/* Accent bar on top */}
                <View style={[styles.accentBar, { backgroundColor: accent.color }]} />

                <View style={styles.cardContent}>
                    <View style={styles.header}>
                        <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                            {format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}
                        </Text>
                        {hasHistory && (
                            <View style={[styles.editedBadge, { backgroundColor: accent.light }]}>
                                <Text style={[styles.editedBadgeText, { color: accent.color }]}>
                                    Edited
                                </Text>
                            </View>
                        )}
                    </View>

                    <Pressable
                        onPress={onPress || toggleExpand}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    >
                        {item.title && (
                            <>
                                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                                <View style={[styles.separator, { backgroundColor: theme.divider }]} />
                            </>
                        )}
                        <Text style={[styles.content, { color: theme.text }]} numberOfLines={3}>
                            {item.content}
                        </Text>
                    </Pressable>

                    {/* Subtle decorative line at bottom */}
                    <View style={[styles.bottomLine, { backgroundColor: theme.divider }]} />

                    {/* Character count indicator */}
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                            {item.content.length} characters
                        </Text>
                        {hasHistory && (
                            <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                                • {item.history.length} edit{item.history.length > 1 ? 's' : ''}
                            </Text>
                        )}
                    </View>

                    {expanded && !onPress && (
                        <View style={[styles.actions, { borderTopColor: theme.border }]}>
                            <AnimatedPressableButton
                                onPress={() => onEdit(item)}
                                style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
                                theme={theme}
                            >
                                <Text style={[styles.actionText, { color: theme.primary }]}>✏️ Edit</Text>
                            </AnimatedPressableButton>
                            <AnimatedPressableButton
                                onPress={() => onDelete(item.id)}
                                style={[styles.actionButton, { backgroundColor: theme.dangerLight }]}
                                theme={theme}
                            >
                                <Text style={[styles.actionText, { color: theme.danger }]}>🗑️ Delete</Text>
                            </AnimatedPressableButton>
                        </View>
                    )}

                    {expanded && hasHistory && !onPress && (
                        <View style={[styles.historyContainer, { backgroundColor: theme.backgroundSecondary }]}>
                            <View style={styles.historyHeader}>
                                <Text style={[styles.historyTitle, { color: theme.textSecondary }]}>📜 Edit History</Text>
                                <View style={[styles.historyBadge, { backgroundColor: theme.primaryLight }]}>
                                    <Text style={[styles.historyBadgeText, { color: theme.primary }]}>{item.history.length}</Text>
                                </View>
                            </View>
                            {item.history.map((hist, idx) => {
                                const olderVersion = item.history[idx + 1];
                                return (
                                    <View key={idx} style={[styles.historyItem, { borderLeftColor: accent.color }]}>
                                        <Text style={[styles.historyTimestamp, { color: theme.textSecondary }]}>
                                            {format(new Date(hist.timestamp), 'MMM d, h:mm a')}
                                        </Text>
                                        <DiffView
                                            oldText={olderVersion ? olderVersion.content : ''}
                                            newText={hist.content}
                                            theme={theme}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    timelineRow: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    timelineConnector: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        borderRadius: 1,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        marginVertical: 4,
    },
    container: {
        flex: 1,
        borderRadius: 16,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    accentBar: {
        height: 3,
        width: '100%',
    },
    cardContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    timestamp: {
        fontSize: 12,
        letterSpacing: 0.3,
        fontWeight: '500',
    },
    editedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    editedBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    separator: {
        height: 1,
        marginBottom: 10,
    },
    content: {
        fontSize: 15,
        lineHeight: 24,
        letterSpacing: 0.1,
    },
    bottomLine: {
        height: 1,
        marginTop: 14,
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        letterSpacing: 0.3,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    historyContainer: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    historyTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    historyBadge: {
        marginLeft: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    historyItem: {
        marginBottom: 12,
        borderLeftWidth: 3,
        paddingLeft: 12,
        paddingVertical: 8,
    },
    historyTimestamp: {
        fontSize: 10,
        marginBottom: 6,
        fontWeight: '500',
    },
});

export default TimelineItem;

