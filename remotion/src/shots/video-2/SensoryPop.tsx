import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 2 — SensoryPop ("ENAK BANGET")
// Master span 3.50–5.50s. Cue "enak banget" @ 4.57–5.37s.
// Big word with check-mark + tagline. Landscape 848x478 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'SensoryPop',
  durationInSeconds: 2.0,
  fps: 30,
  width: 848,
  height: 478,
};

const SensoryPop: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow
  const ebOp = interpolate(frame, [0, 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Word reveal: "enak" first, "banget" second
  const enakOp = interpolate(frame, [8, 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const enakY = interpolate(frame, [8, 18], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const bangetOp = interpolate(frame, [20, 30], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const bangetY = interpolate(frame, [20, 30], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Check icon pop after "banget" lands
  const checkOp = interpolate(frame, [30, 36], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const checkScale = interpolate(frame, [30, 40], [0, 1.15], { ...CLAMP, easing: EASINGS.overshoot });

  // Tagline
  const tagOp = interpolate(frame, [38, 48], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const tagY = interpolate(frame, [38, 48], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Fade out
  const fadeOut = interpolate(frame, [54, 60], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <BrandBg glow={COLORS.signal} />

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
            fontFamily: FONT_MONO,
            fontSize: 14,
            letterSpacing: 3,
            color: COLORS.signal,
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          RASA NYA?
        </div>

        {/* Big two-word reveal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              opacity: enakOp,
              transform: `translateY(${enakY}px)`,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 96,
              color: COLORS.ink,
              lineHeight: 1.0,
              letterSpacing: -2,
            }}
          >
            enak
          </span>
          <span
            style={{
              opacity: bangetOp,
              transform: `translateY(${bangetY}px)`,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 96,
              color: COLORS.accent,
              lineHeight: 1.0,
              letterHeight: 1.0,
              letterSpacing: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            banget
            <span
              style={{
                opacity: checkOp,
                transform: `scale(${checkScale})`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: COLORS.signal,
                boxShadow: `0 4px 16px ${COLORS.signal}55`,
                marginBottom: 8,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            fontSize: 22,
            color: COLORS.muted,
            textAlign: 'center',
          }}
        >
          halusnya kerasa, rasanya nampol
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default SensoryPop;