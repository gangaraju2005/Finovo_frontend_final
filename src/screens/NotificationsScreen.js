import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    Alert,
    Platform,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import notificationService from '../services/notificationService';
import { useTheme } from '../styles/theme';

const ACCENT = '#DFA626';
const BG = '#F7F6F2';
const DARK = '#1A1F36';
const MUTED = '#94A3B8';
const RED = '#E05252';

export default function NotificationsScreen({ onBack, onNotificationPress, onNavigate }) {
    const { colors } = useTheme();
    const ACCENT = colors.accent;
    const BG = colors.backgroundPrimary;
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const styles = React.useMemo(() => getStyles(colors, ACCENT, BG, DARK, MUTED, RED), [colors]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStarredOnly, setShowStarredOnly] = useState(false);

    // Multi-select state — plain array to avoid Set mutation subtleties
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);   // number[]
    const [clearAlertVisible, setClearAlertVisible] = useState(false);

    // Auto-exit selection mode when no items remain selected
    useEffect(() => {
        if (selectionMode && selectedIds.length === 0) {
            setSelectionMode(false);
        }
    }, [selectedIds, selectionMode]);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
            await notificationService.markAsRead();
        } catch (err) {
            console.warn('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // ── Selection helpers ──────────────────────────────
    const enterSelectionMode = (id) => {
        setSelectedIds([id]);
        setSelectionMode(true);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const exitSelectionMode = () => {
        setSelectedIds([]);
        setSelectionMode(false);
    };

    const handleDeleteSelected = () => {
        const count = selectedIds.length;
        Alert.alert(
            'Delete Notifications',
            `Delete ${count} selected notification${count > 1 ? 's' : ''}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const ids = [...selectedIds];
                        try {
                            await notificationService.bulkDelete(ids);
                            setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
                            exitSelectionMode();
                        } catch (err) {
                            console.warn('Failed to bulk delete', err);
                        }
                    },
                },
            ]
        );
    };

    // ── Star toggle ───────────────────────────────────
    const handleToggleStar = async (notif) => {
        setNotifications(prev =>
            prev.map(n => n.id === notif.id ? { ...n, is_starred: !n.is_starred } : n)
        );
        try {
            await notificationService.toggleStar(notif.id);
        } catch (err) {
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, is_starred: notif.is_starred } : n)
            );
        }
    };

    // ── Clear non-starred ─────────────────────────────
    const handleClearNonStarred = () => {
        setClearAlertVisible(true);
    };

    const confirmClear = async () => {
        try {
            await notificationService.clearNonStarred();
            setNotifications(prev => prev.filter(n => n.is_starred));
        } catch (err) {
            console.warn('Failed to clear', err);
        } finally {
            setClearAlertVisible(false);
        }
    };

    // ── Helpers ───────────────────────────────────────
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return `Today, ${formatTime(dateString)}`;
        if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${formatTime(dateString)}`;
        return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${formatTime(dateString)}`;
    };

    const getNotificationStyles = (type) => {
        switch (type) {
            case 'ADDED': return { icon: 'bell', bgColor: '#FCF3E3', iconColor: '#DDA032' };
            case 'BUDGET': return { icon: 'tag', bgColor: '#FFEBEB', iconColor: '#E95A5A' };
            case 'UPDATED': return { icon: 'file-document', bgColor: '#E8F0FE', iconColor: '#2B6EE0' };
            case 'DELETED': return { icon: 'shield-check', bgColor: '#F1F5F9', iconColor: '#64748B' };
            case 'ALERT': return { icon: 'alert-circle', bgColor: '#FFF3E0', iconColor: '#F57C00' };
            default: return { icon: 'bell', bgColor: '#FCF3E3', iconColor: '#DDA032' };
        }
    };

    const handleNotificationPress = (notif) => {
        if (selectionMode) {
            toggleSelect(notif.id);
            return;
        }
        if (notif.notification_type === 'BUDGET') {
            onNavigate?.('set_budget');
            return;
        }
        if (onNotificationPress) onNotificationPress(notif);
    };

    const filteredNotifications = showStarredOnly
        ? notifications.filter(n => n.is_starred)
        : notifications;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNotifications = filteredNotifications.filter(n => new Date(n.created_at) >= today);
    const earlierNotifications = filteredNotifications.filter(n => new Date(n.created_at) < today);

    // ── Render one card ───────────────────────────────
    const renderNotification = (notif, isEarlier = false) => {
        const style = getNotificationStyles(notif.notification_type);
        const timeDisplay = isEarlier ? formatDateTime(notif.created_at) : formatTime(notif.created_at);
        const isSelected = selectedIds.includes(notif.id);

        return (
            <Pressable
                key={notif.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleNotificationPress(notif)}
                onLongPress={() => {
                    if (!selectionMode) enterSelectionMode(notif.id);
                    else toggleSelect(notif.id);
                }}
                delayLongPress={350}
                android_ripple={null}
            >
                {/* Left: checkbox (selection mode) or type icon */}
                {selectionMode ? (
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                        {isSelected && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                    </View>
                ) : (
                    <View style={[styles.iconContainer, { backgroundColor: style.bgColor }]}>
                        <MaterialCommunityIcons name={style.icon} size={22} color={style.iconColor} />
                    </View>
                )}

                {/* Mid: message + time */}
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{notif.message}</Text>
                    <Text style={styles.timeText}>{timeDisplay}</Text>
                </View>

                {/* Right: star (only when NOT in selection mode) */}
                {!selectionMode && (
                    <Pressable
                        hitSlop={12}
                        onPress={() => handleToggleStar(notif)}
                        style={{ padding: 4, marginRight: 4 }}
                    >
                        <MaterialCommunityIcons
                            name={notif.is_starred ? 'star' : 'star-outline'}
                            size={22}
                            color={notif.is_starred ? ACCENT : '#CBD5E1'}
                        />
                    </Pressable>
                )}
                {!selectionMode && (
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
                )}
            </Pressable>
        );
    };

    // ── Render ────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Header — switches between normal and selection mode */}
            {selectionMode ? (
                <View style={styles.selectionHeader}>
                    <Pressable onPress={exitSelectionMode} hitSlop={12} style={styles.backButton}>
                        <MaterialCommunityIcons name="close" size={26} color={DARK} />
                    </Pressable>
                    <Text style={styles.selectionCount}>{selectedIds.length} selected</Text>
                    <Pressable
                        onPress={handleDeleteSelected}
                        style={styles.deleteBtn}
                        disabled={selectedIds.length === 0}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.header}>
                    <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color={DARK} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <View style={{ width: 32 }} />
                </View>
            )}

            {/* Filter + Clear bar (hidden during selection mode) */}
            {!selectionMode && (
                <View style={styles.actionBar}>
                    <Pressable
                        style={[styles.filterChip, showStarredOnly && styles.filterChipActive]}
                        onPress={() => setShowStarredOnly(v => !v)}
                    >
                        <MaterialCommunityIcons
                            name={showStarredOnly ? 'star' : 'star-outline'}
                            size={16}
                            color={showStarredOnly ? '#fff' : ACCENT}
                        />
                        <Text style={[styles.filterChipText, showStarredOnly && { color: '#fff' }]}>
                            Starred
                        </Text>
                    </Pressable>

                    <Pressable style={styles.clearButton} onPress={handleClearNonStarred}>
                        <MaterialCommunityIcons name="delete-sweep-outline" size={16} color={RED} />
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </Pressable>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color={DARK} style={{ marginTop: 40 }} />
                ) : filteredNotifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name={showStarredOnly ? 'star-off-outline' : 'bell-off-outline'}
                            size={64}
                            color="#CBD5E1"
                        />
                        <Text style={styles.emptyText}>
                            {showStarredOnly ? 'No starred notifications.' : 'No notifications yet.'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {todayNotifications.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>TODAY</Text>
                                {todayNotifications.map(n => renderNotification(n, false))}
                            </>
                        )}
                        {earlierNotifications.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>EARLIER</Text>
                                {earlierNotifications.map(n => renderNotification(n, true))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={clearAlertVisible} transparent animationType="fade" onRequestClose={() => setClearAlertVisible(false)}>
                <View style={styles.alertOverlay}>
                    <View style={styles.alertCard}>
                        <Text style={styles.alertTitle}>Clear Notifications</Text>
                        <Text style={styles.alertMessage}>Delete all non-starred notifications?</Text>
                        <View style={styles.alertActions}>
                            <Pressable onPress={() => setClearAlertVisible(false)} style={styles.alertCancelBtn} hitSlop={10}>
                                <Text style={styles.alertCancel}>CANCEL</Text>
                            </Pressable>
                            <Pressable onPress={confirmClear} style={styles.alertConfirmBtn} hitSlop={10}>
                                <Text style={styles.alertConfirm}>CLEAR</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (colors, ACCENT, BG, DARK, MUTED, RED) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },

    // Normal header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12,
    },
    backButton: { width: 32 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },

    // Selection-mode header
    selectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: colors.divider,
        backgroundColor: colors.backgroundPrimary,
    },
    selectionCount: { fontSize: 16, fontWeight: '700', color: DARK },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: RED, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    },
    deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Action bar (filter / clear)
    actionBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 12,
    },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1.5, borderColor: ACCENT, borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 7,
    },
    filterChipActive: { backgroundColor: ACCENT },
    filterChipText: { fontSize: 13, fontWeight: '600', color: ACCENT },
    clearButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1.5, borderColor: RED, borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 7,
    },
    clearButtonText: { fontSize: 13, fontWeight: '600', color: RED },

    // Scroll
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: {
        fontSize: 12, fontWeight: '700', color: MUTED,
        letterSpacing: 1, marginTop: 20, marginBottom: 10,
    },

    // Empty state
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 15, color: MUTED, fontWeight: '500' },

    // Custom Alert Overlay
    alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    alertCard: { backgroundColor: colors.backgroundCard, borderRadius: 12, width: '80%', padding: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
    alertTitle: { fontSize: 18, fontWeight: 'bold', color: DARK, marginBottom: 12 },
    alertMessage: { fontSize: 14, color: MUTED, marginBottom: 24, lineHeight: 20 },
    alertActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    alertCancelBtn: { padding: 8 },
    alertConfirmBtn: { padding: 8 },
    alertCancel: { color: MUTED, fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
    alertConfirm: { color: RED, fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },

    // Cards
    card: {
        flexDirection: 'row', backgroundColor: colors.backgroundCard,
        padding: 16, borderRadius: 16, marginBottom: 10, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    // Selected card  — NO borderWidth change to avoid layout jitter
    // Use background + shadow only so no geometry is recalculated
    cardSelected: {
        backgroundColor: colors.backgroundPrimary === '#121212' ? '#332b1a' : '#FFF8EC',
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 6,
        elevation: 5,
    },
    checkCircle: {
        width: 26, height: 26, borderRadius: 13,
        borderWidth: 2, borderColor: colors.outlinedBorder,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
    },
    checkCircleActive: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
    },
    iconContainer: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    infoContainer: { flex: 1, justifyContent: 'center', paddingRight: 8 },
    title: { fontSize: 14, fontWeight: '500', color: DARK, lineHeight: 20, marginBottom: 3 },
    timeText: { fontSize: 12, color: MUTED },
});
