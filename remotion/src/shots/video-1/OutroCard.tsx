import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { ArrowRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 4 — OutroCard
// Master span 44.70–47.00s. Cue "See you di konten.com" @ 45.25s.
// Closing card with wordmark + CTA pill.
// Portrait 1280x2276 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'OutroCard',
  durationInSeconds: 2.3,
  fps: 30,
  width: 1280,
  height: 2276,
};

const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Wordmark: word parts appear sequentially
  const part1Op = interpolate(frame, [4, 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const part1Y = interpolate(frame, [4, 16], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const part2Op = interpolate(frame, [12, 24], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const part2Y = interpolate(frame, [12, 24], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Dot accent pulse
  const dotScale = interpolate(frame, [24, 36, 60], [0, 1.4, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // Tagline
  const tagOp = interpolate(frame, [32, 44], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const tagY = interpolate(frame, [32, 44], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // CTA pill
  const ctaOp = interpolate(frame, [44, 56], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ctaY = interpolate(frame, [44, 56], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Arrow nudge at the end
  const arrowX = interpolate(frame, [56, 68], [0, 8], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: part1Op,
            transform: `translateY(${part1Y}px)`,
            fontFamily: FONT_MONO,
            fontSize: 26,
            letterSpacing: 6,
            color: COLORS.accent,
            fontWeight: 600,
            marginBottom: 50,
          }}
        >
          SEE YOU DI
        </div>

        {/* Big wordmark with accent dot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            marginBottom: 70,
          }}
        >
          <span
            style={{
              opacity: part1Op,
              transform: `translateY(${part1Y}px)`,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 200,
              color: COLORS.ink,
              lineHeight: 1.0,
              letterSpacing: -4,
            }}
          >
            konten
          </span>
          <span
            style={{
              opacity: part2Op,
              transform: `translateY(${part2Y}px)`,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 200,
              color: COLORS.ink,
              lineHeight: 1.0,
              letterSpacing: -4,
            }}
          >
            com
          </span>
          <span
            style={{
              display: 'inline-block',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: COLORS.accent,
              marginLeft: 4,
              marginBottom: 40,
              transform: `scale(${dotScale})`,
              boxShadow: `0 0 30px ${COLORS.accent}`,
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 50,
            color: COLORS.muted,
            textAlign: 'center',
            marginBottom: 80,
          }}
        >
          Cek link di video ini
        </div>

        {/* CTA pill */}
        <div
          style={{
            opacity: ctaOp,
            transform: `translateY(${ctaY}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: COLORS.accent,
            color: '#fff',
            borderRadius: RADIUS.pill,
            padding: '24px 50px',
            boxShadow: SHADOW.card,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 38,
              letterSpacing: 1,
            }}
          >
            konten.com
          </span>
          <span
            style={{
              transform: `translateX(${arrowX}px)`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowRight size={32} color="#fff" strokeWidth={2.8} />
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default OutroCard;