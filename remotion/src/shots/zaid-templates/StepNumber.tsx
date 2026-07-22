// =============================================================================
// Shot — StepNumber
// 3-second numbered tutorial step. Two-column layout: big indigo number on
// the left, step title + description on the right. Progress dots row at the
// bottom shows where we are in the sequence.
// Portrait 1080x1920 @ 30fps. THIS FILE IS STEP 1 OF 3.
// To render step 2 or 3, copy this file to StepNumber02.tsx / StepNumber03.tsx
// and (a) change compositionConfig.id, (b) change STEP constants below.
// Keeping it as a single zero-arg component matches the rest of the kit and
// lets gen-registry pick it up without any prop wiring.
// =============================================================================
import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'StepNumber',
  durationInSeconds: 3.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const STEP_NUMBER = 1;
const STEP_TOTAL = 3;
const STEP_TITLE = 'Pairing';
const STEP_DESCRIPTION = 'Buka casing, tahan tombol sampai LED berkedip biru.';

const StepNumber: React.FC = () => {
  const frame = useCurrentFrame();

  // Number scales up + fades in (f0 -> f22)
  const numOp = interpolate(frame, [0, 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const numScale = interpolate(frame, [0, 28], [0.88, 1], {
    ...CLAMP,
    easing: EASINGS.overshoot,
  });

  // Title rises + fades (f14 -> f34)
  const titleOp = interpolate(frame, [14, 34], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const titleY = interpolate(frame, [14, 34], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Description rises + fades (f26 -> f46)
  const descOp = interpolate(frame, [26, 46], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const descY = interpolate(frame, [26, 46], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Progress dots (f40 -> f60)
  const dotsOp = interpolate(frame, [40, 60], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Soft fade-out (f75 -> f89)
  const fadeOut = interpolate(frame, [75, 89], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <AbsoluteFill style={{ backgroundColor: COLORS.d900 }} />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(900px 600px at 50% 45%, rgba(99,102,241,0.14), transparent 65%)',
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 56,
            width: '100%',
            maxWidth: 920,
          }}
        >
          {/* Big number */}
          <div
            style={{
              opacity: numOp,
              transform: `scale(${numScale})`,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 280,
              lineHeight: 1,
              color: COLORS.accent,
              letterSpacing: -6,
              flexShrink: 0,
            }}
          >
            {STEP_NUMBER}
          </div>

          {/* Step info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            <div
              style={{
                opacity: titleOp,
                transform: `translateY(${titleY}px)`,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 64,
                lineHeight: 1.05,
                color: COLORS.d300,
                letterSpacing: -1,
              }}
            >
              {STEP_TITLE}
            </div>
            <div
              style={{
                opacity: descOp,
                transform: `translateY(${descY}px)`,
                fontFamily: FONT_BODY,
                fontWeight: 400,
                fontSize: 36,
                lineHeight: 1.3,
                color: COLORS.d400,
              }}
            >
              {STEP_DESCRIPTION}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            display: 'flex',
            gap: 14,
            opacity: dotsOp,
          }}
        >
          {Array.from({ length: STEP_TOTAL }).map((_, i) => {
            const active = i + 1 === STEP_NUMBER;
            return (
              <div
                key={i}
                style={{
                  width: active ? 36 : 14,
                  height: 14,
                  borderRadius: RADIUS.pill,
                  background: active ? COLORS.accent : COLORS.d600,
                }}
              />
            );
          })}
        </div>

        {/* Small mono "STEP N OF M" label */}
        <div
          style={{
            position: 'absolute',
            top: 140,
            left: 80,
            fontFamily: FONT_MONO,
            fontSize: 24,
            letterSpacing: 3,
            color: COLORS.signal,
            fontWeight: 600,
            opacity: numOp,
          }}
        >
          STEP {STEP_NUMBER} / {STEP_TOTAL}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default StepNumber;