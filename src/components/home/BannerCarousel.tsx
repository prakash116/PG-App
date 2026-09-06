import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { BannerTexture } from './BannerTexture';
import { Gradient } from '@/components/common/Gradient';
import { Text } from '@/components/common/Text';
import { HEADER_ROW_HEIGHT } from '@/components/common/Header';
import { canRenderShadows } from '@/lib/device-tier';
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
/** Long enough for a programmatic page scroll to finish on a slow device. */
const SETTLE_MS = 500;
/** The warm ink the website's hero gradients are built from. */
const INK = '#1C1714';

/**
 * Full-bleed brand surface that starts at the very top of the screen — the
 * transparent header floats over it.
 *
 * Loops: the track is [last, ...slides, first], so swiping past either end
 * lands on a clone, and the moment that scroll settles the view jumps —
 * without animation — to the real slide at the same picture. The user never
 * sees the seam. Auto-advance pauses while a finger is down and resumes from
 * wherever it left off.
 *
 * The parallax is clipped to the banner's own box. Letting it overflow was
 * how it tore through the listings below on scroll.
 */
export function BannerCarousel({ slides, height, scrollY, onSlidePress }: BannerCarouselProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const loop = slides.length > 1;
  const track = useMemo(
    () => (loop ? [slides[slides.length - 1], ...slides, slides[0]] : slides),
    [loop, slides],
  );
  const firstPosition = loop ? 1 : 0;
  const lastPosition = loop ? slides.length : slides.length - 1;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(firstPosition * width);
  const positionRef = useRef(firstPosition);
  const initialised = useRef(false);
  const [paused, setPaused] = useState(false);

  const jumpTo = useCallback(
    (position: number) => {
      scrollRef.current?.scrollTo({ x: position * width, animated: false });
      // Set directly so the dots do not flash the clone's state for a frame
      // before the scroll event catches up.
      scrollX.value = position * width;
      positionRef.current = position;
    },
    [scrollRef, scrollX, width],
  );

  /** Called whenever a scroll comes to rest: folds a clone back onto its slide. */
  const settle = useCallback(
    (offsetX: number) => {
      const position = Math.round(offsetX / width);
      if (loop && position === 0) {
        jumpTo(lastPosition);
      } else if (loop && position === lastPosition + 1) {
        jumpTo(firstPosition);
      } else {
        positionRef.current = position;
      }
      setPaused(false);
    },
    [firstPosition, jumpTo, lastPosition, loop, width],
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

  // Start on the first real slide, not its clone. Done when the content has a
  // size, since a scrollTo before that is silently dropped.
  const onContentSizeChange = useCallback(() => {
    if (loop && !initialised.current) {
      initialised.current = true;
      jumpTo(firstPosition);
    }
  }, [firstPosition, jumpTo, loop]);

  useEffect(() => {
    if (paused || !loop) {
      return;
    }
    const timer = setInterval(() => {
      const next = positionRef.current + 1;
      positionRef.current = next;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      // Android does not always report momentum end for a programmatic
      // scroll, so the wrap from the trailing clone is also done here once
      // the animation has had time to finish.
      if (next === lastPosition + 1) {
        setTimeout(() => {
          if (positionRef.current === lastPosition + 1) {
            settle(next * width);
          }
        }, SETTLE_MS);
      }
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [lastPosition, loop, paused, scrollRef, settle, width]);

  const parallaxStyle = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    // Rise at under half the list's speed. Only ever downward inside the
    // clipped box; anything more shows through the seam or the lip.
    return { transform: [{ translateY: y > 0 ? y * 0.45 : 0 }] };
  });

  return (
    <View style={[styles.clip, { height, backgroundColor: theme.colors.accent }]}>
      <Animated.View style={[{ height }, parallaxStyle]}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
        >
          {track.map((slide, position) => (
            <Slide
              key={slide.id + ':' + position}
              slide={slide}
              position={position}
              width={width}
              height={height}
              scrollX={scrollX}
              onPress={onSlidePress}
            />
          ))}
        </Animated.ScrollView>

        <View style={[styles.dots, { bottom: theme.radii.card + theme.spacing.md, gap: theme.spacing.xs }]}>
          {slides.map((slide, index) => (
            <Dot
              key={slide.id}
              centers={dotCenters(index, slides.length, firstPosition, lastPosition, loop, width)}
              width={width}
              scrollX={scrollX}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

/** Offsets at which dot `index` is the active one — its slide, plus the clone
 *  of that slide at the far end of the track when looping. */
function dotCenters(
  index: number,
  count: number,
  firstPosition: number,
  lastPosition: number,
  loop: boolean,
  width: number,
): number[] {
  const centers = [(index + firstPosition) * width];
  if (loop && index === 0) {
    centers.push((lastPosition + 1) * width);
  }
  if (loop && index === count - 1) {
    centers.push(0);
  }
  return centers;
}

interface SlideProps {
  slide: BannerSlide;
  /** Index in the track, clones included, so ranges line up with offsets. */
  position: number;
  width: number;
  height: number;
  scrollX: SharedValue<number>;
  onPress?: (slide: BannerSlide) => void;
}

function Slide({ slide, position, width, height, scrollX, onPress }: SlideProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const range = [(position - 1) * width, position * width, (position + 1) * width];

  // Three layers at three rates against the swipe — texture furthest, copy
  // nearer, the photo nearest — which is what makes the slide feel deep.
  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, range, [-width * 0.25, 0, width * 0.25], Extrapolation.CLAMP) },
    ],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(scrollX.value, range, [width * 0.1, 0, -width * 0.1], Extrapolation.CLAMP) },
    ],
  }));

  const photoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(scrollX.value, range, [width * 0.18, 0, -width * 0.18], Extrapolation.CLAMP) },
    ],
  }));

  // Copy and photo sit in the band between the header row and the dots.
  const bodyTop = insets.top + HEADER_ROW_HEIGHT;
  const bottomClear = theme.radii.card + theme.spacing.xxxl;
  const photoWidth = Math.round(width * 0.36);
  const photoHeight = Math.round((height - bodyTop - bottomClear) * 0.92);
  const copyMaxWidth = slide.imageUrl
    ? width - photoWidth - theme.spacing.xl * 3
    : width - theme.spacing.xl * 2;

  const cardFrame = {
    right: theme.spacing.xl,
    bottom: bottomClear,
    width: photoWidth,
    height: photoHeight,
    borderRadius: theme.radii.xl,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={slide.title || 'Pzee'}
      onPress={() => onPress?.(slide)}
      style={[styles.slide, { width, height }]}
    >
      <Animated.View style={[styles.surface, { width: width * 1.5, left: -width * 0.25, height }, driftStyle]}>
        <BannerTexture texture={slide.texture} colors={slide.colors} width={width * 1.5} height={height} />
      </Animated.View>

      {/* Keeps white status-bar icons legible on the lightest slide. */}
      <Gradient
        stops={[
          { offset: 0, color: INK, opacity: 0.22 },
          { offset: 1, color: INK, opacity: 0 },
        ]}
        style={{ bottom: undefined, height: bodyTop + 24 }}
      />
      {/* And white copy legible at the bottom, where the highlight can reach. */}
      <Gradient
        stops={[
          { offset: 0, color: INK, opacity: 0 },
          { offset: 1, color: INK, opacity: 0.3 },
        ]}
        style={{ top: height * 0.5 }}
      />

      {slide.imageUrl ? (
        <Animated.View style={[styles.photoLayer, photoStyle]}>
          {/* A second, empty card behind the photo: two cards read as a stack
              of pictures, one card reads as a screenshot pasted on. */}
          <View style={[styles.stackCard, cardFrame]} />
          <View style={[styles.photoCard, cardFrame, canRenderShadows ? theme.shadows.card : null]}>
            <Image source={{ uri: slide.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </View>
        </Animated.View>
      ) : null}

      {slide.title ? (
        <Animated.View
          style={[styles.copy, { left: theme.spacing.xl, bottom: bottomClear, maxWidth: copyMaxWidth }, copyStyle]}
        >
          <Text variant="title2" style={styles.white} numberOfLines={2}>
            {slide.title}
          </Text>
          {slide.subtitle ? (
            <Text variant="callout" style={styles.whiteMuted} numberOfLines={2}>
              {slide.subtitle}
            </Text>
          ) : null}
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

function Dot({ centers, width, scrollX }: { centers: number[]; width: number; scrollX: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    // Distance, in pages, from the nearest offset at which this dot is active.
    let distance = 1;
    for (let i = 0; i < centers.length; i += 1) {
      distance = Math.min(distance, Math.abs(scrollX.value - centers[i]) / width);
    }
    return {
      width: interpolate(distance, [0, 1], [24, 8], Extrapolation.CLAMP),
      opacity: interpolate(distance, [0, 1], [1, 0.45], Extrapolation.CLAMP),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  slide: { overflow: 'hidden' },
  surface: { position: 'absolute', top: 0 },
  photoLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  stackCard: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '4deg' }, { translateX: 8 }, { translateY: 6 }],
  },
  photoCard: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.78)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ rotate: '-5deg' }],
  },
  copy: { position: 'absolute' },
  white: { color: '#FFFFFF' },
  whiteMuted: { color: 'rgba(255, 255, 255, 0.82)', marginTop: 4 },
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
