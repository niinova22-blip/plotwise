import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import type { CardKind } from '@/store/types';

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

type TxtVariant = 'display' | 'title' | 'heading' | 'body' | 'small' | 'caption';

export function Txt({
  variant = 'body',
  color = 'text',
  style,
  children,
  ...rest
}: TextProps & { variant?: TxtVariant; color?: ThemeColor }) {
  const theme = useTheme();
  const { lang } = useI18n();
  // textTransform ignores locale, which turns Turkish "i" into "I" instead of "İ".
  const upper = variant === 'caption' && typeof children === 'string';
  return (
    <Text style={[{ color: theme[color] }, text[variant], upper && text.noTransform, style]} {...rest}>
      {upper ? children.toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-US') : children}
    </Text>
  );
}

const text = StyleSheet.create({
  display: { fontFamily: Fonts.serif, fontSize: 34, lineHeight: 40, fontWeight: '600', letterSpacing: -0.5 },
  title: { fontFamily: Fonts.serif, fontSize: 26, lineHeight: 32, fontWeight: '600', letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  small: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  noTransform: { textTransform: 'none' },
});

export function Screen({
  title,
  back = true,
  right,
  footer,
  children,
  scroll = true,
}: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
}) {
  const theme = useTheme();
  const { s } = useI18n();
  const body = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {(title || back || right) && (
          <View style={styles.header}>
            <View style={styles.headerSide}>
              {back && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={s.common.back}
                  hitSlop={12}
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
                  <Txt variant="heading" color="textSecondary">
                    ←
                  </Txt>
                </Pressable>
              )}
            </View>
            <Txt variant="small" color="textSecondary" style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Txt>
            <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
          </View>
        )}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            {body}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.scroll]}>{body}</View>
        )}
        {footer && <View style={[styles.footer, { borderTopColor: theme.border }]}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const bg =
    variant === 'primary' ? theme.accent : variant === 'secondary' ? theme.surfaceAlt : 'transparent';
  const fg: ThemeColor = variant === 'primary' ? 'onAccent' : variant === 'secondary' ? 'text' : 'accent';
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme[fg]} />
      ) : (
        <Txt variant="heading" color={fg}>
          {label}
        </Txt>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  onPress,
  selected,
  style,
  accent,
}: {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  accent?: ThemeColor;
}) {
  const theme = useTheme();
  const base: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: theme.surface,
      borderColor: selected ? theme.accent : theme.border,
      borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
    },
    accent && { borderLeftWidth: 3, borderLeftColor: theme[accent] },
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  color = 'accent',
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  color?: ThemeColor;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme[color] : theme.surface,
          borderColor: selected ? theme[color] : theme.border,
        },
      ]}>
      <Txt variant="small" color={selected ? 'onAccent' : 'text'} style={styles.chipText}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
  minHeight = 120,
  autoFocus,
  style,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  autoFocus?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textTertiary}
      multiline
      autoFocus={autoFocus}
      textAlignVertical="top"
      style={[
        styles.field,
        { minHeight, color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    />
  );
}

export function Steps({ total, current }: { total: number; current: number }) {
  const theme = useTheme();
  return (
    <View style={styles.steps} accessibilityLabel={`${current + 1} / ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.step, { backgroundColor: i <= current ? theme.accent : theme.surfaceAlt }]}
        />
      ))}
    </View>
  );
}

export function KindBadge({ kind }: { kind: CardKind }) {
  const { s } = useI18n();
  const theme = useTheme();
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: theme[kind] }]} />
      <Txt variant="caption" color={kind}>
        {s.notebook.kinds[kind]}
      </Txt>
    </View>
  );
}

export function Loading() {
  const { s } = useI18n();
  const theme = useTheme();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.accent} />
      <Txt variant="small" color="textSecondary">
        {s.common.loading}
      </Txt>
    </View>
  );
}

export function ErrorNote({ quota, onRetry }: { quota?: boolean; onRetry?: () => void }) {
  const { s } = useI18n();
  return (
    <Card>
      <Txt color="textSecondary">{quota ? s.common.quota : s.common.error}</Txt>
      {!quota && onRetry && <Button label={s.common.retry} variant="secondary" onPress={onRetry} style={styles.mtTwo} />}
    </Card>
  );
}

export const Gap = ({ size = 'three' }: { size?: keyof typeof Spacing }) => <View style={{ height: Spacing[size] }} />;

export const Row = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.row, style]}>{children}</View>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  headerSide: { width: 72 },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.three, paddingBottom: Spacing.five },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.three },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    minHeight: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: Radius.md, padding: Spacing.three, gap: Spacing.two },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: { fontWeight: '600' },
  field: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    fontSize: 16,
    lineHeight: 24,
  },
  steps: { flexDirection: 'row', gap: Spacing.one },
  step: { flex: 1, height: 4, borderRadius: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: 4 },
  loading: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  mtTwo: { marginTop: Spacing.two },
});
