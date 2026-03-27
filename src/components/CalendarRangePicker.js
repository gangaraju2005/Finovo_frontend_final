import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Typography from '../styles/typography';
import { useTheme } from '../styles/theme';

// Days of week short labels
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarRangePicker({ startDate, endDate, onRangeChange, singleMode = false }) {
    const { colors } = useTheme();
    const ACCENT = colors.accent;
    const BG_MUTE = colors.backgroundPrimary === '#121212' ? '#332b1a' : '#F8E8C7';
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const styles = React.useMemo(() => getStyles(colors, ACCENT, BG_MUTE, DARK, MUTED), [colors]);

    const today = new Date();
    // Use start date's month if provided, else current month
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayPress = (dayDate) => {
        // Prevent future dates
        if (dayDate > today) return;

        if (singleMode) {
            onRangeChange(dayDate, dayDate);
            return;
        }

        if (!startDate || (startDate && endDate)) {
            // Start a new range
            onRangeChange(dayDate, null);
        } else if (startDate && !endDate) {
            // Complete the range
            if (dayDate < startDate) {
                // Picked an earlier date, swap them
                onRangeChange(dayDate, startDate);
            } else {
                onRangeChange(startDate, dayDate);
            }
        }
    };

    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Dropdown state
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);

    // Generate days
    const days = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();

        const grid = [];
        // Fill initial empty slots
        for (let i = 0; i < firstDay; i++) {
            grid.push(null);
        }
        // Fill days
        for (let i = 1; i <= numDays; i++) {
            grid.push(new Date(year, month, i));
        }
        return grid;
    }, [currentMonth]);

    const isSameDate = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isWithinRange = (date) => {
        if (!startDate || !endDate || !date) return false;
        return date >= startDate && date <= endDate;
    };

    return (
        <View style={styles.container}>
            {/* Header controls */}
            <View style={styles.header}>
                <Pressable onPress={goToPrevMonth} hitSlop={10}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={MUTED} />
                </Pressable>
                <Pressable onPress={() => setDropdownVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.monthLabel}>{monthLabel}</Text>
                    <MaterialCommunityIcons name="menu-down" size={20} color={DARK} style={{ marginLeft: 4 }} />
                </Pressable>
                <Pressable onPress={goToNextMonth} hitSlop={10}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={MUTED} />
                </Pressable>
            </View>

            {/* DOW labels */}
            <View style={styles.dowRow}>
                {DOW.map((d, i) => (
                    <Text key={'dow-' + i} style={styles.dowText}>{d}</Text>
                ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {days.map((dateObj, i) => {
                    if (!dateObj) {
                        return <View key={'empty-' + i} style={styles.dayCell} />;
                    }

                    const isStart = isSameDate(dateObj, startDate);
                    const isEnd = isSameDate(dateObj, endDate);
                    const isSelectedSingle = isStart && !endDate;
                    const inRange = isWithinRange(dateObj);

                    // Styling logic
                    let cellStyle = styles.dayCell;
                    let textStyle = styles.dayText;
                    let extraBg = null;

                    if (inRange) {
                        // Background ribbon for range
                        extraBg = <View style={styles.rangeBg} />;
                    }

                    if (isStart) {
                        cellStyle = [styles.dayCell, styles.startEndCell];
                        textStyle = styles.startEndText;
                        if (endDate && startDate < endDate) {
                            extraBg = <View style={[styles.rangeBg, { left: '50%' }]} />;
                        }
                    }

                    if (isEnd) {
                        cellStyle = [styles.dayCell, styles.startEndCell];
                        textStyle = styles.startEndText;
                        if (startDate < endDate) {
                            extraBg = <View style={[styles.rangeBg, { right: '50%' }]} />;
                        }
                    }

                    if (isStart && isEnd && startDate === endDate) {
                        extraBg = null;
                    }

                    const isFuture = dateObj > today;
                    if (isFuture) {
                        textStyle = [textStyle, { color: MUTED, opacity: 0.3 }];
                    }

                    return (
                        <View key={'date-' + i} style={styles.cellWrapper}>
                            {extraBg}
                            <Pressable
                                onPress={() => handleDayPress(dateObj)}
                                style={cellStyle}
                                disabled={isFuture}
                            >
                                <Text style={textStyle}>{dateObj.getDate()}</Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>

            {/* Dropdown Modal for Month/Year Selection */}
            <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={() => setDropdownVisible(false)}>
                <Pressable style={styles.dropdownOverlay} onPress={() => setDropdownVisible(false)}>
                    <View style={styles.dropdownContent} onStartShouldSetResponder={() => true}>
                        <View style={{ flexDirection: 'row', height: 260 }}>
                            {/* Months List */}
                            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                                {months.map((m, i) => (
                                    <Pressable
                                        key={m}
                                        style={[styles.dropdownItem, currentMonth.getMonth() === i && styles.dropdownItemActive]}
                                        onPress={() => {
                                            setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1));
                                        }}
                                    >
                                        <Text style={[styles.dropdownItemText, currentMonth.getMonth() === i && styles.dropdownItemTextActive]}>{m}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

                            <View style={{ width: 1, backgroundColor: '#E2E8F0', marginVertical: 10 }} />

                            {/* Years List */}
                            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                                {years.map((y) => (
                                    <Pressable
                                        key={y.toString()}
                                        style={[styles.dropdownItem, currentMonth.getFullYear() === y && styles.dropdownItemActive]}
                                        onPress={() => {
                                            setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));
                                        }}
                                    >
                                        <Text style={[styles.dropdownItemText, currentMonth.getFullYear() === y && styles.dropdownItemTextActive]}>{y}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                        <Pressable
                            style={{ marginTop: 10, backgroundColor: DARK, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                            onPress={() => setDropdownVisible(false)}
                        >
                            <Text style={{ color: colors.backgroundPrimary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const getStyles = (colors, ACCENT, BG_MUTE, DARK, MUTED) => StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 2,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: colors.backgroundPrimary === '#121212' ? 1 : 0,
        borderColor: colors.divider,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: DARK,
    },
    dowRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dowText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: MUTED,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cellWrapper: {
        width: '14.28%', // 100 / 7
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    rangeBg: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: BG_MUTE,
    },
    dayCell: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        zIndex: 1,
    },
    dayText: {
        fontSize: 14,
        color: DARK,
        fontWeight: '500',
    },
    startEndCell: {
        backgroundColor: ACCENT,
    },
    startEndText: {
        color: colors.backgroundPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Dropdown Modal Styles
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContent: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 16,
        padding: 8,
        width: '75%',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginVertical: 2,
    },
    dropdownItemActive: {
        backgroundColor: BG_MUTE,
    },
    dropdownItemText: {
        fontSize: 15,
        color: DARK,
        textAlign: 'center',
        fontWeight: '500',
    },
    dropdownItemTextActive: {
        fontWeight: 'bold',
        color: ACCENT,
    },
});
