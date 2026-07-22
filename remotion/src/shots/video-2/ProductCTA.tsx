import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { ArrowRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 3 — ProductCTA ("blender portable ini")
// Master span 5.80–7.80s. Cue "blender portable ini" @ 6.57–7.59s.
// Product call-out card with name + price-style hook + arrow CTA.
// Landscape 848x478 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'ProductCTA',
  durationInSeconds: 2.0,
  fps: 30,
  width: 848,
  height: 478,
};

const ProductCTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Product card slide in from right
  const cardOp = interpolate(frame, [0, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const cardX = interpolate(frame, [0, 12], [40, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Eyebrow line
  const ebOp = interpolate(frame, [8, 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // Big "BLENDER PORTABLE" reveal
  const titleOp = interpolate(frame, [16, 26], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const titleY = interpolate(frame, [16, 26], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Sub copy "ini"
  const subOp = interpolate(frame, [28, 36], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // CTA pill
  const ctaOp = interpolate(frame, [36, 46], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ctaX = interpolate(frame, [36, 46], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Arrow nudge at end
  const arrowX = interpolate(frame, [46, 56], [0, 6], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent2} />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 50px',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: ebOp,
            fontFamily: FONT_MONO,
            fontSize: 14,
            letterSpacing: 4,
            color: COLORS.accent2,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          KALIAN HARUS COBA
        </div>

        {/* Big product name */}
        <div
          style={{
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 70,
              color: COLORS.ink,
              lineHeight: 1.0,
              letterSpacing: -2,
            }}
          >
            BLENDER
          </span>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 70,
              color: COLORS.accent,
              lineHeight: 1.0,
              letterSpacing: -2,
            }}
          >
            PORTABLE
          </span>
        </div>

        {/* Sub */}
        <div
          style={{
            opacity: subOp,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 28,
            color: COLORS.muted,
            marginBottom: 24,
            fontStyle: 'italic',
          }}
        >
          ini.
        </div>

        {/* CTA pill */}
        <div
          style={{
            opacity: ctaOp,
            transform: `translateX(${ctaX}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: COLORS.accent,
            color: '#fff',
            borderRadius: RADIUS.pill,
            padding: '12px 26px',
            boxShadow: SHADOW.card,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            Coba sekarang
          </span>
          <span
            style={{
              transform: `translateX(${arrowX}px)`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowRight size={18} color="#fff" strokeWidth={2.8} />
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ProductCTA;