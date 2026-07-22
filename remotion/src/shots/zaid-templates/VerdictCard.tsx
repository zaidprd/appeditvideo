// =============================================================================
// Shot — VerdictCard
// 4-second portrait closing card. Pros / cons in two columns with a tagline
// fade-in at the end. Cream background, calm tone — affiliate call-to-action
// without being shouty.
// Portrait 1080x1920 @ 30fps. To retarget, edit VERDICT_TITLE, PLUS, MINUS,
// and TAGLINE.
// =============================================================================
import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Check, X } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'VerdictCard',
  durationInSeconds: 4.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const VERDICT_TITLE = 'Worth it?';
const PLUS = [
  'Bass mantap untuk harganya',
  'Baterai awet 20 jam',
  'Koneksi Bluetooth stabil',
];
const MINUS = [
  'Noise cancelling tidak ada',
  'Mic telpon standar',
];
const TAGLINE = 'Cek harga di keranjang kuning';

const VerdictCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Eyebrow (f0 -> f12)
  const ebOp = interpolate(frame, [0, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ebY = interpolate(frame, [0, 12], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Title (f8 -> f26)
  const titleOp = interpolate(frame, [8, 26], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const titleY = interpolate(frame, [8, 26], [22, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Plus column rises from the left (f28 -> f46)
  const plusOp = interpolate(frame, [28, 46], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const plusX = interpolate(frame, [28, 46], [-30, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Minus column rises from the right (f36 -> f54)
  const minusOp = interpolate(frame, [36, 54], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const minusX = interpolate(frame, [36, 54], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Tagline fade-in near the end (f90 -> f108)
  const tagOp = interpolate(frame, [90, 108], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const tagY = interpolate(frame, [90, 108], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // Soft fade-out (f110 -> f119)
  const fadeOut = interpolate(frame, [110, 119], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: fadeOut }}>
      <AbsoluteFill style={{ backgroundColor: COLORS.cream }} />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(900px 700px at 50% 0%, rgba(99,102,241,0.10), transparent 60%)',
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '160px 80px 0',
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
            marginBottom: 26,
          }}
        >
          VERDICT
        </div>

        {/* Title */}
        <h1
          style={{
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1.05,
            color: COLORS.ink,
            margin: 0,
            letterSpacing: -2,
            marginBottom: 56,
          }}
        >
          {VERDICT_TITLE}
        </h1>

        {/* Two columns */}
        <div style={{ display: 'flex', gap: 24, width: '100%' }}>
          <Column
            header="Plus"
            headerColor={COLORS.signal}
            items={PLUS}
            op={plusOp}
            x={plusX}
            baseStart={46}
            stagger={5}
          />
          <Column
            header="Minus"
            headerColor={COLORS.danger}
            items={MINUS}
            op={minusOp}
            x={minusX}
            baseStart={54}
            stagger={5}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            position: 'absolute',
            bottom: 160,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT_BODY,
            fontSize: 30,
            fontStyle: 'italic',
            color: COLORS.muted,
            padding: '0 80px',
          }}
        >
          {TAGLINE}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Single column helper — renders a header chip and a card with bullet points.
type ColumnProps = {
  header: string;
  headerColor: string;
  items: string[];
  op: number;
  x: number;
  baseStart: number;
  stagger: number;
};

const Column: React.FC<ColumnProps> = ({
  header,
  headerColor,
  items,
  op,
  x,
  baseStart,
  stagger,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: op,
        transform: `translateX(${x}px)`,
        flex: 1,
        background: COLORS.paper,
        border: `1.5px solid ${COLORS.line}`,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 8,
          fontFamily: FONT_MONO,
          fontSize: 22,
          letterSpacing: 2,
          fontWeight: 700,
          color: headerColor,
          marginBottom: 4,
        }}
      >
        {header === 'Plus' ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
        {header.toUpperCase()}
      </div>
      {items.map((it, i) => {
        const start = baseStart + i * stagger;
        const itemOp = interpolate(frame, [start, start + 12], [0, 1], {
          ...CLAMP,
          easing: EASINGS.easeOut,
        });
        const itemY = interpolate(frame, [start, start + 12], [10, 0], {
          ...CLAMP,
          easing: EASINGS.easeOut,
        });
        return (
          <div
            key={it}
            style={{
              opacity: itemOp,
              transform: `translateY(${itemY}px)`,
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.25,
              color: COLORS.ink,
            }}
          >
            {it}
          </div>
        );
      })}
    </div>
  );
};

export default VerdictCard;