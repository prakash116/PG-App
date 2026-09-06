import React, { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import type { BannerTexture as TextureKind } from '@/lib/banners';

interface BannerTextureProps {
  texture: TextureKind;
  colors: [string, string];
  width: number;
  height: number;
}

/**
 * A solid colour with a texture on it, drawn once as vectors.
 *
 * Everything is white at low opacity over a two-stop gradient of the slide's
 * colour, plus a soft highlight in the top-left so the surface has a light
 * source instead of reading as flat fill. Patterns are in user space, so the
 * dot and stripe spacing is the same on every screen density.
 */
export function BannerTexture({ texture, colors, width, height }: BannerTextureProps) {
  // useId can include characters that are not valid in a url(#...) reference.
  const key = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const base = 'base' + key;
  const glow = 'glow' + key;
  const pattern = 'pattern' + key;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={base} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
        <RadialGradient
          id={glow}
          gradientUnits="userSpaceOnUse"
          cx={width * 0.22}
          cy={height * 0.12}
          rx={width * 0.55}
          ry={height * 0.9}
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>

        {texture === 'dots' ? (
          <Pattern id={pattern} patternUnits="userSpaceOnUse" width="22" height="22">
            <Circle cx="11" cy="11" r="1.7" fill="#FFFFFF" fillOpacity="0.22" />
          </Pattern>
        ) : null}
        {texture === 'stripes' ? (
          <Pattern id={pattern} patternUnits="userSpaceOnUse" width="18" height="18">
            <Line
              x1="0"
              y1="18"
              x2="18"
              y2="0"
              stroke="#FFFFFF"
              strokeOpacity="0.14"
              strokeWidth="1.5"
            />
          </Pattern>
        ) : null}
      </Defs>

      <Rect x="0" y="0" width={width} height={height} fill={'url(#' + base + ')'} />

      {texture === 'rings'
        ? [1, 2, 3, 4, 5, 6].map(step => (
            <Circle
              key={step}
              cx={width * 0.82}
              cy={height * 0.9}
              r={step * Math.max(width, height) * 0.11}
              stroke="#FFFFFF"
              strokeOpacity={0.16 - step * 0.015}
              strokeWidth="1.5"
              fill="none"
            />
          ))
        : (
            <Rect x="0" y="0" width={width} height={height} fill={'url(#' + pattern + ')'} />
          )}

      <Rect x="0" y="0" width={width} height={height} fill={'url(#' + glow + ')'} />
    </Svg>
  );
}
