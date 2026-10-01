import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { Modal, NativeSyntheticEvent, NativeScrollEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadow } from '@/constants/theme';
import { formatJapaneseDate, monthDays, pad, parseDateKey, toDateKey } from '@/lib/date';

export function Screen({ children, scroll = true, contentStyle }: PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle }>) {
  if (!scroll) return <SafeAreaView style={styles.screen}><View style={[styles.screen, contentStyle]}>{children}</View></SafeAreaView>;
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>;
}

export function AppButton({ title, onPress, variant = 'primary', icon, disabled = false }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; icon?: string; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, styles[`button_${variant}`], pressed && styles.pressed, disabled && styles.disabled]}><Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryText, variant === 'danger' && styles.dangerText, variant === 'ghost' && styles.ghostText]}>{icon ? `${icon}  ` : ''}{title}</Text></Pressable>;
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

export function Card({ children, style, onPress }: PropsWithChildren<{ style?: ViewStyle; onPress?: () => void }>) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed ? styles.pressed : undefined}>{content}</Pressable> : content;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action && onAction ? <Pressable onPress={onAction}><Text style={styles.link}>{action}</Text></Pressable> : null}</View>;
}

export function Chip({ label, selected, onPress, color }: { label: string; selected?: boolean; onPress?: () => void; color?: string }) {
  const body = <View style={[styles.chip, selected && { backgroundColor: color ?? colors.primary, borderColor: color ?? colors.primary }]}><Text style={[styles.chipText, selected && styles.chipSelectedText]}>{label}</Text></View>;
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export function ChoiceRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.choiceBlock}><Text style={styles.label}>{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{options.map((option) => <Chip key={option} label={option} selected={option === value} onPress={() => onChange(option)} />)}</ScrollView></View>;
}

export function IconCircle({ icon, color = colors.primary, size = 42 }: { icon: string; color?: string; size?: number }) {
  return <View style={[styles.iconCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}18` }]}><Text style={{ fontSize: size * 0.45 }}>{icon}</Text></View>;
}

export function EmptyState({ icon = '✦', title, body, action, onAction }: { icon?: string; title: string; body?: string; action?: string; onAction?: () => void }) {
  return <View style={styles.empty}><Text style={styles.emptyIcon}>{icon}</Text><Text style={styles.emptyTitle}>{title}</Text>{body ? <Text style={styles.emptyBody}>{body}</Text> : null}{action && onAction ? <AppButton title={action} onPress={onAction} variant="secondary" /> : null}</View>;
}

export function StatCard({ label, value, tone = 'default', caption }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' | 'accent'; caption?: string }) {
  return <Card style={styles.statCard}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, tone === 'positive' && { color: colors.success }, tone === 'negative' && { color: colors.danger }, tone === 'accent' && { color: '#B87800' }]}>{value}</Text>{caption ? <Text style={styles.statCaption}>{caption}</Text> : null}</Card>;
}

export function MoneyInput({ label, value, onChangeText, error }: { label: string; value: string; onChangeText: (value: string) => void; error?: string }) {
  return <Field label={label} value={value} onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" error={error} />;
}

export function DateSelector({ label, value, onChange, error, clearable = false }: { label: string; value: string | null; onChange: (value: string | null) => void; error?: string; clearable?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(() => value ? parseDateKey(value) : new Date());
  const open = () => { setMonth(value ? parseDateKey(value) : new Date()); setVisible(true); };
  const selected = value ? parseDateKey(value) : null;
  const days = monthDays(month);
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><Pressable onPress={open} style={({ pressed }) => [styles.selector, pressed && styles.pressed]}><Text style={value ? styles.selectorText : styles.selectorPlaceholder}>{value ? formatJapaneseDate(value) : '日付を選択'}</Text><Text style={styles.selectorIcon}>▣</Text></Pressable>{error ? <Text style={styles.error}>{error}</Text> : null}<Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}><View style={styles.modalOverlay}><View style={styles.modalSheet}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{label}</Text><Pressable onPress={() => setVisible(false)}><Text style={styles.modalClose}>閉じる</Text></Pressable></View><View style={styles.monthPickerHeader}><Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={styles.modalArrow}><Text style={styles.modalArrowText}>‹</Text></Pressable><Text style={styles.modalMonth}>{month.getFullYear()}年{month.getMonth() + 1}月</Text><Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.modalArrow}><Text style={styles.modalArrowText}>›</Text></Pressable></View><View style={styles.weekRow}>{['日', '月', '火', '水', '木', '金', '土'].map((day) => <Text key={day} style={styles.weekText}>{day}</Text>)}</View><View style={styles.grid}>{days.map((day, index) => { if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />; const key = toDateKey(day); const isSelected = key === value; return <Pressable key={key} onPress={() => { onChange(key); setVisible(false); }} style={[styles.dayCell, isSelected && styles.modalSelectedCell]}><Text style={[styles.dayText, isSelected && styles.modalSelectedText]}>{day.getDate()}</Text></Pressable>; })}</View>{clearable ? <Pressable onPress={() => { onChange(null); setVisible(false); }} style={styles.clearDate}><Text style={styles.clearDateText}>期限を設定しない</Text></Pressable> : null}</View></View></Modal></View>;
}

export function TimeSelector({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string | null) => void }) {
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const hours = Array.from({ length: 72 }, (_, index) => index % 24);
  const minutes = Array.from({ length: 36 }, (_, index) => (index % 12) * 5);
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);
  const rowHeight = 44;
  const open = () => { const [nextHour, nextMinute] = value ? value.split(':').map(Number) : [9, 0]; setHour(nextHour); setMinute(Math.round(nextMinute / 5) * 5 % 60); setVisible(true); };
  useEffect(() => { if (!visible) return; requestAnimationFrame(() => { hourRef.current?.scrollTo({ y: (24 + hour) * rowHeight, animated: false }); minuteRef.current?.scrollTo({ y: (12 + Math.round(minute / 5)) * rowHeight, animated: false }); }); }, [visible]);
  const updateHour = (event: NativeSyntheticEvent<NativeScrollEvent>) => { const index = Math.max(0, Math.round(event.nativeEvent.contentOffset.y / rowHeight)); const nextHour = ((index % 24) + 24) % 24; setHour((current) => current === nextHour ? current : nextHour); };
  const updateMinute = (event: NativeSyntheticEvent<NativeScrollEvent>) => { const index = Math.max(0, Math.round(event.nativeEvent.contentOffset.y / rowHeight)); const normalized = ((index % 12) + 12) % 12; const nextMinute = normalized * 5; setMinute((current) => current === nextMinute ? current : nextMinute); };
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><Pressable onPress={open} style={({ pressed }) => [styles.selector, pressed && styles.pressed]}><Text style={value ? styles.selectorText : styles.selectorPlaceholder}>{value ?? '時間を選択'}</Text><Text style={styles.selectorIcon}>◷</Text></Pressable><Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}><View style={styles.modalOverlay}><View style={styles.modalSheet}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{label}</Text><Pressable onPress={() => setVisible(false)}><Text style={styles.modalClose}>閉じる</Text></Pressable></View><Text style={styles.timeHint}>中央のラインに合わせて、時と分をダイヤルのようにスクロール</Text><View style={styles.timePicker}><View style={styles.wheelViewport}><ScrollView ref={hourRef} style={styles.timeColumn} contentContainerStyle={styles.timeColumnContent} showsVerticalScrollIndicator={false} snapToInterval={rowHeight} decelerationRate="fast" scrollEventThrottle={16} onScroll={updateHour} onScrollEndDrag={updateHour} onMomentumScrollEnd={updateHour}>{hours.map((item, index) => <Pressable key={`hour-${index}`} onPress={() => { setHour(item); hourRef.current?.scrollTo({ y: index * rowHeight, animated: true }); }} style={[styles.timeOption, item === hour && styles.timeOptionSelected]}><Text style={[styles.timeOptionText, item === hour && styles.timeOptionSelectedText]}>{pad(item)}</Text></Pressable>)}</ScrollView><View pointerEvents="none" style={styles.wheelHighlight} /><View pointerEvents="none" style={[styles.wheelFade, styles.wheelFadeTop]} /><View pointerEvents="none" style={[styles.wheelFade, styles.wheelFadeBottom]} /></View><Text style={styles.timeSeparator}>:</Text><View style={styles.wheelViewport}><ScrollView ref={minuteRef} style={styles.timeColumn} contentContainerStyle={styles.timeColumnContent} showsVerticalScrollIndicator={false} snapToInterval={rowHeight} decelerationRate="fast" scrollEventThrottle={16} onScroll={updateMinute} onScrollEndDrag={updateMinute} onMomentumScrollEnd={updateMinute}>{minutes.map((item, index) => <Pressable key={`minute-${index}`} onPress={() => { setMinute(item); minuteRef.current?.scrollTo({ y: index * rowHeight, animated: true }); }} style={[styles.timeOption, item === minute && styles.timeOptionSelected]}><Text style={[styles.timeOptionText, item === minute && styles.timeOptionSelectedText]}>{pad(item)}</Text></Pressable>)}</ScrollView><View pointerEvents="none" style={styles.wheelHighlight} /><View pointerEvents="none" style={[styles.wheelFade, styles.wheelFadeTop]} /><View pointerEvents="none" style={[styles.wheelFade, styles.wheelFadeBottom]} /></View></View><AppButton title={`${pad(hour)}:${pad(minute)}で決定`} onPress={() => { onChange(`${pad(hour)}:${pad(minute)}`); setVisible(false); }} /></View></View></Modal></View>;
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.headerTitle}>{title}</Text>{subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}</View>{right}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  headerSubtitle: { marginTop: 5, color: colors.muted, fontSize: 14 },
  button: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 8 },
  button_primary: { backgroundColor: colors.primary },
  button_secondary: { backgroundColor: colors.primarySoft },
  button_danger: { backgroundColor: colors.dangerSoft },
  button_ghost: { backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryText: { color: colors.primary },
  dangerText: { color: colors.danger },
  ghostText: { color: colors.muted },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderRadius: 13, borderWidth: 1, borderColor: colors.line, minHeight: 48, paddingHorizontal: 14, color: colors.ink, fontSize: 16 },
  selector: { backgroundColor: colors.surface, borderRadius: 13, borderWidth: 1, borderColor: colors.line, minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  selectorPlaceholder: { color: colors.muted, fontSize: 16 },
  selectorIcon: { color: colors.primary, fontSize: 20 },
  error: { color: colors.danger, marginTop: 5, fontSize: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, ...shadow },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, marginRight: 8 },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  chipSelectedText: { color: '#fff' },
  choiceBlock: { marginBottom: 10 },
  choiceRow: { paddingBottom: 6 },
  iconCircle: { alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 35, paddingHorizontal: 15 },
  emptyIcon: { fontSize: 30, color: colors.primary, marginBottom: 10 },
  emptyTitle: { fontSize: 16, color: colors.ink, fontWeight: '800' },
  emptyBody: { color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  statCard: { flex: 1, padding: 15, minHeight: 105 },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: '800', marginTop: 9 },
  statCaption: { color: colors.muted, fontSize: 11, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 18, 32, 0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 30, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  modalClose: { color: colors.primary, fontWeight: '800' },
  monthPickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalMonth: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  modalArrow: { width: 42, height: 38, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  modalArrowText: { color: colors.ink, fontSize: 28, lineHeight: 30 },
  weekRow: { flexDirection: 'row', marginBottom: 7 },
  weekText: { width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  dayText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  modalSelectedCell: { backgroundColor: colors.primary },
  modalSelectedText: { color: '#fff' },
  clearDate: { marginTop: 13, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.surface },
  clearDateText: { color: colors.muted, fontWeight: '700' },
  timeHint: { color: colors.muted, textAlign: 'center', fontSize: 13, marginBottom: 10 },
  timePicker: { height: 245, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  wheelViewport: { width: 105, height: 245, backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  timeColumn: { width: 105, height: 245 },
  timeColumnContent: { paddingVertical: 100.5 },
  timeOption: { height: 44, alignItems: 'center', justifyContent: 'center', marginHorizontal: 12, borderRadius: 11 },
  timeOptionSelected: { backgroundColor: colors.primary },
  timeOptionText: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  timeOptionSelectedText: { color: '#fff' },
  wheelHighlight: { position: 'absolute', left: 0, right: 0, top: 100.5, height: 44, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#B7C7FF', backgroundColor: 'rgba(58,111,247,0.06)' },
  wheelFade: { position: 'absolute', left: 0, right: 0, height: 64, backgroundColor: 'rgba(255,255,255,0.88)' },
  wheelFadeTop: { top: 0 },
  wheelFadeBottom: { bottom: 0 },
  timeSeparator: { color: colors.ink, fontSize: 25, fontWeight: '900', marginHorizontal: 10 },
});
