import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { getFormInputStyles } from '../styles/FormInput.styles';

/**
 * FormInput
 *
 * Reusable input field with two visual variants:
 *  - 'outlined' (default) — border ring, used on Login screen
 *  - 'filled'             — warm gray fill, used on Register screen
 *
 * @param {object}   props
 * @param {string}   props.label               - Field label text
 * @param {boolean}  [props.labelUppercase]     - Renders label in UPPERCASE with tracking
 * @param {string}   [props.rightLabel]         - Optional right-side label (e.g. "Forgot?")
 * @param {Function} [props.onRightLabelPress]  - Handler for right label tap
 * @param {boolean}  [props.isPassword]         - Enables eye icon toggle for secure entry
 * @param {'outlined'|'filled'} [props.variant] - Visual style variant
 */
export function FormInput({
    label,
    labelUppercase = false,
    rightLabel,
    onRightLabelPress,
    isPassword = false,
    variant = 'outlined',
    ...textInputProps
}) {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getFormInputStyles(colors), [colors]);

    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(isPassword);

    return (
        <View style={styles.wrapper}>
            {/* Label row */}
            <View style={styles.labelRow}>
                <Text
                    style={[
                        styles.label,
                        labelUppercase && styles.labelUppercase,
                    ]}
                >
                    {label}
                </Text>
                {rightLabel ? (
                    <Pressable onPress={onRightLabelPress} hitSlop={8}>
                        <Text style={styles.rightLabel}>{rightLabel}</Text>
                    </Pressable>
                ) : null}
            </View>

            {/* Input container */}
            <View
                style={[
                    styles.inputContainer,
                    variant === 'filled'
                        ? styles.inputContainerFilled
                        : isFocused && styles.inputContainerFocused,
                ]}
            >
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                    secureTextEntry={isSecure}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    // Fix: allow tap anywhere in input to place cursor correctly
                    textAlignVertical="center"
                    {...textInputProps}
                />

                {/* Eye icon — only shown for password fields */}
                {isPassword ? (
                    <Pressable
                        style={styles.rightIconButton}
                        onPress={() => setIsSecure((prev) => !prev)}
                        hitSlop={8}
                    >
                        <MaterialCommunityIcons
                            name={isSecure ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
