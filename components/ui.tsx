import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadow } from '@/constants/theme';

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
});
