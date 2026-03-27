/**
 * Global color palette for Finovo.
 * All colors in the app must reference this file — no raw hex values in screens or components.
 */
const Colors = {
    // Backgrounds
    backgroundPrimary: '#F5F0E8',
    backgroundCard: '#FFFFFF', // White inner cards
    backgroundCardDark: '#1E1C18', // Blackish top balance card
    backgroundIllustration: '#E8EDDF',

    // Brand / Accent
    accent: '#C4A44A',
    accentDark: '#A88A30',

    // Text
    textPrimary: '#1A1F36',
    textSecondary: '#9E9E9E',
    textMuted: '#AAAAAA',
    textSkip: '#888888',
    textSuccess: '#4CAF50', // Green for positive numbers
    textDanger: '#D94F4F', // Dark Red for negative (though screenshot used black with -)
    textInvPrimary: '#FFFFFF', // Text on dark card
    textInvSecondary: '#AFAFAF',

    // Form inputs
    inputBorder: '#DDD8CF',
    inputBorderFocused: '#C4A44A',
    inputPlaceholder: '#BBBBBB',
    inputLabel: '#2C2C2C',

    // Navigation dots
    dotActive: '#1A1F36',
    dotInactive: '#C9C4BB',

    // Progress / UI
    progressTrack: '#E0D9CF',
    progressFill: '#C4A44A',

    // Dividers & borders
    divider: '#E0D9CF',
    outlinedBorder: '#DDDAD4',

    // Utility
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const getContrastIconColor = (hexColor) => {
    if (!hexColor || hexColor === 'transparent') return Colors.textPrimary;

    // Remove the hash if it exists
    const color = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

    // Parse r, g, b
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return white for dark backgrounds, textPrimary for light backgrounds
    return brightness > 155 ? Colors.textPrimary : Colors.white;
};

export default Colors;
