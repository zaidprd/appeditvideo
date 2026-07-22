import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 1 — SpeedText ("BEBERAPA DETIK")
// Master span 0.50–2.50s. Cue "beberapa detik" @ 0.53–1.19s.
// Big count-up counter: "0 → 5 detik", pulsing. Landscape 848x478 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'SpeedText',
  durationInSeconds: 2.0,
  fps: 30,
  width: 848,
  height: 478,
};

const SpeedText: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow fade
  const ebOp = interpolate(frame, [0, 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ebY = interpolate(frame, [0, 8], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Counter 0 -> 5 from f6 to f36
  const counter = Math.round(interpolate(frame, [6, 36], [0, 5], { ...CLAMP, easing: EASINGS.easeOut }));
  const counterOp = interpolate(frame, [4, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const counterScale = interpolate(frame, [6, 14], [0.88, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // Pulse on the final digit
  const pulse = interpolate(frame, [36, 44, 56], [1, 1.06, 1], { ...CLAMP });

  // Fade out before cut back
  const fadeOut = interpolate(frame, [54, 60], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <BrandBg glow={COLORS.accent} />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: ebOp,
            transform: `translateY(${ebY}px)`,
            fontFamily: FONT_MONO,
            fontSize: 14,
            letterSpacing: 3,
            color: COLORS.accent,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          CUMA BUTUH
        </div>

        {/* Big counter */}
        <div
          style={{
            opacity: counterOp,
            transform: `scale(${counterScale * pulse})`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 110,
            lineHeight: 1.0,
            color: COLORS.ink,
            letterSpacing: -2,
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
          }}
        >
          <span>{counter}</span>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              color: COLORS.muted,
            }}
          >
            detik
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default SpeedText;