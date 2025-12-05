import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { format, setMonth, setYear, addYears, subYears } from 'date-fns';

const MonthYearPicker = ({ visible, onClose, onSelect, currentDate, theme }) => {
    const [year, setYearState] = useState(currentDate.getFullYear());
    const [mode, setMode] = useState('month'); // 'month' | 'year'

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleMonthSelect = (monthIndex) => {
        const newDate = setMonth(setYear(currentDate, year), monthIndex);
        onSelect(newDate);
        onClose();
    };

    const handlePrevYear = () => setYearState(year - 1);
    const handleNextYear = () => setYearState(year + 1);

    const handleYearSelect = (selectedYear) => {
        setYearState(selectedYear);
        setMode('month');
    };

    const getYears = () => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50;
        return Array.from({ length: 100 }, (_, i) => startYear + i);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    {/* Year Selector */}
                    <View style={styles.yearHeader}>
                        {mode === 'month' && (
                            <TouchableOpacity onPress={handlePrevYear} style={styles.yearButton}>
                                <Text style={[styles.yearButtonText, { color: theme.text }]}>←</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => setMode(mode === 'month' ? 'year' : 'month')}>
                            <Text style={[styles.yearText, { color: theme.text }]}>
                                {year} {mode === 'month' ? '▾' : '▴'}
                            </Text>
                        </TouchableOpacity>
                        {mode === 'month' && (
                            <TouchableOpacity onPress={handleNextYear} style={styles.yearButton}>
                                <Text style={[styles.yearButtonText, { color: theme.text }]}>→</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {mode === 'month' ? (
                        <View style={styles.monthsGrid}>
                            {months.map((month, index) => (
                                <TouchableOpacity
                                    key={month}
                                    style={[
                                        styles.monthButton,
                                        {
                                            backgroundColor:
                                                (index === currentDate.getMonth() && year === currentDate.getFullYear())
                                                    ? theme.primary
                                                    : 'transparent'
                                        }
                                    ]}
                                    onPress={() => handleMonthSelect(index)}
                                >
                                    <Text style={[
                                        styles.monthText,
                                        {
                                            color:
                                                (index === currentDate.getMonth() && year === currentDate.getFullYear())
                                                    ? '#fff'
                                                    : theme.text
                                        }
                                    ]}>
                                        {month.substring(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.yearsGrid}>
                            <FlatList
                                data={getYears()}
                                keyExtractor={item => item.toString()}
                                numColumns={3}
                                initialScrollIndex={getYears().indexOf(year)}
                                getItemLayout={(data, index) => (
                                    { length: 50, offset: 50 * (index / 3), index }
                                )}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.yearItem,
                                            item === year && { backgroundColor: theme.primary }
                                        ]}
                                        onPress={() => handleYearSelect(item)}
                                    >
                                        <Text style={[
                                            styles.yearItemText,
                                            { color: item === year ? '#fff' : theme.text }
                                        ]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        borderRadius: 16,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    yearHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    yearButton: {
        padding: 10,
    },
    yearButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    yearText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    monthButton: {
        width: '30%',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 12,
    },
    monthText: {
        fontSize: 16,
    },
    yearsGrid: {
        height: 300,
        width: '100%',
    },
    yearItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        margin: 4,
        borderRadius: 8,
    },
    yearItemText: {
        fontSize: 16,
    },
});

export default MonthYearPicker;
