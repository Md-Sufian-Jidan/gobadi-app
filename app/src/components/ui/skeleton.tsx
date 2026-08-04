import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '@/constants/design-system';

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: object;
}

/** Base shimmering block. Every skeleton layout below is composed of these. */
export function SkeletonBox({ width = '100%', height = 16, borderRadius: r = radius.sm, style }: SkeletonBoxProps) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: colors.skeletonBase },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Matches the `listItem`/`taskItem` row pattern: 44px circle + two text lines. Used on Home, My Task, Notifications. */
export function RowSkeleton() {
  return (
    <View style={styles.row}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={styles.rowText}>
        <SkeletonBox width="55%" height={14} />
        <SkeletonBox width="35%" height={11} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/** Matches the animals/doctors/market card pattern: left image block + right detail lines. */
export function MediaCardSkeleton({ imageSize = 100 }: { imageSize?: number }) {
  return (
    <View style={styles.mediaCard}>
      <SkeletonBox width={imageSize} height={imageSize} borderRadius={radius.lg} />
      <View style={styles.mediaCardBody}>
        <SkeletonBox width="70%" height={15} />
        <SkeletonBox width="45%" height={12} style={{ marginTop: 8 }} />
        <SkeletonBox width="90%" height={12} style={{ marginTop: 12 }} />
        <SkeletonBox width="60%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/** Matches the narrow vertical `alertCard` (width 175). */
export function AlertCardSkeleton() {
  return (
    <View style={styles.alertCard}>
      <SkeletonBox width={36} height={36} borderRadius={18} />
      <SkeletonBox width="80%" height={13} style={{ marginTop: 12 }} />
      <SkeletonBox width="60%" height={11} style={{ marginTop: 6 }} />
      <SkeletonBox width="100%" height={36} borderRadius={12} style={{ marginTop: 12 }} />
    </View>
  );
}

export function SkeletonGroup({ count, children }: { count: number; children: (idx: number) => React.ReactNode }) {
  return <>{Array.from({ length: count }, (_, idx) => children(idx))}</>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowText: {
    marginLeft: 16,
    flex: 1,
  },
  mediaCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  mediaCardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    width: 175,
  },
});
