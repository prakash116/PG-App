import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Gradient } from '@/components/common/Gradient';
import { Text } from '@/components/common/Text';
import { HEADER_ROW_HEIGHT } from '@/components/common/Header';
import type { BannerSlide } from '@/lib/banners';
import { useTheme } from '@/theme';

interface BannerCarouselProps {
  slides: BannerSlide[];
  /** Total height including the status-bar area it runs under. */
  height: number;
  /** The list's vertical offset, for the parallax. */
  scrollY?: SharedValue<number>;
  onSlidePress?: (slide: BannerSlide) => void;
}

/** Same cadence as the website's hero. */
const ADVANCE_MS = 5000;

/** The warm ink the website's hero gradients are built from. */
export const INK = '#1C1714';

/**
 * Full-bleed hero carousel that starts at the very top of the screen — the
 * transparent header floats over it. Auto-advances, pauses while a finger is
 * on it, and resumes from wherever the user left it rather than snapping back.
 *
 * Two parallaxes: slides' images drift against the horizontal swipe, and the
 * whole banner rises at under half the list's speed, so it reads as a layer
 * behind the cards rather than the first card.
 */
export function BannerCarousel({ slides, height, scrollY, onSlidePress }: BannerCarouselProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const indexRef = useRef(0);
  const [paused, setPaused] = useState(false);

  const settle = useCallback(
    (offsetX: number) => {
      indexRef.current = Math.round(offsetX / width);
      setPaused(false);
    },
    [width],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      runOnJS(setPaused)(true);
    },
    onMomentumEnd: event => {
      runOnJS(settle)(event.contentOffset.x);
    },
  });

  useEffect(() => {
    if (paused || slides.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: indexRef.current * width, animated: true });
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, scrollRef, slides.length, width]);

  const parallaxStyle = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    return {
      transform: [
        // Rise at under half speed while scrolling down; stretch on overscroll.
        { translateY: y > 0 ? y * 0.45 : 0 },
        { scale: y < 0 ? 1 + -y / height : 1 },
      ],
    };
  });

  // Text sits below the header row and above the dots.
  const textTop = insets.top + HEADER_ROW_HEIGHT;

  return (
    <Animated.View style={[{ height, backgroundColor: INK }, parallaxStyle]}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            index={index}
            width={width}
            height={height}
            textTop={textTop}
            scrollX={scrollX}
            onPress={onSlidePress}
          />
        ))}
      </Animated.ScrollView>

      <View style={[styles.dots, { bottom: theme.spacing.lg, gap: theme.spacing.xs }]}>
        {slides.map((slide, index) => (
          <Dot key={slide.id} index={index} width={width} scrollX={scrollX} />
        ))}
      </View>
    </Animated.View>
  );
}

interface SlideProps {
  slide: BannerSlide;
  index: number;
  width: number;
  height: number;
  textTop: number;
  scrollX: SharedValue<number>;
  onPress?: (slide: BannerSlide) => void;
}

function Slide({ slide, index, width, height, textTop, scrollX, onPress }: SlideProps) {
  const theme = useTheme();
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  // The image drifts against the swipe and the copy drifts with it, at
  // different rates — that difference is what gives the slide depth.
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(scrollX.value, range, [-width * 0.25, 0, width * 0.25], Extrapolation.CLAMP),
      },
    ],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(scrollX.value, range, [width * 0.12, 0, -width * 0.12], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Pressable onPress={() => onPress?.(slide)} style={{ width, height }}>
      <Animated.Image
        source={{ uri: slide.image }}
        resizeMode="cover"
        style={[styles.image, { width: width * 1.5, left: -width * 0.25, height }, imageStyle]}
      />

      {/* Top scrim keeps the status bar and header legible over a bright photo. */}
      <Gradient
        stops={[
          { offset: 0, color: INK, opacity: 0.5 },
          { offset: 1, color: INK, opacity: 0 },
        ]}
        style={{ bottom: undefined, height: textTop + 32 }}
      />
      {/* The website's bottom fade, taller here because the copy sits on it. */}
      <Gradient
        stops={[
          { offset: 0, color: INK, opacity: 0 },
          { offset: 0.5, color: INK, opacity: 0.6 },
          { offset: 1, color: INK, opacity: 0.94 },
        ]}
        style={{ top: height * 0.3 }}
      />

      <Animated.View
        style={[
          styles.copy,
          { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.huge },
          copyStyle,
        ]}
      >
        <View style={[styles.eyebrow, { borderRadius: theme.radii.pill }]}>
          <Text variant="caption" style={styles.white}>
            {slide.eyebrow}
          </Text>
        </View>
        <Text variant="title1" style={styles.white}>
          {slide.title}
        </Text>
        <Text variant="body" style={styles.whiteMuted}>
          {slide.subtitle}
        </Text>
        <View style={[styles.cta, { backgroundColor: theme.colors.accent, borderRadius: theme.radii.pill }]}>
          <Text variant="bodyStrong" tone="onAccent">
            {slide.cta}
          </Text>
          <ArrowRight size={16} color={theme.colors.textOnAccent} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

function Dot({ index, width, scrollX }: { index: number; width: number; scrollX: SharedValue<number> }) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const style = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, range, [8, 24, 8], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, range, [0.4, 1, 0.4], Extrapolation.CLAMP),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  image: { position: 'absolute', top: 0 },
  copy: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  white: { color: '#FFFFFF' },
  whiteMuted: { color: 'rgba(255, 255, 255, 0.8)', marginTop: 6 },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  dots: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center' },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
});
