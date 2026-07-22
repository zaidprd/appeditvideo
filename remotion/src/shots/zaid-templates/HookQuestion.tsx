// =============================================================================
// Shot — HookQuestion
// 3-second portrait hook. Full-screen statement card with a question and an
// indigo underline accent on the keyword. Calm fade + rise entrance, soft
// fade out at the end so it cuts cleanly back to the talking head.
// Portrait 1080x1920 @ 30fps. To swap the hook, edit HOOK + KEYWORD below —
// KEYWORD must appear literally in HOOK (case-insensitive substring match).
// =============================================================================
import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'HookQuestion',
  durationInSeconds: 3.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const HOOK = 'JBL Wave 200TWS — masih worth it di 2024?';
const KEYWORD = 'worth it';

const HookQuestion: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow fade-in (f0 -> f12)
  const ebOp = interpolate(frame, [0, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ebY = interpolate(frame, [0, 12], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Question rise + fade (f6 -> f28)
  const qOp = interpolate(frame, [6, 28], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const qY = interpolate(frame, [6, 28], [28, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Underline draws under the keyword (f34 -> f58)
  const underlineW = interpolate(frame, [34, 58], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Soft fade-out (f75 -> f89)
  const fadeOut = interpolate(frame, [75, 89], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  // Split the question around the keyword so we can underline just that span.
  // The keyword is rendered as its own <span> with a positioned underline.
  const lc = HOOK.toLowerCase();
  const kIdx = lc.indexOf(KEYWORD.toLowerCase());
  const before = kIdx >= 0 ? HOOK.slice(0, kIdx) : HOOK;
  const match = kIdx >= 0 ? HOOK.slice(kIdx, kIdx + KEYWORD.length) : '';
  const after = kIdx >= 0 ? HOOK.slice(kIdx + KEYWORD.length) : '';

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, opacity: fadeOut }}>
      {/* dark ink background */}
      <AbsoluteFill style={{ backgroundColor: COLORS.d900 }} />
      {/* subtle indigo glow */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(900px 600px at 50% 38%, rgba(99,102,241,0.18), transparent 65%)',
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 96px',
        }}
      >
        {/* Mono eyebrow */}
        <div
          style={{
            opacity: ebOp,
            transform: `translateY(${ebY}px)`,
            fontFamily: FONT_MONO,
            fontSize: 26,
            letterSpacing: 4,
            color: COLORS.signal,
            fontWeight: 600,
            marginBottom: 56,
          }}
        >
          QUESTION
        </div>

        {/* The question */}
        <h1
          style={{
            opacity: qOp,
            transform: `translateY(${qY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1.15,
            color: '#ffffff',
            textAlign: 'center',
            margin: 0,
            letterSpacing: -1,
          }}
        >
          {before}
          {match && (
            <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
              {match}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -10,
                  height: 8,
                  borderRadius: 4,
                  background: COLORS.accent,
                  transform: `scaleX(${underlineW})`,
                  transformOrigin: 'left center',
                }}
              />
            </span>
          )}
          {after}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default HookQuestion;