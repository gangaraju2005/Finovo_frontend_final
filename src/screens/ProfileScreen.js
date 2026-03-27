import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Switch,
    Animated,
    Platform,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

import userService from '../services/userService';
import dashboardService from '../services/dashboardService';
import { getStyles } from '../styles/ProfileScreen.styles';
import { Modal } from 'react-native';
import CustomAlert from '../components/CustomAlert';
import BottomNav from '../components/BottomNav';
import { MEDIA_BASE_URL } from '../constants/api';

// Get initials from a name e.g. "Alex Chen" → "AC"
const getInitials = (firstName = '', lastName = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
};



export default function ProfileScreen({ onBack, onNavigate, onLogout, onAccountSettings, onSetBudget, onNotificationSettings, onPrivacyPolicy }) {
    const [profile, setProfile] = useState(null);
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { colors, themePref, changeTheme, formatCurrency } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [profileData, dashboardData] = await Promise.all([
                userService.getProfile(),
                dashboardService.getDashboardData(),
            ]);
            setProfile(profileData);
            setDashData(dashboardData);
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } catch (err) {
            console.warn('Failed to load profile', err);
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Calculate goal progress: saved / savings_goal × 100
    const savedAmount = dashData ? Math.max(0, parseFloat(dashData.total_balance || 0)) : 0;
    const goalAmount = profile ? parseFloat(profile.monthly_savings_goal || 0) : 0;
    const progressPct = goalAmount > 0 ? Math.min(100, Math.round((savedAmount / goalAmount) * 100)) : 0;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.textPrimary} />
            </View>
        );
    }

    const initials = getInitials(profile?.first_name, profile?.last_name);
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

    return (
        <View style={styles.container}>

            {/* ── Fixed Header (never scrolls away) ── */}
            <View style={styles.topBar}>
                <View style={styles.headerRow}>
                    <Pressable onPress={onBack} hitSlop={12}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* ── Avatar + Name ── */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            {profile?.avatar_url ? (
                                <Image 
                                    source={{ 
                                        uri: profile.avatar_url.startsWith('http') 
                                            ? profile.avatar_url 
                                            : `${MEDIA_BASE_URL}${profile.avatar_url}` 
                                    }} 
                                    style={styles.avatarImage} 
                                />
                            ) : (
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            )}
                        </View>
                        <Text style={styles.userName}>{profile?.username || fullName}</Text>
                        <Text style={styles.userEmail}>{profile?.username ? fullName : profile?.email}</Text>
                        {profile?.username && <Text style={[styles.userEmail, { marginTop: 2 }]}>{profile.email}</Text>}
                    </View>

                    {/* ── Monthly Goal Card ── */}
                    <Pressable style={styles.goalCard} onPress={onSetBudget}>
                        <Text style={styles.goalTitle}>Monthly Goal</Text>
                        <Text style={styles.goalLabel}>Savings Target</Text>
                        <View style={styles.goalAmountRow}>
                            <Text style={styles.goalAmount}>{formatCurrency(goalAmount)}</Text>
                            <Text style={styles.goalPercentage}>{progressPct}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                        </View>
                    </Pressable>

                    {/* ── Settings Section ── */}
                    <Text style={styles.settingsLabel}>Settings</Text>
                    <View style={styles.settingsCard}>
                        {/* Account Settings */}
                        <Pressable style={styles.settingsRow} onPress={() => onAccountSettings?.()}>
                            <View style={styles.settingsIconCircle}>
                                <MaterialCommunityIcons name="account-cog-outline" size={20} color="#C4A44A" />
                            </View>
                            <Text style={styles.settingsRowLabel}>Account Settings</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                        </Pressable>

                        {/* Notifications */}
                        <Pressable style={styles.settingsRow} onPress={() => onNotificationSettings?.()}>
                            <View style={styles.settingsIconCircle}>
                                <MaterialCommunityIcons name="bell-outline" size={20} color="#C4A44A" />
                            </View>
                            <Text style={styles.settingsRowLabel}>Notifications</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                        </Pressable>


                        {/* Theme — Selector */}
                        <Pressable style={[styles.settingsRow, styles.settingsRowLast]} onPress={() => setThemeModalVisible(true)}>
                            <View style={styles.settingsIconCircle}>
                                <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.accent} />
                            </View>
                            <Text style={styles.settingsRowLabel}>Theme</Text>
                            <Text style={{ color: colors.textSecondary, textTransform: 'capitalize', marginRight: 8, fontSize: 13, fontWeight: '500' }}>
                                {themePref === 'system' ? 'System Default' : themePref}
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    {/* ── Privacy Policy ── */}
                    <Pressable
                        style={styles.privacyButton}
                        onPress={() => onPrivacyPolicy?.()}
                    >
                        <MaterialCommunityIcons name="shield-check-outline" size={18} color="#607D8B" />
                        <Text style={styles.privacyText}>Privacy Policy</Text>
                    </Pressable>

                    {/* ── Log Out ── */}
                    <Pressable
                        style={styles.logoutButton}
                        onPress={() => setLogoutAlertVisible(true)}
                    >
                        <MaterialCommunityIcons name="logout" size={18} color="#E05252" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>

                </Animated.View>
            </ScrollView>

            {/* ── Bottom Nav ── */}
            <BottomNav
                activeTab="profile"
                onTabChange={onNavigate}
            />

            {/* ── Theme Selection Modal ── */}
            <Modal visible={themeModalVisible} animationType="slide" transparent={true} onRequestClose={() => setThemeModalVisible(false)}>
                <View style={[styles.modalOverlay, {justifyContent: 'flex-end', margin: 0}]}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>Select Theme</Text>
                        
                        {['system', 'light', 'dark'].map((t) => (
                            <Pressable
                                key={t}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.backgroundPrimary }}
                                onPress={() => { changeTheme(t); setThemeModalVisible(false); }}
                            >
                                <Text style={{ flex: 1, fontSize: 16, color: colors.textPrimary, textTransform: 'capitalize', fontWeight: themePref === t ? 'bold' : 'normal' }}>
                                    {t === 'system' ? 'System Default' : t}
                                </Text>
                                {themePref === t && <MaterialCommunityIcons name="check" size={24} color={colors.accent} />}
                            </Pressable>
                        ))}

                        <Pressable style={{ marginTop: 24, paddingVertical: 16, alignItems: 'center' }} onPress={() => setThemeModalVisible(false)}>
                            <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: 'bold' }}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ── Logout Alert Modal ── */}
            <CustomAlert 
                visible={logoutAlertVisible}
                title="Log Out"
                message="Are you sure you want to log out?"
                confirmText="LOG OUT"
                cancelText="CANCEL"
                onConfirm={() => { setLogoutAlertVisible(false); onLogout?.(); }}
                onCancel={() => setLogoutAlertVisible(false)}
                destructive={true}
            />
        </View>
    );
}
