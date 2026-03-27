import React, { useEffect, useRef } from 'react';
import {
    View, Text, Pressable, Image, Animated,
    StyleSheet, Dimensions, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getContrastIconColor } from '../styles/colors';
import { useTheme } from '../styles/theme';

const { width } = Dimensions.get('window');

const fmt = (amount, type, currency) => {
    const sign = type === 'EXPENSE' ? '-' : '+';
    const styled = parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    return `${sign}${currency.symbol}${styled}`;
};

const fmtTime = (isoDate) => {
    const d = new Date(isoDate);
    return 'Today, ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function TransactionSuccessScreen({ transaction, onViewDashboard, onAddAnother, onClose }) {
    const { colors, currency } = useTheme();
    const ACCENT = colors.accent;
    const BG = colors.backgroundPrimary;
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const s = React.useMemo(() => getStyles(colors, ACCENT, BG, DARK, MUTED), [colors]);

    // ── Animations ──────────────────────────────────────────────────────────
    const scaleBg = useRef(new Animated.Value(0)).current;
    const scaleIcon = useRef(new Animated.Value(0)).current;
    const fadeBody = useRef(new Animated.Value(0)).current;
    const slideBody = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // 1. Ring grows in
        Animated.spring(scaleBg, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
        // 2. Checkmark pops in slightly later
        setTimeout(() => {
            Animated.spring(scaleIcon, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
        }, 180);
        // 3. Body fades + slides up
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeBody, { toValue: 1, duration: 380, useNativeDriver: true }),
                Animated.timing(slideBody, { toValue: 0, duration: 380, useNativeDriver: true }),
            ]).start();
        }, 300);
    }, []);

    const isExpense = transaction?.category?.type === 'EXPENSE';
    const amountColor = isExpense ? '#E05252' : '#4CAF50';

    return (
        <View style={s.container}>

            {/* ── Close button ── */}
            <Pressable style={s.closeBtn} onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={24} color={DARK} />
            </Pressable>

            {/* ── Success Icon ── */}
            <Animated.View style={[s.iconRing, { transform: [{ scale: scaleBg }] }]}>
                <Animated.View style={[s.iconCircle, { transform: [{ scale: scaleIcon }] }]}>
                    <MaterialCommunityIcons name="check" size={36} color="#fff" />
                </Animated.View>
            </Animated.View>

            {/* ── Body ── */}
            <Animated.View style={[s.body, { opacity: fadeBody, transform: [{ translateY: slideBody }] }]}>

                <Text style={s.title}>Transaction Saved</Text>
                <Text style={s.subtitle}>Your budget has been updated.</Text>

                {/* ── Transaction Summary Card ── */}
                {transaction && (
                    <View style={s.txCard}>
                        <View style={[s.txIconBg, { backgroundColor: transaction.category?.color || '#F5EDD8' }]}>
                            <MaterialCommunityIcons
                                name={transaction.category?.icon_name || 'cash'}
                                size={22}
                                color={getContrastIconColor(transaction.category?.color)}
                            />
                        </View>
                        <View style={s.txInfo}>
                            <Text style={s.txName}>{transaction.description || transaction.category?.name}</Text>
                            <Text style={s.txCategory}>{transaction.category?.name}</Text>
                        </View>
                        <View style={s.txRight}>
                            <Text style={[s.txAmount, { color: amountColor }]}>
                                {fmt(transaction.amount, transaction.category?.type, currency)}
                            </Text>
                            <Text style={s.txTime}>{fmtTime(transaction.date)}</Text>
                        </View>
                    </View>
                )}

                {/* ── Illustration ── */}
                <Image
                    source={require('../../assets/coins_success.png')}
                    style={s.illustration}
                    resizeMode="cover"
                />

                {/* ── CTAs ── */}
                <Pressable style={s.primaryBtn} onPress={onViewDashboard}>
                    <Text style={s.primaryBtnText}>View Dashboard</Text>
                </Pressable>

                <Pressable style={s.secondaryBtn} onPress={onAddAnother}>
                    <Text style={s.secondaryBtnText}>Add Another</Text>
                </Pressable>

            </Animated.View>
        </View>
    );
}

const getStyles = (colors, ACCENT, BG, DARK, MUTED) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 48,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    // Close
    closeBtn: {
        alignSelf: 'flex-end',
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: colors.backgroundCard === '#121212' ? '#333' : '#EDE8DE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },

    // Icon
    iconRing: {
        width: 120, height: 120,
        borderRadius: 60,
        backgroundColor: '#EDE0C4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    iconCircle: {
        width: 72, height: 72,
        borderRadius: 36,
        backgroundColor: ACCENT,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Body
    body: { width: '100%', alignItems: 'center' },
    title: {
        fontSize: 26, fontWeight: '800', color: DARK,
        textAlign: 'center', marginBottom: 8,
    },
    subtitle: {
        fontSize: 14, color: MUTED,
        textAlign: 'center', marginBottom: 24,
    },

    // Transaction card
    txCard: {
        width: '100%',
        backgroundColor: colors.backgroundCard,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    txIconBg: {
        width: 46, height: 46, borderRadius: 23,
        alignItems: 'center', justifyContent: 'center',
    },
    txInfo: { flex: 1 },
    txName: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 2 },
    txCategory: { fontSize: 12, color: MUTED },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    txTime: { fontSize: 11, color: MUTED },

    // Illustration
    illustration: {
        width: '100%',
        height: 160,
        borderRadius: 20,
        marginBottom: 28,
    },

    // Buttons
    primaryBtn: {
        width: '100%',
        backgroundColor: DARK,
        borderRadius: 28,
        paddingVertical: 17,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnText: { color: colors.backgroundPrimary, fontSize: 16, fontWeight: '700' },

    secondaryBtn: {
        width: '100%',
        borderRadius: 28,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: DARK,
        backgroundColor: 'transparent',
    },
    secondaryBtnText: { color: DARK, fontSize: 16, fontWeight: '700' },
});
