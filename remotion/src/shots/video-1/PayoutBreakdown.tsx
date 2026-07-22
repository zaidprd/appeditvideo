import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 3 — PayoutBreakdown
// Master span 31.20–34.60s. Cue "5.000 rupiah per 1.000 views" @ 32.09s.
// Big rate + animated calculator on the right.
// Portrait 1280x2276 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'PayoutBreakdown',
  durationInSeconds: 3.4,
  fps: 30,
  width: 1280,
  height: 2276,
};

const PayoutBreakdown: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow + rate reveal
  const ebOp = interpolate(frame, [0, 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ebY = interpolate(frame, [0, 10], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });

  const rateOp = interpolate(frame, [10, 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const rateScale = interpolate(frame, [10, 30], [0.92, 1], { ...CLAMP, easing: EASINGS.overshoot });

  const perOp = interpolate(frame, [26, 36], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Calculator column on the right
  const calcOp = interpolate(frame, [36, 46], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const calcX = interpolate(frame, [36, 46], [40, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Highlight bar that sweeps under the final number @ f70
  const sweep = interpolate(frame, [70, 82], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Pulse on the final number @ f80
  const pulse = interpolate(frame, [80, 90, 102], [1, 1.08, 1], { ...CLAMP });

  // Soft fade out
  const fadeOut = interpolate(frame, [95, 102], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <BrandBg glow={COLORS.signal} />

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
            opacity: ebOp,
            transform: `translateY(${ebY}px)`,
            fontFamily: FONT_MONO,
            fontSize: 26,
            letterSpacing: 4,
            color: COLORS.signal,
            fontWeight: 600,
            marginBottom: 50,
          }}
        >
          RATE PEMBAYARAN
        </div>

        {/* Big rate */}
        <div
          style={{
            opacity: rateOp,
            transform: `scale(${rateScale})`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 200,
            lineHeight: 1.0,
            color: COLORS.ink,
            textAlign: 'center',
            letterSpacing: -3,
            marginBottom: 14,
          }}
        >
          Rp&nbsp;5.000
        </div>

        {/* "per 1.000 views" */}
        <div
          style={{
            opacity: perOp,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 56,
            color: COLORS.muted,
            textAlign: 'center',
            marginBottom: 80,
          }}
        >
          per 1.000 views
        </div>

        {/* Calculator */}
        <div
          style={{
            opacity: calcOp,
            transform: `translateX(${calcX}px)`,
            width: 900,
            background: COLORS.paper,
            border: `1.5px solid ${COLORS.line}`,
            borderRadius: RADIUS.card,
            padding: '40px 50px',
            boxShadow: SHADOW.card,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: FONT_MONO,
              fontSize: 30,
              color: COLORS.muted,
            }}
          >
            <span>1.000 views</span>
            <span>×</span>
            <span>Rp 5</span>
            <span>=</span>
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              {/* Highlight sweep */}
              <span
                style={{
                  position: 'absolute',
                  left: -10,
                  right: -10,
                  bottom: 4,
                  height: 36,
                  background: `${COLORS.signal}55`,
                  borderRadius: 6,
                  transform: `scaleX(${sweep})`,
                  transformOrigin: 'left',
                  zIndex: 0,
                }}
              />
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 38,
                  color: COLORS.ink,
                  transform: `scale(${pulse})`,
                  display: 'inline-block',
                  transformOrigin: 'right center',
                }}
              >
                Rp&nbsp;5.000
              </span>
            </span>
          </div>

          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 22,
              color: COLORS.muted,
              fontStyle: 'italic',
              marginTop: 4,
            }}
          >
            per 1.000 views di konten.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default PayoutBreakdown;