import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import Typography from '../styles/typography';

export default function TransactionInfoScreen({ notif, onBack, onEdit, onUndo, onDownload }) {
    const { colors, currency } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    if (!notif || !notif.transaction_data) return null;

    const txn = notif.transaction_data;
    const isDeleted = notif.notification_type === 'DELETED';

    // Check if expense or income
    const isExpense = txn.category && typeof txn.category !== 'number' && txn.category.type === 'EXPENSE';
    const amountPrefix = isExpense ? `-${currency.symbol}` : `+${currency.symbol}`;
    const displayAmount = parseFloat(txn.amount).toFixed(2);

    // Formatting helpers
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Transaction Info</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Big Amount Text */}
                <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>{amountPrefix}{displayAmount}</Text>
                    <Text style={styles.statusText}>{isDeleted ? 'DELETED' : 'SUCCESSFUL'}</Text>
                </View>

                {/* Details Card */}
                <View style={styles.card}>
                    {/* Description Row */}
                    <View style={styles.detailRow}>
                        <View style={styles.iconBoxYellow}>
                            <MaterialCommunityIcons name="storefront-outline" size={20} color="#D8B024" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>MERCHANT / DESCRIPTION</Text>
                            <Text style={styles.detailValue}>{txn.description}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Category Row */}
                    <View style={styles.detailRow}>
                        <View style={styles.iconBoxOrange}>
                            <MaterialCommunityIcons name={txn.category ? txn.category.icon_name : 'tag'} size={20} color="#E89632" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>CATEGORY</Text>
                            <Text style={styles.detailValue}>{txn.category ? txn.category.name : 'Unknown'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Date Row */}
                    <View style={styles.detailRow}>
                        <View style={styles.iconBoxOrange}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#E89632" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>DATE</Text>
                            <Text style={styles.detailValue}>{formatDateTime(txn.date)}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    {isDeleted ? (
                        <Pressable style={styles.primaryButton} onPress={() => onUndo(txn)}>
                            <Text style={styles.primaryButtonText}>Undo Transaction</Text>
                        </Pressable>
                    ) : (
                        <Pressable style={styles.primaryButton} onPress={() => onEdit(txn)}>
                            <Text style={styles.primaryButtonText}>Edit Transaction</Text>
                        </Pressable>
                    )}

                    <Pressable style={styles.secondaryButton} onPress={onDownload}>
                        <MaterialCommunityIcons name="download" size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryButtonText}>Download Receipt</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 28,
    },
    headerTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    amountContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    amountText: {
        fontSize: 48,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: -1,
    },
    statusText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: Typography.weight.bold,
        letterSpacing: 1.5,
        marginTop: 8,
    },
    card: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginLeft: 56, // indent past icon
    },
    iconBoxYellow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF7E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconBoxOrange: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF2E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    detailTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    buttonContainer: {
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#1E1E1E', // Very dark gray/black
        borderRadius: 16,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    }
});
