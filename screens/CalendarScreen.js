import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Animated, Pressable } from 'react-native';
import { useEvents } from '../context/EventsContext';
import EventModal from '../components/EventModal';
import MonthYearPicker from '../components/MonthYearPicker';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';

// Cycle through accent colors for events
const getEventColor = (index, theme) => {
    const colors = [
        { bg: theme.primaryLight, color: theme.primary },
        { bg: theme.accent1Light, color: theme.accent1 },
        { bg: theme.accent2Light, color: theme.accent2 },
        { bg: theme.accent3Light, color: theme.accent3 },
        { bg: theme.accent4Light, color: theme.accent4 },
    ];
    return colors[index % colors.length];
};

const CalendarScreen = ({ theme }) => {
    const { events, addEvent, updateEvent, deleteEvent } = useEvents();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideDirection = useRef(0);

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [currentMonth]);

    const eventsForSelectedDate = useMemo(() => {
        return events.filter(event => isSameDay(parseISO(event.date), selectedDate));
    }, [events, selectedDate]);

    const datesWithEvents = useMemo(() => {
        const dates = new Set();
        events.forEach(event => {
            dates.add(format(parseISO(event.date), 'yyyy-MM-dd'));
        });
        return dates;
    }, [events]);

    const animateTransition = (direction) => {
        slideDirection.current = direction;
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const nextMonth = () => {
        animateTransition(1);
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        animateTransition(-1);
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    const handleAddEvent = () => {
        setEditingEvent(null);
        setModalVisible(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setModalVisible(true);
    };

    const handleSaveEvent = (eventData) => {
        if (editingEvent) {
            updateEvent(editingEvent.id, eventData);
        } else {
            addEvent(eventData);
        }
    };

    const handleDeleteEvent = (id) => {
        deleteEvent(id);
    };

    const renderDay = (day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const hasEvents = datesWithEvents.has(format(day, 'yyyy-MM-dd'));
        const isTodayDate = isToday(day);

        return (
            <TouchableOpacity
                key={day.toString()}
                style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.dayCellOutside
                ]}
                onPress={() => setSelectedDate(day)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.dayInner,
                    isSelected && [styles.daySelected, { backgroundColor: theme.primary }],
                    isTodayDate && !isSelected && [styles.dayToday, { borderColor: theme.primary }]
                ]}>
                    <Text style={[
                        styles.dayText,
                        { color: theme.text },
                        !isCurrentMonth && { color: theme.textTertiary || theme.textSecondary, opacity: 0.4 },
                        isSelected && { color: '#fff', fontWeight: '600' },
                        isTodayDate && !isSelected && { color: theme.primary, fontWeight: '700' }
                    ]}>
                        {format(day, 'd')}
                    </Text>
                </View>
                {hasEvents && (
                    <View style={styles.dotContainer}>
                        <View style={[
                            styles.dot,
                            { backgroundColor: isSelected ? '#fff' : theme.primary }
                        ]} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEventItem = ({ item, index }) => {
        const eventColor = getEventColor(index, theme);

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.eventCard,
                    {
                        backgroundColor: theme.surface,
                        borderLeftColor: eventColor.color,
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                ]}
                onPress={() => handleEditEvent(item)}
            >
                <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={[styles.timeBadge, { backgroundColor: eventColor.bg }]}>
                            <Text style={[styles.eventTime, { color: eventColor.color }]}>
                                {item.isAllDay ? 'All Day' : format(parseISO(item.date), 'h:mm a')}
                            </Text>
                        </View>
                    </View>
                    {item.description ? (
                        <Text style={[styles.eventDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : null}
                </View>
                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: theme.dangerLight }]}
                    onPress={() => handleDeleteEvent(item.id)}
                >
                    <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
            </Pressable>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Calendar Card */}
            <View style={[styles.calendarContainer, { backgroundColor: theme.surface }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={prevMonth}
                        style={[styles.navButton, { backgroundColor: theme.backgroundSecondary || theme.background }]}
                    >
                        <Text style={[styles.navText, { color: theme.text }]}>‹</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setPickerVisible(true)}
                        style={styles.monthSelector}
                    >
                        <Text style={[styles.monthTitle, { color: theme.text }]}>
                            {format(currentMonth, 'MMMM yyyy')}
                        </Text>
                        <Text style={[styles.monthDropdown, { color: theme.primary }]}>▾</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={nextMonth}
                        style={[styles.navButton, { backgroundColor: theme.backgroundSecondary || theme.background }]}
                    >
                        <Text style={[styles.navText, { color: theme.text }]}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick jump to today */}
                {!isToday(selectedDate) && (
                    <TouchableOpacity
                        style={[styles.todayButton, { backgroundColor: theme.primaryLight }]}
                        onPress={goToToday}
                    >
                        <Text style={[styles.todayButtonText, { color: theme.primary }]}>Today</Text>
                    </TouchableOpacity>
                )}

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                {/* Weekday Headers */}
                <Animated.View style={[styles.weekRow, { opacity: fadeAnim }]}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <View key={index} style={styles.weekDayCell}>
                            <Text style={[
                                styles.weekDayText,
                                { color: theme.textSecondary },
                                (index === 0 || index === 6) && { color: theme.textTertiary || theme.textSecondary }
                            ]}>
                                {day}
                            </Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Calendar Grid */}
                <Animated.View style={[styles.daysGrid, { opacity: fadeAnim }]}>
                    {calendarDays.map((day, index) => renderDay(day, index))}
                </Animated.View>
            </View>

            {/* Selected Date Events */}
            <View style={styles.eventsContainer}>
                <View style={styles.eventsHeader}>
                    <View>
                        <Text style={[styles.selectedDateTitle, { color: theme.text }]}>
                            {format(selectedDate, 'EEEE')}
                        </Text>
                        <Text style={[styles.selectedDateSubtitle, { color: theme.textSecondary }]}>
                            {format(selectedDate, 'MMMM d, yyyy')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                        onPress={handleAddEvent}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.addButtonIcon}>+</Text>
                    </TouchableOpacity>
                </View>

                {eventsForSelectedDate.length > 0 ? (
                    <FlatList
                        data={eventsForSelectedDate}
                        keyExtractor={item => item.id}
                        renderItem={renderEventItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundSecondary || theme.background }]}>
                            <Text style={styles.emptyIcon}>📅</Text>
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>
                            No events
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Your schedule is clear for this day
                        </Text>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.primaryLight }]}
                            onPress={handleAddEvent}
                        >
                            <Text style={[styles.createButtonText, { color: theme.primary }]}>
                                + Create Event
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <EventModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveEvent}
                initialDate={selectedDate}
                eventToEdit={editingEvent}
                theme={theme}
            />

            <MonthYearPicker
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={setCurrentMonth}
                currentDate={currentMonth}
                theme={theme}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendarContainer: {
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    navButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navText: {
        fontSize: 24,
        fontWeight: '300',
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    monthDropdown: {
        fontSize: 12,
        marginLeft: 6,
    },
    todayButton: {
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
        marginBottom: 8,
    },
    todayButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    dayCellOutside: {
        opacity: 0.4,
    },
    dayInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    daySelected: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    dayToday: {
        borderWidth: 2,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    dotContainer: {
        position: 'absolute',
        bottom: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    eventsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    eventsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    selectedDateTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    selectedDateSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonIcon: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
    },
    eventCard: {
        flexDirection: 'row',
        borderRadius: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    eventContent: {
        flex: 1,
        padding: 14,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    timeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    eventTime: {
        fontSize: 11,
        fontWeight: '600',
    },
    eventDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    deleteButton: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        fontSize: 22,
        color: '#EF4444',
        fontWeight: '300',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyIcon: {
        fontSize: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 14,
        marginBottom: 20,
    },
    createButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },
    createButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default CalendarScreen;

