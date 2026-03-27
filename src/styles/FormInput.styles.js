import { StyleSheet } from 'react-native';
import Typography from './typography';

export const getFormInputStyles = (colors) => StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },

    // Label row (left label + optional right label)
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.medium,
        color: colors.inputLabel,
    },
    rightLabel: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.regular,
        color: colors.textSecondary,
    },

    // Input container (border + content row)
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.inputBorder,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: colors.transparent,
    },
    inputContainerFocused: {
        borderColor: colors.inputBorderFocused,
    },
    inputContainerFilled: {
        backgroundColor: colors.progressTrack,
        borderWidth: 0,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: Typography.size.md,
        color: colors.textPrimary,
        paddingVertical: 0, // prevents Android extra height
    },

    // Uppercase label variant (Register screen)
    labelUppercase: {
        textTransform: 'uppercase',
        letterSpacing: Typography.tracking.wide,
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.semibold,
        color: colors.textSecondary,
    },

    // Right icon button (eye toggle)
    rightIconButton: {
        paddingLeft: 10,
        paddingVertical: 4,
    },
});

// Legacy static export for backwards compatibility
import Colors from './colors';
const FormInputStyles = StyleSheet.create({
    wrapper: { marginBottom: 16 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: Typography.size.md, fontWeight: Typography.weight.medium, color: Colors.inputLabel },
    rightLabel: { fontSize: Typography.size.md, fontWeight: Typography.weight.regular, color: Colors.textSecondary },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.inputBorder, borderRadius: 14, paddingHorizontal: 16, height: 56, backgroundColor: Colors.transparent },
    inputContainerFocused: { borderColor: Colors.inputBorderFocused },
    inputContainerFilled: { backgroundColor: '#EEEAE2', borderWidth: 0 },
    input: { flex: 1, height: '100%', fontSize: Typography.size.md, color: Colors.textPrimary, paddingVertical: 0 },
    labelUppercase: { textTransform: 'uppercase', letterSpacing: Typography.tracking.wide, fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: Colors.textSecondary },
    rightIconButton: { paddingLeft: 10, paddingVertical: 4 },
});
export default FormInputStyles;
