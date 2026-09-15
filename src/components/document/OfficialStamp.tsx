import React, { useMemo } from 'react';
import { REOXY_COMPANY } from '../../data/companyInfo';

type StampTheme = 'reoxy' | 'micor' | 'minimal';

interface OfficialStampProps {
  theme?: StampTheme;
  centerText?: string;
  ringTop?: string;
  ringBottom?: string;
  size?: number;
  rotation?: number;
  className?: string;
}

const THEME: Record<StampTheme, { ink: string; top: string; bottom: string }> = {
  reoxy: {
    ink: '#0a4a86',
    top: `AO РеOкси  ·  ОФИЦИАЛЬНАЯ ПЕЧАТЬ`,
    bottom: `ИНН ${REOXY_COMPANY.inn}  ·  ОГРН ${REOXY_COMPANY.ogrn}`,
  },
  micor: {
    ink: '#16325c',
    top: 'MICOR FLIGHT SERVICES',
    bottom: 'МОСКВА  ·  IATA 92-2 1894 4',
  },
  minimal: {
    ink: '#1e293b',
    top: 'OFFICIAL CERTIFICATION',
    bottom: 'VERIFIED  ·  AUTHENTIC',
  },
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

function scallopPath(cx: number, cy: number, r: number, scallops = 40, depth = 4.2) {
  const parts: string[] = [];
  for (let i = 0; i < scallops; i++) {
    const a0 = (i / scallops) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.5) / scallops) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / scallops) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const xm = cx + Math.cos(a1) * (r + depth);
    const ym = cy + Math.sin(a1) * (r + depth);
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    if (i === 0) parts.push(`M ${x0.toFixed(2)} ${y0.toFixed(2)}`);
    parts.push(`Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  return `${parts.join(' ')} Z`;
}

function starPath(cx: number, cy: number, outer: number, inner: number, points = 8) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return `${pts.join(' ')} Z`;
}

function ArcLetters({
  text,
  cx,
  cy,
  radius,
  fromDeg,
  toDeg,
  fill,
  fontSize,
  fontFamily = "Cinzel, Georgia, 'Times New Roman', serif",
}: {
  text: string;
  cx: number;
  cy: number;
  radius: number;
  fromDeg: number;
  toDeg: number;
  fill: string;
  fontSize: number;
  fontFamily?: string;
}) {
  const chars = text.split('');
  const span = chars.length <= 1 ? 0 : toDeg - fromDeg;
  return (
    <g>
      {chars.map((char, i) => {
        const t = chars.length === 1 ? 0.5 : i / (chars.length - 1);
        const deg = fromDeg + span * t;
        const { x, y } = polar(cx, cy, radius, deg);
        return (
          <text
            key={`${char}-${i}`}
            x={x}
            y={y}
            fill={fill}
            fontSize={fontSize}
            fontWeight={700}
            fontFamily={fontFamily}
            letterSpacing="0.02em"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${deg + 90} ${x} ${y})`}
          >
            {char === ' ' ? '\u00A0' : char}
          </text>
        );
      })}
    </g>
  );
}

export const OfficialStamp: React.FC<OfficialStampProps> = ({
  theme = 'minimal',
  centerText = 'VERIFIED',
  ringTop,
  ringBottom,
  size = 124,
  rotation = -13,
  className = '',
}) => {
  const palette = THEME[theme];
  const ink = palette.ink;
  const isReoxy = theme === 'reoxy';
  const top = ringTop || palette.top;
  const bottom = ringBottom || palette.bottom;
  const ringFont = isReoxy
    ? "PT Serif, 'Times New Roman', Times, serif"
    : "Cinzel, Georgia, 'Times New Roman', serif";
  const brandFont = "Cinzel, Georgia, 'Times New Roman', serif";

  const lines = useMemo(() => {
    const words = centerText.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return [words[0]];
    if (words.length === 2) return words;
    return [words[0], words.slice(1).join(' ')];
  }, [centerText]);

  const cx = 120;
  const cy = 120;

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`official-stamp pointer-events-none select-none ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        overflow: 'visible',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* Soft ink disc so paper texture shows through */}
      <circle cx={cx} cy={cy} r={112} fill={ink} fillOpacity={0.035} />

      {/* Notary scalloped rim */}
      <path
        d={scallopPath(cx, cy, 104, 42, 5)}
        fill="none"
        stroke={ink}
        strokeWidth={1.35}
        strokeOpacity={0.92}
      />
      <circle cx={cx} cy={cy} r={102} fill="none" stroke={ink} strokeWidth={2.8} />
      <circle cx={cx} cy={cy} r={96.5} fill="none" stroke={ink} strokeWidth={0.7} />

      {/* Micro dentils between rings */}
      {Array.from({ length: 72 }).map((_, i) => {
        const deg = (i / 72) * 360;
        const inner = polar(cx, cy, 91.5, deg);
        const outer = polar(cx, cy, 95.2, deg);
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={ink}
            strokeWidth={1.05}
            strokeLinecap="square"
          />
        );
      })}

      <circle cx={cx} cy={cy} r={89} fill="none" stroke={ink} strokeWidth={1.6} />

      <ArcLetters
        text={isReoxy ? top : top.toUpperCase()}
        cx={cx}
        cy={cy}
        radius={79}
        fromDeg={205}
        toDeg={335}
        fill={ink}
        fontSize={isReoxy ? 10.2 : 11.2}
        fontFamily={ringFont}
      />
      <ArcLetters
        text={isReoxy ? bottom : bottom.toUpperCase()}
        cx={cx}
        cy={cy}
        radius={79}
        fromDeg={152}
        toDeg={28}
        fill={ink}
        fontSize={isReoxy ? 8.6 : 10.4}
        fontFamily={ringFont}
      />

      {/* Inner medallion */}
      <circle cx={cx} cy={cy} r={57} fill="none" stroke={ink} strokeWidth={2.1} />
      <circle cx={cx} cy={cy} r={53.5} fill="none" stroke={ink} strokeWidth={0.65} />

      <path
        d={starPath(cx, 90, 8.2, 3.5, 8)}
        fill={ink}
        fillOpacity={0.95}
      />

      <text
        x={cx}
        y={lines.length > 1 ? 112 : 118}
        textAnchor="middle"
        fill={ink}
        fontFamily={isReoxy ? ringFont : brandFont}
        fontWeight={800}
        fontSize={isReoxy ? 16 : (lines[0].length > 8 ? 12 : 15)}
        letterSpacing={isReoxy ? '0.08em' : '0.16em'}
      >
        {isReoxy ? lines[0] : lines[0].toUpperCase()}
      </text>
      {lines[1] && (
        <text
          x={cx}
          y={128}
          textAnchor="middle"
          fill={ink}
          fontFamily={isReoxy ? ringFont : brandFont}
          fontWeight={700}
          fontSize={lines[1].length > 10 ? 9 : 11}
          letterSpacing="0.12em"
        >
          {isReoxy ? lines[1] : lines[1].toUpperCase()}
        </text>
      )}

      <line x1={98} y1={isReoxy ? 136 : 140} x2={142} y2={isReoxy ? 136 : 140} stroke={ink} strokeWidth={1} />
      <text
        x={cx}
        y={isReoxy ? 150 : 154}
        textAnchor="middle"
        fill={ink}
        fontFamily={ringFont}
        fontWeight={700}
        fontSize={isReoxy ? 8.5 : 9}
        letterSpacing={isReoxy ? '0.12em' : '0.34em'}
      >
        {isReoxy ? 'г. Москва' : '2026'}
      </text>
    </svg>
  );
};
