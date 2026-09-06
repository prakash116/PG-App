import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Drag further than this, or flick faster than the velocity below, and the
 *  sheet closes instead of snapping back. */
const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 900;

/**
 * A sheet that rises from the bottom on a spring, and leaves the same way.
 *
 * It stays mounted through its closing animation: `open` flips to false, the
 * panel animates off-screen, and only then does the tree unmount. Unmounting
 * on the prop flip would cut the exit to a single frame, which reads as a
 * glitch rather than a close. Drag, backdrop tap and the Android back button
 * all route through the same onClose, so there is one way out, not three.
 */
export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [mounted, setMounted] = useState(open);
  /** 0 = fully closed, 1 = resting open. */
  const progress = useSharedValue(0);
  /** Finger offset while dragging, in points. */
  const drag = useSharedValue(0);
  const panelHeight = useSharedValue(windowHeight);

  const unmount = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      drag.value = 0;
      progress.value = withSpring(1, theme.motion.spring.heavy);
      return;
    }

    progress.value = withTiming(
      0,
      { duration: tierDuration(theme.motion.duration.base) },
      finished => {
        if (finished) {
          runOnJS(unmount)();
        }
      },
    );
  }, [drag, open, progress, theme.motion.duration.base, theme.motion.spring.heavy, unmount]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose, open]);

  const pan = Gesture.Pan()
    .onUpdate(event => {
      // Only downward drags move the sheet; pulling up past rest just resists.
      drag.value = Math.max(0, event.translationY);
    })
    .onEnd(event => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        runOnJS(onClose)();
      } else {
        drag.value = withSpring(0, theme.motion.spring.responsive);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * panelHeight.value + drag.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={[styles.backdrop, { backgroundColor: theme.colors.scrim }]}
        />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View
          onLayout={event => {
            panelHeight.value = event.nativeEvent.layout.height;
          }}
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.sheet,
              borderTopRightRadius: theme.radii.sheet,
              paddingBottom: insets.bottom + theme.spacing.lg,
              maxHeight: windowHeight * 0.8,
            },
            panelStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10, marginBottom: 6 },
});
