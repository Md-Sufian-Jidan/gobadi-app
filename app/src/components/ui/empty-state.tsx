import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { colors, radius } from '@/constants/design-system';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

/** Single shared illustration (open crate) reused by every empty section for visual consistency. */
function EmptyIllustration({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Circle cx="48" cy="48" r="48" fill="#FFF3E9" />
      <Rect x="24" y="42" width="48" height="28" rx="6" fill="#FFFFFF" stroke="#E6E1DC" strokeWidth="2" />
      <Path d="M24 42L48 30L72 42" stroke="#BD632F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M38 54H58" stroke="#E6E1DC" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="48" cy="30" r="4" fill="#BD632F" />
    </Svg>
  );
}

export function EmptyState({ title, description, actionLabel, onAction, compact }: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <EmptyIllustration size={compact ? 72 : 96} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  containerCompact: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
});
