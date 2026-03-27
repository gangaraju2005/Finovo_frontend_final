import { StyleSheet, Dimensions } from 'react-native';
import Colors from './colors';
import Typography from './typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PROGRESS_TRACK_WIDTH = SCREEN_WIDTH * 0.55;
export const PROGRESS_FILL_RATIO = 0.42;

const getSplashStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoCard: {
        width: 108,
        height: 108,
        borderRadius: 26,
        backgroundColor: colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },

    appName: {
        fontSize: Typography.size['4xl'],
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: Typography.tracking.tight,
        marginBottom: 10,
    },

    tagline: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
        color: colors.textSecondary,
        letterSpacing: Typography.tracking.wider,
        textTransform: 'uppercase',
    },

    progressSection: {
        position: 'absolute',
        bottom: 64,
        alignItems: 'center',
        gap: 10,
    },

    progressTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border, // Fallback for progressTrack
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: colors.accent, // Fallback for progressFill
    },

    loadingLabel: {
        fontSize: Typography.size.base,
        color: colors.textSecondary,
        marginTop: 2,
    },
});

export default getSplashStyles;
