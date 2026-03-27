import { StyleSheet, Dimensions } from 'react-native';

import Typography from './typography';

const { width } = Dimensions.get('window');

export const getStyles = (Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundPrimary,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 110, // clears the BottomNav (76px) + breathing room
    },

    // Fixed top bar — sits above the ScrollView, not inside it
    topBar: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: Colors.backgroundPrimary,
    },

    // ── Header ──────────────────────────────────────────────────────────────────
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    editButton: {
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    editText: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.semibold,
        color: '#C4A44A', // Gold accent matching screenshot
    },

    // ── Avatar + Name ────────────────────────────────────────────────────────────
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarInitials: {
        fontSize: 38,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },

    // ── Monthly Goal Card ────────────────────────────────────────────────────────
    goalCard: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    goalTitle: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    goalLabel: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    goalAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    goalAmount: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    goalPercentage: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: '#C4A44A',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E0D5',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#C4A44A',
    },
    goalHint: {
        fontSize: 11,
        color: Colors.textMuted,
        marginTop: 8,
        textAlign: 'right',
    },

    // ── Settings Section ─────────────────────────────────────────────────────────
    settingsLabel: {
        fontSize: 11,
        fontWeight: Typography.weight.bold,
        color: '#607D8B',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    settingsCard: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 28,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundPrimary,
    },
    settingsRowLast: {
        borderBottomWidth: 0,
    },
    settingsIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5EDD8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    settingsRowLabel: {
        flex: 1,
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.medium,
        color: Colors.textPrimary,
    },

    // ── Log Out ──────────────────────────────────────────────────────────────────
    logoutButton: {
        marginHorizontal: 4,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E05252',
        backgroundColor: '#FFF5F5',
    },
    logoutText: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: '#E05252',
        letterSpacing: 0.3,
    },

    privacyButton: {
        marginHorizontal: 4,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DDDAD4',
        backgroundColor: 'transparent',
    },
    privacyText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.semibold,
        color: '#607D8B',
    },

    // ── Edit Goal Modal ──────────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: Colors.backgroundPrimary,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 28,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInputLabel: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: Typography.weight.medium,
    },
    modalInput: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 14,
        padding: 16,
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 20,
    },
    modalSaveButton: {
        backgroundColor: Colors.textPrimary,
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalSaveText: {
        color: Colors.white,
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
    },
    modalCancelText: {
        color: Colors.textSecondary,
        fontSize: Typography.size.base,
        textAlign: 'center',
        marginTop: 14,
        paddingVertical: 4,
    },
});


