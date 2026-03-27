import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, Pressable, ScrollView, Modal, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import analyticsService from '../services/analyticsService';
import CalendarRangePicker from '../components/CalendarRangePicker';
import { useTheme, getContrastIconColor } from '../styles/theme';



const PERIOD_OPTIONS = [
    { id: 'month', label: 'This Month', icon: 'calendar-month' },
    { id: 'last_3_months', label: 'Last 3 Months', icon: 'calendar-range' },
    { id: 'year', label: 'Last 12 Months', icon: 'calendar-blank-multiple' },
    { id: 'custom', label: 'Custom Range', icon: 'calendar-edit' },
];

export default function ReportPreviewScreen({ onBack, reportData: initialData }) {
    const { colors, formatCurrency, currency } = useTheme();
    const BG = colors.backgroundPrimary;
    const ACCENT = colors.accent;
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const CARD = colors.backgroundCard;
    const s = React.useMemo(() => getStyles(colors, BG, ACCENT, DARK, MUTED, CARD), [colors]);

    // ── Filter state ────────────────────────────────────────────────────────
    const [period, setPeriod] = useState('month');
    const [customStart, setCustomStart] = useState(null);
    const [customEnd, setCustomEnd] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    // ── Report data state ────────────────────────────────────────────────────
    const [data, setData] = useState(initialData?.data || null);
    const [monthLabel, setLabel] = useState(initialData?.monthLabel || 'Report');
    const [timeframeText, setTFT] = useState(initialData?.timeframeText || 'MONTHLY OVERVIEW');
    const [loading, setLoading] = useState(false);

    // ── Generating state ─────────────────────────────────────────────────────
    const [generating, setGenerating] = useState(false);

    const formatDateLocal = (d) => {
        if (!d) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const sd = formatDateLocal(customStart);
            const ed = customEnd ? formatDateLocal(customEnd) : sd;
            const res = await analyticsService.getAnalytics(period, null, sd, ed, null);
            setData(res);
            setLabel(res.month_label);
            const labelMap = {
                month: 'MONTHLY OVERVIEW',
                last_3_months: '3-MONTH OVERVIEW',
                year: '12-MONTH OVERVIEW',
                custom: 'CUSTOM OVERVIEW',
            };
            setTFT(labelMap[period] || 'OVERVIEW');
        } catch (e) {
            console.warn('ReportPreview fetch failed', e);
        } finally {
            setLoading(false);
        }
    }, [period, customStart, customEnd]);

    // Auto-fetch when period changes (unless it's custom with no dates)
    useEffect(() => {
        if (period === 'custom' && !customStart) return;
        fetchReport();
    }, [period, customStart, customEnd]);

    // ── PDF HTML builder ─────────────────────────────────────────────────────
    const generateHtml = () => {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const d = data || { spent_total: 0, weekly_data: [], top_categories: [] };

        const weeklyHtml = d.weekly_data.map(w => `
            <td style="text-align:center;padding:0 6px;font-size:11px;color:#9DA3B4;">${w.label}</td>
        `).join('');

        const catRows = d.top_categories.map((cat, i) => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;font-size:13px;font-weight:500;color:#1A1F36;">${i + 1}. ${cat.name}</td>
                <td style="padding:10px 0;font-size:13px;color:#9DA3B4;text-align:center;">${cat.count} txn</td>
                <td style="padding:10px 0;font-size:13px;font-weight:bold;color:#1A1F36;text-align:right;">${formatCurrency(cat.amount)}</td>
                <td style="padding:10px 0;font-size:12px;color:#9DA3B4;text-align:right;">${cat.percentage}%</td>
            </tr>
        `).join('');

        return `
        <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: white; color: #1A1F36; }
            .page { padding: 40px 50px; max-width: 794px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #1A1F36; padding-bottom: 24px; }
            .brand-row { display: flex; align-items: center; gap: 12px; }
            .logo { width: 36px; height: 36px; background: #1A1F36; border-radius: 8px; }
            .brand { font-size: 26px; font-weight: 900; letter-spacing: -1px; }
            .sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9DA3B4; margin-top: 4px; font-weight: 600; }
            .meta { text-align: right; }
            .meta h2 { font-size: 15px; font-weight: 700; }
            .meta p { font-size: 11px; color: #9DA3B4; margin-top: 4px; }
            .overview { margin-bottom: 40px; }
            .ov-type { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #9DA3B4; font-weight: 700; margin-bottom: 6px; }
            .ov-amount { font-size: 52px; font-weight: 900; letter-spacing: -2px; color: #1A1F36; }
            .ov-sub { font-size: 14px; color: #9DA3B4; margin-left: 10px; }
            .period-row { display: flex; gap: 6px; margin-top: 10px; }
            .period-tag { background: #F5EDD8; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 600; color: #C4A44A; }
            .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9DA3B4; font-weight: 700; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 10px; color: #9DA3B4; border-top: 1px solid #eee; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div>
                <div class="brand-row"><div class="logo"></div><span class="brand">Finovo</span></div>
                <div class="sub">Financial Report</div>
              </div>
              <div class="meta">
                <h2>${monthLabel}</h2>
                <p>Generated ${today}</p>
              </div>
            </div>

            <div class="overview">
              <div class="ov-type">${timeframeText}</div>
              <div style="display:flex;align-items:baseline;">
                <span class="ov-amount">${formatCurrency(d.spent_total)}</span>
                <span class="ov-sub">Total Spending</span>
              </div>
              ${d.weekly_data.length > 0 ? `
              <div style="margin-top:24px;">
                <table><tr>${weeklyHtml}</tr></table>
              </div>` : ''}
            </div>

            <div class="section-title">Top Spending Categories</div>
            <table>
              <thead><tr>
                <th style="text-align:left;font-size:11px;color:#9DA3B4;font-weight:600;padding-bottom:8px;">Category</th>
                <th style="text-align:center;font-size:11px;color:#9DA3B4;font-weight:600;padding-bottom:8px;">Transactions</th>
                <th style="text-align:right;font-size:11px;color:#9DA3B4;font-weight:600;padding-bottom:8px;">Amount</th>
                <th style="text-align:right;font-size:11px;color:#9DA3B4;font-weight:600;padding-bottom:8px;">Share</th>
              </tr></thead>
              <tbody>${catRows}</tbody>
            </table>

            <div class="footer">
              <span>© ${new Date().getFullYear()} Finovo Inc. Confidential Document.</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </body>
        </html>`;
    };

    const handleSharePDF = async () => {
        if (!data) return;
        try {
            setGenerating(true);
            const { uri } = await Print.printToFileAsync({ html: generateHtml(), base64: false });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (e) {
            console.warn('Failed to share PDF', e);
        } finally {
            setGenerating(false);
        }
    };

    const d = data || { spent_total: 0, weekly_data: [], top_categories: [] };

    return (
        <View style={s.container}>
            {/* ── Header ── */}
            <View style={s.header}>
                <Pressable onPress={onBack} hitSlop={12}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={DARK} />
                </Pressable>
                <Text style={s.headerTitle}>Full Report</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Period Selector ── */}
                <Text style={s.sectionLabel}>REPORT PERIOD</Text>
                <View style={s.periodGrid}>
                    {PERIOD_OPTIONS.map(opt => {
                        const active = period === opt.id;
                        return (
                            <Pressable
                                key={opt.id}
                                style={[s.periodChip, active && s.periodChipActive]}
                                onPress={() => {
                                    setPeriod(opt.id);
                                    if (opt.id === 'custom') setShowCalendar(true);
                                }}
                            >
                                <MaterialCommunityIcons name={opt.icon} size={16} color={active ? colors.backgroundPrimary : DARK} />
                                <Text style={[s.periodLabel, active && s.periodLabelActive]}>{opt.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Custom date range display */}
                {period === 'custom' && (
                    <Pressable style={s.customRangeRow} onPress={() => setShowCalendar(true)}>
                        <MaterialCommunityIcons name="calendar-range" size={18} color={ACCENT} />
                        <Text style={s.customRangeText}>
                            {customStart && customEnd
                                ? `${customStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}  →  ${customEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                : 'Tap to select date range'}
                        </Text>
                        <MaterialCommunityIcons name="pencil" size={15} color={MUTED} />
                    </Pressable>
                )}

                {/* ── Document Preview Card ── */}
                <Text style={s.sectionLabel}>PREVIEW</Text>
                <View style={s.documentCard}>
                    {loading ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                            <ActivityIndicator color={ACCENT} size="large" />
                            <Text style={{ color: MUTED, marginTop: 12, fontSize: 13 }}>Loading report data...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Doc header */}
                            <View style={s.docHeader}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                        <View style={s.docLogo}>
                                            <MaterialCommunityIcons name="wallet" size={10} color="#fff" />
                                        </View>
                                        <Text style={s.docBrand}>Finovo</Text>
                                    </View>
                                    <Text style={s.docLight}>FINANCIAL REPORT</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={s.docMonth}>{monthLabel}</Text>
                                    <Text style={s.docGen}>Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </View>
                            </View>

                            {/* Totals */}
                            <Text style={[s.docLight, { marginTop: 28 }]}>{timeframeText}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4, marginBottom: 20 }}>
                                <Text style={s.docTotal}>{formatCurrency(d.spent_total)}</Text>
                                <Text style={s.docTotalSub}>Total Spending</Text>
                            </View>

                            {/* Weekly labels strip */}
                            {d.weekly_data.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        {d.weekly_data.map((w, i) => (
                                            <View key={i} style={[s.weekChip, w.amount === Math.max(...d.weekly_data.map(x => x.amount)) && s.weekChipActive]}>
                                                <Text style={[s.weekLabel, w.amount === Math.max(...d.weekly_data.map(x => x.amount)) && s.weekLabelActive]} numberOfLines={1}>{w.label}</Text>
                                                <Text style={[s.weekAmt, w.amount === Math.max(...d.weekly_data.map(x => x.amount)) && s.weekAmtActive]}>{formatCurrency(w.amount)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            )}

                            {/* Top categories */}
                            <Text style={[s.docLight, { marginTop: 24, borderBottomWidth: 1, borderColor: colors.divider, paddingBottom: 8, marginBottom: 14 }]}>TOP SPENDING CATEGORIES</Text>
                            {d.top_categories.length === 0 && (
                                <Text style={{ color: MUTED, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>No spending data for this period.</Text>
                            )}
                            {d.top_categories.map((cat, i) => (
                                <View key={i} style={s.catRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={[s.catIcon, { backgroundColor: cat.color || colors.progressTrack }]}>
                                            <MaterialCommunityIcons name={cat.icon_name} size={13} color={getContrastIconColor(cat.color || colors.progressTrack)} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.catName}>{cat.name}</Text>
                                            <Text style={s.catCount}>{cat.count} transaction{cat.count !== 1 ? 's' : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={s.catAmt}>{formatCurrency(cat.amount)}</Text>
                                        <Text style={s.catPct}>{cat.percentage}%</Text>
                                    </View>
                                </View>
                            ))}

                            {/* Doc footer */}
                            <View style={s.docFooter}>
                                <Text style={s.docFooterText}>© {new Date().getFullYear()} Finovo Inc.</Text>
                                <Text style={s.docFooterText}>Page 1 of 1</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* ── Action Buttons ── */}
                <Pressable style={[s.shareBtn, (generating || loading) && { opacity: 0.6 }]} onPress={handleSharePDF} disabled={generating || loading}>
                    {generating ? (
                        <><ActivityIndicator color={colors.backgroundPrimary} size="small" /><Text style={s.shareBtnText}>Generating PDF...</Text></>
                    ) : (
                        <><MaterialCommunityIcons name="export-variant" size={20} color={colors.backgroundPrimary} /><Text style={s.shareBtnText}>Share PDF</Text></>
                    )}
                </Pressable>
                <Pressable style={[s.saveBtn, (generating || loading) && { opacity: 0.6 }]} onPress={handleSharePDF} disabled={generating || loading}>
                    <MaterialCommunityIcons name="folder-download-outline" size={20} color={DARK} />
                    <Text style={s.saveBtnText}>Save to Files</Text>
                </Pressable>

            </ScrollView>

            {/* ── Calendar Modal ── */}
            <Modal visible={showCalendar} animationType="slide" onRequestClose={() => setShowCalendar(false)}>
                <View style={{ flex: 1, backgroundColor: BG }}>
                    <View style={s.calHeader}>
                        <Pressable onPress={() => setShowCalendar(false)} hitSlop={12}>
                            <MaterialCommunityIcons name="close" size={26} color={DARK} />
                        </Pressable>
                        <Text style={s.calTitle}>Select Date Range</Text>
                        <Pressable
                            onPress={() => setShowCalendar(false)}
                            style={[s.applyBtn, (!customStart || !customEnd) && { opacity: 0.4 }]}
                            disabled={!customStart || !customEnd}
                        >
                            <Text style={s.applyBtnText}>Apply</Text>
                        </Pressable>
                    </View>
                    <ScrollView>
                        <CalendarRangePicker
                            startDate={customStart}
                            endDate={customEnd}
                            onRangeChange={(start, end) => {
                                setCustomStart(start);
                                setCustomEnd(end);
                            }}
                        />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (colors, BG, ACCENT, DARK, MUTED, CARD) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 50 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },

    sectionLabel: { fontSize: 10, color: MUTED, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },

    periodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    periodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: 'transparent' },
    periodChipActive: { backgroundColor: DARK, borderColor: DARK },
    periodLabel: { fontSize: 13, fontWeight: '600', color: DARK },
    periodLabelActive: { color: colors.backgroundPrimary },

    customRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: ACCENT },
    customRangeText: { flex: 1, fontSize: 13, color: DARK, fontWeight: '500' },

    documentCard: {
        backgroundColor: CARD,
        borderRadius: 4,
        padding: 22,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        marginBottom: 24,
    },

    docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    docLogo: { width: 18, height: 18, backgroundColor: DARK, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
    docBrand: { fontSize: 18, fontWeight: '900', color: DARK, letterSpacing: -0.5 },
    docLight: { fontSize: 9, color: '#9DA3B4', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '700' },
    docMonth: { fontSize: 12, fontWeight: '700', color: DARK, marginBottom: 2 },
    docGen: { fontSize: 9, color: '#9DA3B4' },
    docTotal: { fontSize: 34, fontWeight: '900', color: DARK, letterSpacing: -1 },
    docTotalSub: { fontSize: 12, color: '#9DA3B4', marginLeft: 8 },

    weekChip: { backgroundColor: colors.progressTrack, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 60 },
    weekChipActive: { backgroundColor: DARK },
    weekLabel: { fontSize: 9, color: MUTED, fontWeight: '600', marginBottom: 2 },
    weekLabelActive: { color: colors.backgroundPrimary },
    weekAmt: { fontSize: 10, color: DARK, fontWeight: '700' },
    weekAmtActive: { color: ACCENT },

    catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    catIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    catName: { fontSize: 12, fontWeight: '600', color: DARK },
    catCount: { fontSize: 10, color: MUTED, marginTop: 1 },
    catAmt: { fontSize: 12, fontWeight: 'bold', color: DARK },
    catPct: { fontSize: 10, color: MUTED },

    docFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, borderTopWidth: 1, borderColor: colors.divider, paddingTop: 12 },
    docFooterText: { fontSize: 8, color: '#9DA3B4' },

    shareBtn: { backgroundColor: DARK, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, marginBottom: 12 },
    shareBtnText: { color: colors.backgroundPrimary, fontSize: 15, fontWeight: '700' },
    saveBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: DARK, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    saveBtnText: { color: DARK, fontSize: 15, fontWeight: '700' },

    calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20, marginBottom: 12 },
    calTitle: { fontSize: 17, fontWeight: '700', color: DARK },
    applyBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
    applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
