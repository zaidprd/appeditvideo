import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// Shot 2 — PlatformReveal
// Master span 9.20–12.20s. Cue "konten.com" first mention @ 9.89s.
// Browser chrome with URL bar typing + 3 feature pills.
// Portrait 1280x2276 @ 30fps.
// =============================================================================
export const compositionConfig = {
  id: 'PlatformReveal',
  durationInSeconds: 3.0,
  fps: 30,
  width: 1280,
  height: 2276,
};

const URL = 'konten.com';
const FEATURES = [
  { label: 'Auto-connect akun', at: 50 },
  { label: 'Tanpa form ribet', at: 60 },
  { label: 'Langsung cair', at: 70 },
];

const PlatformReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Browser shell + tagline appearance
  const shellOp = interpolate(frame, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const shellY = interpolate(frame, [0, 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // URL typing animation (start @ f18, end ~f42)
  const typeStart = 18;
  const typeEnd = typeStart + URL.length * 3;
  const typedChars = Math.floor(
    interpolate(frame, [typeStart, typeEnd], [0, URL.length], {
      ...CLAMP,
      easing: EASINGS.easeInOut,
    })
  );
  const typed = URL.slice(0, typedChars);
  const cursorOn = Math.floor(frame / 10) % 2 === 0 && typedChars < URL.length;

  // Tagline below the browser
  const tagOp = interpolate(frame, [40, 52], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const tagY = interpolate(frame, [40, 52], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Fade out for clean cut back
  const fadeOut = interpolate(frame, [82, 90], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  // Browser dimensions (portrait-friendly)
  const BW = 1120; // browser width
  const BH = 760;  // browser height

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <BrandBg glow={COLORS.signal} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        {/* Eyebrow tag */}
        <div
          style={{
            opacity: shellOp,
            transform: `translateY(${shellY}px)`,
            fontFamily: FONT_MONO,
            fontSize: 26,
            letterSpacing: 4,
            color: COLORS.signal,
            fontWeight: 600,
            marginBottom: 40,
          }}
        >
          PLATFORM BARU
        </div>

        {/* Browser chrome */}
        <div
          style={{
            opacity: shellOp,
            transform: `translateY(${shellY}px)`,
            width: BW,
            background: COLORS.paper,
            borderRadius: RADIUS.card,
            border: `1px solid ${COLORS.line}`,
            boxShadow: SHADOW.card,
            overflow: 'hidden',
            marginBottom: 60,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '18px 22px',
              background: COLORS.cream,
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff6058' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#28c941' }} />
          </div>

          {/* URL bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '22px 28px',
              background: COLORS.paper,
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${COLORS.muted}`,
              }}
            />
            <div
              style={{
                flex: 1,
                background: COLORS.cream,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 8,
                padding: '14px 22px',
                fontFamily: FONT_MONO,
                fontSize: 28,
                color: COLORS.ink,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: COLORS.muted }}>https://</span>
              <span style={{ fontWeight: 600 }}>{typed}</span>
              {cursorOn && (
                <span style={{ color: COLORS.accent, fontWeight: 400 }}>▌</span>
              )}
            </div>
          </div>

          {/* Page body placeholder */}
          <div
            style={{
              height: 360,
              padding: '50px 60px',
              background: `linear-gradient(160deg, ${COLORS.cream}, ${COLORS.paper})`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 22,
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 72,
                color: COLORS.ink,
                lineHeight: 1.0,
              }}
            >
              konten<span style={{ color: COLORS.accent }}>.</span>com
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 26,
                color: COLORS.muted,
                lineHeight: 1.5,
              }}
            >
              Platform untuk Klipper cari cuan.
              <br />
              Auto-connect ke akun kamu.
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 50,
            color: COLORS.ink,
            textAlign: 'center',
            marginBottom: 60,
          }}
        >
          Platform untuk Klipper cari cuan
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          {FEATURES.map((f, i) => {
            const op = interpolate(frame, [f.at, f.at + 12], [0, 1], {
              ...CLAMP,
              easing: EASINGS.easeOut,
            });
            const y = interpolate(frame, [f.at, f.at + 12], [18, 0], {
              ...CLAMP,
              easing: EASINGS.easeOut,
            });
            return (
              <div
                key={f.label}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: COLORS.paper,
                  border: `1.5px solid ${COLORS.line}`,
                  borderRadius: RADIUS.pill,
                  padding: '16px 32px',
                  boxShadow: SHADOW.soft,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: COLORS.signal,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={18} color="#fff" strokeWidth={3.4} />
                </div>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                    fontSize: 30,
                    color: COLORS.ink,
                  }}
                >
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default PlatformReveal;