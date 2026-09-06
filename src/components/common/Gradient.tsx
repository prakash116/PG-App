import React, { useId } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface GradientStop {
  /** 0 at `start`, 1 at `end`. */
  offset: number;
  color: string;
  opacity?: number;
}

interface GradientProps {
  stops: GradientStop[];
  /** Direction as unit-square points. Default is top to bottom. */
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
}

/**
 * A linear gradient drawn with react-native-svg, which is already a dependency
 * — no extra native module for something this small. Fills its parent unless
 * given a style of its own.
 *
 * Colour and opacity are separate stops on purpose: rgba() strings are not
 * reliably parsed inside SVG stop colours on every platform, but stopOpacity
 * is.
 */
export function Gradient({ stops, start = { x: 0, y: 0 }, end = { x: 0, y: 1 }, style }: GradientProps) {
  // useId can include characters that are not valid in a url(#...) reference.
  const id = 'g' + useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <Svg pointerEvents="none" style={[StyleSheet.absoluteFill, style]} width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
          {stops.map(stop => (
            <Stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={'url(#' + id + ')'} />
    </Svg>
  );
}
