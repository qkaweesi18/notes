import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { format } from 'date-fns';
import DiffView from '../components/DiffView';

const NoteDetailScreen = ({ note, theme, onSave, onClose }) => {
    const [title, setTitle] = useState(note.title || '');
    const [content, setContent] = useState(note.content || '');

    const characterCount = content.length;
    const lastEdited = note.history && note.history.length > 0
        ? note.history[0].timestamp
        : note.timestamp;

    const handleSave = () => {
        onSave({
            ...note,
            title,
            content,
        });
        onClose();
    };

    const hasHistory = note.history && note.history.length > 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.backButton, { color: theme.primary }]}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Input */}
                <TextInput
                    style={[styles.titleInput, { color: theme.text }]}
                    placeholder="Note Title"
                    placeholderTextColor={theme.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                />

                {/* Separator */}
                <View style={[styles.separator, { backgroundColor: theme.border }]} />

                {/* Metadata */}
                <View style={styles.metadata}>
                    <Text style={[styles.metadataLabel, { color: theme.textSecondary }]}>Last Edited</Text>
                    <Text style={[styles.metadataValue, { color: theme.text }]}>
                        {format(new Date(lastEdited), 'MMM d, yyyy • h:mm a')}
                    </Text>
                </View>

                {/* Separator */}
                <View style={[styles.separator, { backgroundColor: theme.border }]} />

                {/* Character Count */}
                <View style={styles.metadata}>
                    <Text style={[styles.metadataLabel, { color: theme.textSecondary }]}>Characters</Text>
                    <Text style={[styles.metadataValue, { color: theme.text }]}>{characterCount}</Text>
                </View>

                {/* Separator */}
                <View style={[styles.separator, { backgroundColor: theme.border }]} />

                {/* Content Input */}
                <TextInput
                    style={[styles.contentInput, { color: theme.text }]}
                    placeholder="Start writing..."
                    placeholderTextColor={theme.textSecondary}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="top"
                />

                {/* Edit History Section */}
                {hasHistory && (
                    <>
                        <View style={[styles.separator, { backgroundColor: theme.border, marginTop: 20 }]} />

                        <Text style={[styles.historyTitle, { color: theme.text }]}>📜 Edit History</Text>
                        <Text style={[styles.historySubtitle, { color: theme.textSecondary }]}>
                            See what was added and deleted
                        </Text>

                        {note.history.map((hist, index) => {
                            const newerVersionContent = index === 0 ? note.content : note.history[index - 1].content;
                            return (
                                <View key={index} style={[styles.historyItem, { backgroundColor: theme.surface, borderLeftColor: theme.primary }]}>
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
                        })}
                    </>
                )}
            </ScrollView>
        </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? 40 : 12,
        borderBottomWidth: 1,
    },
    backButton: {
        fontSize: 16,
    },
    saveButton: {
        fontSize: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleInput: {
        fontSize: 28,
        paddingVertical: 16,
        paddingHorizontal: 0,
    },
    separator: {
        height: 1,
        marginVertical: 12,
    },
    metadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    metadataLabel: {
        fontSize: 14,
    },
    metadataValue: {
        fontSize: 14,
    },
    contentInput: {
        fontSize: 16,
        lineHeight: 24,
        paddingVertical: 16,
        paddingHorizontal: 0,
        minHeight: 200,
    },
    historyTitle: {
        fontSize: 20,
        marginTop: 16,
        marginBottom: 4,
    },
    historySubtitle: {
        fontSize: 13,
        marginBottom: 16,
        fontStyle: 'italic',
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
});

export default NoteDetailScreen;

