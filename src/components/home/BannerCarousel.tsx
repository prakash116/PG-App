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
import { BannerTexture } from './BannerTexture';
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

/**
 * Full-bleed brand surface that starts at the very top of the screen — the
 * transparent header floats over it. Solid colour and a quiet texture, no
 * copy: the banner is ground for the header, not a message.
 *
 * Auto-advances, pauses while a finger is on it, and resumes from wherever
 * the user left it rather than snapping back. Two parallaxes: each texture
 * drifts against the swipe, and the whole banner rises at under half the
 * list's speed, so it reads as a layer behind the cards.
 */
export function BannerCarousel({ slides, height, scrollY, onSlidePress }: BannerCarouselProps) {
  const theme = useTheme();
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

  return (
    <Animated.View style={[{ height, backgroundColor: theme.colors.accent }, parallaxStyle]}>
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
            scrollX={scrollX}
            onPress={onSlidePress}
          />
        ))}
      </Animated.ScrollView>

      <View style={[styles.dots, { bottom: theme.radii.card + theme.spacing.md, gap: theme.spacing.xs }]}>
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
  scrollX: SharedValue<number>;
  onPress?: (slide: BannerSlide) => void;
}

function Slide({ slide, index, width, height, scrollX, onPress }: SlideProps) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  // The texture is drawn half again as wide as the slide and drifts against
  // the swipe, so the pattern moves at a different rate from the page edge.
  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          range,
          [-width * 0.25, 0, width * 0.25],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="image"
      accessibilityLabel="Pzee"
      onPress={() => onPress?.(slide)}
      style={[styles.slide, { width, height }]}
    >
      <Animated.View style={[styles.surface, { width: width * 1.5, left: -width * 0.25, height }, driftStyle]}>
        <BannerTexture texture={slide.texture} colors={slide.colors} width={width * 1.5} height={height} />
      </Animated.View>
    </Pressable>
  );
}

function Dot({ index, width, scrollX }: { index: number; width: number; scrollX: SharedValue<number> }) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const style = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, range, [8, 24, 8], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, range, [0.45, 1, 0.45], Extrapolation.CLAMP),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  slide: { overflow: 'hidden' },
  surface: { position: 'absolute', top: 0 },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
});
