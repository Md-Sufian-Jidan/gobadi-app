/**
 * De facto design tokens for Gobadi's feature screens.
 * Centralizes the hex values / radii / type scale already used ad-hoc
 * across src/app/** so shared components (EmptyState, skeletons, etc.)
 * stay visually consistent with existing screens.
 */

export const colors = {
  brand: '#BD632F',
  text: '#1A1817',
  textMuted: '#7C7672',
  textFaint: '#9C9690',
  placeholder: '#A39E99',
  background: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceTint: '#FFF8F4',
  border: '#E6E1DC',
  borderAlt: '#E9E5DF',
  divider: '#F0EAE1',
  skeletonBase: '#F0EAE1',
  skeletonHighlight: '#FBF8F4',
  success: '#4CAF50',
  successText: '#2E7D32',
  successBg: '#E8F5E9',
  danger: '#E53935',
  dangerText: '#C62828',
  dangerBg: '#FFEBEE',
  warningBg: '#FFF3E0',
  warningText: '#E65100',
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const typography = {
  title: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.textMuted },
  small: { fontSize: 11, fontWeight: '500' as const, color: colors.textFaint },
};

export const cardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 2,
} as const;
