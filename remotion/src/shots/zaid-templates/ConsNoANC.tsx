import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { X } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

export const compositionConfig = {
  id: 'ConsNoANC',
  durationInSeconds: 3.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const LABEL = 'CONS';
const HEADLINE = 'TANPA ANC';
const SUBTITLE = 'Suara luar masih terdengar di tempat ramai';
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

const ConsNoANC: React.FC = () => {
  const frame = useCurrentFrame();
  const labelOpacity = interpolate(frame, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const labelY = interpolate(frame, [0, 14], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const contentOpacity = interpolate(frame, [6, 26], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const contentY = interpolate(frame, [6, 26], [36, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const fadeOut = interpolate(frame, [75, 89], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, background: COLORS.d900, opacity: fadeOut }}>
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 96,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 22px',
          border: `1px solid ${COLORS.danger}`,
          borderRadius: RADIUS.pill,
          boxShadow: SHADOW.soft,
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        <X size={28} color={COLORS.danger} strokeWidth={3} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, letterSpacing: 4, color: COLORS.danger }}>
          {LABEL}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 550,
          left: 96,
          right: 96,
          opacity: contentOpacity,
          transform: `translateY(${contentY}px)`,
        }}
      >
        <h1
          style={{
            margin: 0,
            maxWidth: 900,
            fontFamily: FONT_DISPLAY,
            fontSize: 132,
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: -4,
            color: COLORS.paper,
          }}
        >
          {HEADLINE}
        </h1>
        <p
          style={{
            margin: '42px 0 0',
            maxWidth: 820,
            fontFamily: FONT_BODY,
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.4,
            color: COLORS.d400,
          }}
        >
          {SUBTITLE}
        </p>
      </div>

      {/* Bottom 30% intentionally left empty for the product image composite. */}
    </AbsoluteFill>
  );
};

export default ConsNoANC;
