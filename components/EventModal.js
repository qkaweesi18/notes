import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Platform, Switch, ScrollView, Animated } from 'react-native';
import { format, addDays, subDays } from 'date-fns';

const EventModal = ({ visible, onClose, onSave, initialDate, eventToEdit, theme }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isAllDay, setIsAllDay] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Time state
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [ampm, setAmpm] = useState('PM');

    useEffect(() => {
        if (visible) {
            if (eventToEdit) {
                setTitle(eventToEdit.title);
                setDescription(eventToEdit.description || '');
                setIsAllDay(eventToEdit.isAllDay);

                if (eventToEdit.date) {
                    const date = new Date(eventToEdit.date);
                    setSelectedDate(date);

                    if (!eventToEdit.isAllDay) {
                        let h = date.getHours();
                        const m = date.getMinutes();
                        const a = h >= 12 ? 'PM' : 'AM';
                        h = h % 12;
                        h = h ? h : 12;

                        setHour(h.toString());
                        setMinute(m.toString().padStart(2, '0'));
                        setAmpm(a);
                    }
                }
            } else {
                setTitle('');
                setDescription('');
                setIsAllDay(true);
                setSelectedDate(new Date(initialDate));
                setHour('12');
                setMinute('00');
                setAmpm('PM');
            }
        }
    }, [visible, eventToEdit, initialDate]);

    const handleSave = () => {
        if (!title.trim()) return;

        let eventDate = new Date(selectedDate);

        if (!isAllDay) {
            let h = parseInt(hour);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;

            eventDate.setHours(h);
            eventDate.setMinutes(parseInt(minute));
        }

        onSave({
            title,
            description,
            isAllDay,
            date: eventDate.toISOString(),
        });
        onClose();
    };

    const changeDate = (days) => {
        setSelectedDate(prev => days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days)));
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: theme.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {eventToEdit ? 'Edit Event' : 'New Event'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>TITLE</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary || theme.background, borderColor: theme.border }]}
                                placeholder="What's happening?"
                                placeholderTextColor={theme.textTertiary || theme.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                                autoFocus={!eventToEdit}
                            />
                        </View>

                        {/* Date Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>DATE</Text>
                            <View style={[styles.dateSelector, { backgroundColor: theme.backgroundSecondary || theme.background, borderColor: theme.border }]}>
                                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateNavButton}>
                                    <Text style={[styles.dateNavText, { color: theme.text }]}>‹</Text>
                                </TouchableOpacity>
                                <Text style={[styles.dateText, { color: theme.primary }]}>
                                    {format(selectedDate, 'EEEE, MMM d, yyyy')}
                                </Text>
                                <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateNavButton}>
                                    <Text style={[styles.dateNavText, { color: theme.text }]}>›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* All Day Switch */}
                        <View style={[styles.row, styles.switchRow]}>
                            <Text style={[styles.switchLabel, { color: theme.text }]}>All Day Event</Text>
                            <Switch
                                trackColor={{ false: theme.border, true: theme.primaryLight }}
                                thumbColor={isAllDay ? theme.primary : "#f4f3f4"}
                                onValueChange={setIsAllDay}
                                value={isAllDay}
                            />
                        </View>

                        {/* Time Selection */}
                        {!isAllDay && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>TIME</Text>
                                <View style={styles.timeContainer}>
                                    <View style={[styles.timeInputContainer, { backgroundColor: theme.backgroundSecondary || theme.background, borderColor: theme.border }]}>
                                        <TextInput
                                            style={[styles.timeInput, { color: theme.text }]}
                                            value={hour}
                                            onChangeText={setHour}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            selectTextOnFocus
                                        />
                                        <Text style={[styles.timeSeparator, { color: theme.textSecondary }]}>:</Text>
                                        <TextInput
                                            style={[styles.timeInput, { color: theme.text }]}
                                            value={minute}
                                            onChangeText={setMinute}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            selectTextOnFocus
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.ampmButton, { backgroundColor: theme.primaryLight }]}
                                        onPress={() => setAmpm(prev => prev === 'AM' ? 'PM' : 'AM')}
                                    >
                                        <Text style={[styles.ampmText, { color: theme.primary }]}>{ampm}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>DESCRIPTION</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { color: theme.text, backgroundColor: theme.backgroundSecondary || theme.background, borderColor: theme.border }]}
                                placeholder="Add details..."
                                placeholderTextColor={theme.textTertiary || theme.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonCancel, { borderColor: theme.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSave, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>Save Event</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    modalView: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 16,
        padding: 8,
    },
    dateNavButton: {
        padding: 12,
        width: 44,
        alignItems: 'center',
    },
    dateNavText: {
        fontSize: 20,
        fontWeight: '300',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchRow: {
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    timeInput: {
        fontSize: 18,
        fontWeight: '600',
        width: 30,
        textAlign: 'center',
        padding: 0,
    },
    timeSeparator: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 4,
    },
    ampmButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    ampmText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCancel: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    buttonSave: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EventModal;
