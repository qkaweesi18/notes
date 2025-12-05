import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Platform, Modal, Text, TouchableOpacity, ScrollView, Animated, Pressable } from 'react-native';
import { useNotes } from '../context/NotesContext';
import TimelineItem from '../components/TimelineItem';
import InputArea from '../components/InputArea';
import DiffView from '../components/DiffView';
import NoteDetailScreen from './NoteDetailScreen';
import { format } from 'date-fns';

const NotesScreen = ({ theme }) => {
    const { entries, addEntry, updateEntry, deleteEntry } = useNotes();
    const [editingItem, setEditingItem] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [detailViewNote, setDetailViewNote] = useState(null);

    // Animation values
    const modalSlideAnim = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (editModalVisible) {
            Animated.parallel([
                Animated.spring(modalSlideAnim, {
                    toValue: 1,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(modalSlideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [editModalVisible]);

    const handleNotePress = (item) => {
        console.log('Note pressed:', item.id);
        setDetailViewNote(item);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditModalVisible(true);
    };

    const handleCloseModal = () => {
        setEditModalVisible(false);
        setTimeout(() => setEditingItem(null), 300);
    };

    const handleSaveEdit = async (text) => {
        if (editingItem && text !== editingItem.content) {
            await updateEntry(editingItem.id, text);
        }
        handleCloseModal();
    };

    const handleSaveDetail = async (updatedNote) => {
        await updateEntry(updatedNote.id, updatedNote.content, updatedNote.title);
    };

    const handleDelete = (id) => {
        deleteEntry(id);
    };

    const modalTranslateY = modalSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [600, 0],
    });

    // If detail view is open, show it
    if (detailViewNote) {
        return (
            <NoteDetailScreen
                note={detailViewNote}
                theme={theme}
                onSave={handleSaveDetail}
                onClose={() => setDetailViewNote(null)}
            />
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={entries}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                    <TimelineItem
                        item={item}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPress={() => handleNotePress(item)}
                        theme={theme}
                    />
                )}
                contentContainerStyle={styles.listContent}
                style={styles.list}
            />

            <InputArea
                onSend={addEntry}
                theme={theme}
            />

            {/* Edit Modal with History */}
            <Modal
                animationType="none"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                        <Pressable style={styles.backdropPressable} onPress={handleCloseModal} />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: theme.surface,
                                transform: [{ translateY: modalTranslateY }]
                            }
                        ]}
                    >
                        <View style={styles.modalHandle}>
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />
                        </View>

                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Note</Text>
                            <TouchableOpacity
                                onPress={handleCloseModal}
                                style={styles.closeButton}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: theme.primary, fontSize: 16 }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Edit History</Text>
                            {editingItem && editingItem.history && editingItem.history.length > 0 ? (
                                editingItem.history.map((hist, index) => {
                                    const newerVersionContent = index === 0 ? editingItem.content : editingItem.history[index - 1].content;
                                    return (
                                        <View key={index} style={[styles.historyItem, { backgroundColor: theme.background, borderLeftColor: theme.primary }]}>
                                            <Text style={[styles.historyTimestamp, { color: theme.textSecondary }]}>
                                                {format(new Date(hist.timestamp), 'MMM d, yyyy • h:mm a')}
                                            </Text>
                                            <DiffView
                                                oldText={hist.content}
                                                newText={newerVersionContent}
                                                theme={theme}
                                            />
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={[styles.emptyState, { backgroundColor: theme.background }]}>
                                    <Text style={{ color: theme.textSecondary, fontStyle: 'italic', fontSize: 14 }}>
                                        No edit history yet
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalInputContainer}>
                            <InputArea
                                onSend={handleSaveEdit}
                                theme={theme}
                                editingItem={editingItem}
                                onCancelEdit={handleCloseModal}
                            />
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    backdropPressable: {
        flex: 1,
    },
    modalContent: {
        height: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 20,
    },
    modalHandle: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 22,
        letterSpacing: 0.3,
    },
    closeButton: {
        padding: 4,
    },
    historyScroll: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    historyItem: {
        marginBottom: 16,
        paddingLeft: 16,
        paddingRight: 12,
        paddingVertical: 12,
        borderLeftWidth: 3,
        borderRadius: 8,
    },
    historyTimestamp: {
        fontSize: 11,
        marginBottom: 8,
    },
    emptyState: {
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalInputContainer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 0,
    }
});

export default NotesScreen;
