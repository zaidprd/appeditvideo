// =============================================================================
// Shot — ProductSpec
// 4-second portrait product spec sheet. Cream background, mono "SPEC" eyebrow,
// product name + subtitle, then 4 spec cards that rise + fade in one by one.
// Portrait 1080x1920 @ 30fps. To retarget, edit PRODUCT + SPECS.
// =============================================================================
import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'ProductSpec',
  durationInSeconds: 4.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const PRODUCT = 'JBL Wave 200TWS';
const SUBTITLE = 'Spesifikasi singkat';
const SPECS = [
  { value: '20 jam', label: 'battery total' },
  { value: 'JBL', label: 'signature bass' },
  { value: 'BT 5.3', label: 'stable connection' },
  { value: 'IPX2', label: 'splash proof' },
];

const ProductSpec: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow (f0 -> f12)
  const ebOp = interpolate(frame, [0, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ebY = interpolate(frame, [0, 12], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Title (f8 -> f28)
  const titleOp = interpolate(frame, [8, 28], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const titleY = interpolate(frame, [8, 28], [22, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Subtitle (f20 -> f36)
  const subOp = interpolate(frame, [20, 36], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const subY = interpolate(frame, [20, 36], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Soft fade-out (f108 -> f119)
  const fadeOut = interpolate(frame, [108, 119], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      {/* cream background + subtle indigo glow */}
      <AbsoluteFill style={{ backgroundColor: COLORS.cream }} />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(900px 600px at 50% 0%, rgba(99,102,241,0.10), transparent 60%)',
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '160px 80px 0',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: ebOp,
            transform: `translateY(${ebY}px)`,
            fontFamily: FONT_MONO,
            fontSize: 26,
            letterSpacing: 4,
            color: COLORS.signal,
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          SPEC
        </div>

        {/* Title */}
        <h1
          style={{
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1.1,
            color: COLORS.ink,
            margin: 0,
            letterSpacing: -1,
            marginBottom: 14,
          }}
        >
          {PRODUCT}
        </h1>

        {/* Subtitle */}
        <div
          style={{
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontFamily: FONT_BODY,
            fontWeight: 400,
            fontSize: 30,
            color: COLORS.muted,
            marginBottom: 56,
          }}
        >
          {SUBTITLE}
        </div>

        {/* Spec cards (staggered rise + fade) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
          {SPECS.map((s, i) => {
            const start = 32 + i * 10;
            const op = interpolate(frame, [start, start + 16], [0, 1], {
              ...CLAMP,
              easing: EASINGS.easeOut,
            });
            const y = interpolate(frame, [start, start + 16], [18, 0], {
              ...CLAMP,
              easing: EASINGS.easeOut,
            });
            return (
              <div
                key={s.label}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                  background: COLORS.paper,
                  border: `1.5px solid ${COLORS.line}`,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  padding: '26px 32px',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 46,
                    color: COLORS.accent,
                    letterSpacing: -0.5,
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 500,
                    fontSize: 28,
                    color: COLORS.ink,
                    textAlign: 'right',
                    flex: 1,
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ProductSpec;