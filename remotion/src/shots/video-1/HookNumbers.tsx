import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 1 — HookNumbers
// Master span 0.30–3.60s. Cue "uang 500 juta" @ 1.45s.
// Big count-up: Rp 0 → Rp 500.000.000. Subtitle: "buat Klipper Indonesia".
// Portrait 1280x2276 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'HookNumbers',
  durationInSeconds: 3.3,
  fps: 30,
  width: 1280,
  height: 2276,
};

const TARGET = 500_000_000;
const FMT = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;

const HookNumbers: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow
  const eyebrowOp = interpolate(frame, [0, 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const eyebrowY = interpolate(frame, [0, 10], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Counter — start at f12, count to target by f70, hold to f90
  const counter = interpolate(frame, [12, 70], [0, TARGET], {
    ...CLAMP,
    easing: EASINGS.easeOut,
  });
  const counterOp = interpolate(frame, [8, 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Subtitle rises in at f72
  const subOp = interpolate(frame, [72, 84], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const subY = interpolate(frame, [72, 84], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Soft fade out before cut back to talking head
  const fadeOut = interpolate(frame, [90, 99], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  // Decorative chip pulse behind the number
  const pulseScale = interpolate(frame, [12, 28, 60, 80], [0.6, 1.0, 1.04, 1.0], { ...CLAMP });
  const pulseOp = interpolate(frame, [8, 18], [0, 0.18], { ...CLAMP });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <BrandBg glow={COLORS.accent} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        {/* Eyebrow tag */}
        <div
          style={{
            opacity: eyebrowOp,
            transform: `translateY(${eyebrowY}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: `${COLORS.accent}16`,
            border: `1px solid ${COLORS.accent}44`,
            borderRadius: RADIUS.pill,
            padding: '14px 28px',
            marginBottom: 70,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: COLORS.accent,
              boxShadow: `0 0 12px ${COLORS.accent}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              letterSpacing: 3,
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            TOTAL HADIAH
          </span>
        </div>

        {/* Pulse halo behind number */}
        <div
          style={{
            position: 'absolute',
            width: 1080,
            height: 1080,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)`,
            transform: `scale(${pulseScale})`,
            opacity: pulseOp,
            filter: 'blur(40px)',
          }}
        />

        {/* Big counter */}
        <div
          style={{
            opacity: counterOp,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 132,
            lineHeight: 1.0,
            color: COLORS.ink,
            letterSpacing: -2,
            textAlign: 'center',
            marginBottom: 50,
            textShadow: '0 4px 24px rgba(99,102,241,0.18)',
          }}
        >
          {FMT(counter)}
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 56,
            color: COLORS.muted,
            textAlign: 'center',
          }}
        >
          buat Klipper Indonesia
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default HookNumbers;