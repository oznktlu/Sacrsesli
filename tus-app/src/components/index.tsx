// src/components/index.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  disabled, loading, style, icon
}) => {
  const bg = {
    primary: COLORS.primary,
    secondary: COLORS.accentLight,
    ghost: 'transparent',
    danger: COLORS.danger,
  }[variant];

  const textColor = {
    primary: COLORS.white,
    secondary: COLORS.accent,
    ghost: COLORS.primary,
    danger: COLORS.white,
  }[variant];

  const padding = { sm: 8, md: 14, lg: 18 }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        s.btn,
        { backgroundColor: bg, paddingVertical: padding,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: COLORS.primary,
          opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={s.btnInner}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[s.btnText, { color: textColor, fontSize }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevated }) => {
  const Inner = (
    <View style={[s.card, elevated && s.cardElevated, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
};

// ── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label, color = COLORS.accent, bgColor = COLORS.accentLight
}) => (
  <View style={[s.badge, { backgroundColor: bgColor }]}>
    <Text style={[s.badgeText, { color }]}>{label}</Text>
  </View>
);

// ── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress, color = COLORS.accent, height = 8, style
}) => (
  <View style={[s.progressTrack, { height, borderRadius: height / 2 }, style]}>
    <View
      style={[
        s.progressFill,
        {
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          backgroundColor: color,
          height,
          borderRadius: height / 2,
        },
      ]}
    />
  </View>
);

// ── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, onAction }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={s.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── StatTile ─────────────────────────────────────────────────────────────────
interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, sub, color = COLORS.primary }) => (
  <View style={s.statTile}>
    <Text style={[s.statValue, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
    {sub && <Text style={s.statSub}>{sub}</Text>}
  </View>
);

// ── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon, title, description, action, onAction
}) => (
  <View style={s.empty}>
    <Text style={s.emptyIcon}>{icon}</Text>
    <Text style={s.emptyTitle}>{title}</Text>
    {description && <Text style={s.emptyDesc}>{description}</Text>}
    {action && (
      <Button label={action} onPress={onAction!} variant="primary" style={{ marginTop: SPACING.lg }} />
    )}
  </View>
);

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  btn: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  btnInner: { flexDirection: 'row', alignItems: 'center' },
  btnText: {
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardElevated: {
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    letterSpacing: 0.3,
  },
  progressTrack: {
    backgroundColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  progressFill: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
  },
  sectionAction: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.accent,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  statSub: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
});
