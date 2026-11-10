import type { Format } from "@/lib/types";

/**
 * Placeholder artwork drawn from a product's colour palette.
 * Replace with real photography once the shop supplies images.
 */

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function Bloom({ x, y, r, fill, core }: { x: number; y: number; r: number; fill: string; core: string }) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g transform={`translate(${x} ${y})`}>
      {petals.map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.55} rx={r * 0.42} ry={r * 0.62} fill={fill} transform={`rotate(${a})`} opacity={0.92} />
      ))}
      <circle r={r * 0.34} fill={core} />
    </g>
  );
}

function Leaf({ x, y, angle, fill }: { x: number; y: number; angle: number; fill: string }) {
  return (
    <path d="M0 0 C 14 -22, 14 -52, 0 -70 C -14 -52, -14 -22, 0 0 Z" fill={fill} transform={`translate(${x} ${y}) rotate(${angle})`} />
  );
}

const BLOOMS: [number, number, number][] = [
  [200, 150, 46], [140, 175, 40], [260, 175, 40], [170, 110, 36],
  [232, 108, 36], [200, 205, 38], [115, 125, 28], [286, 125, 28],
];

export function ProductArt({ id, palette, format, className }: { id: string; palette: string[]; format: Format; className?: string }) {
  const [a, b, c, green] = palette;
  const rand = seeded(id);
  const fills = [a, b, c];

  let body: React.ReactNode;
  if (format === "cake") {
    body = (
      <g>
        <ellipse cx={200} cy={318} rx={130} ry={14} fill="#00000014" />
        <rect x={90} y={300} width={220} height={12} rx={6} fill="#ffffff" stroke="#00000018" />
        <rect x={110} y={210} width={180} height={92} rx={12} fill={a} />
        <path d="M110 232 q15 26 30 0 q15 30 30 0 q15 22 30 0 q15 30 30 0 q15 26 30 0 q15 22 30 0 V222 a12 12 0 0 0 -12 -12 H122 a12 12 0 0 0 -12 12 Z" fill={b} />
        <rect x={110} y={262} width={180} height={8} fill={b} opacity={0.6} />
        <Bloom x={170} y={196} r={20} fill={c} core={d(palette)} />
        <Bloom x={205} y={186} r={26} fill={d(palette)} core={c} />
        <Bloom x={240} y={198} r={18} fill={c} core={d(palette)} />
        <Leaf x={150} y={206} angle={-70} fill="#8FA88C" />
        <Leaf x={258} y={206} angle={70} fill="#8FA88C" />
      </g>
    );
  } else if (format === "gift") {
    body = (
      <g>
        <ellipse cx={200} cy={322} rx={120} ry={12} fill="#00000014" />
        <rect x={110} y={190} width={180} height={130} rx={10} fill={a} />
        <rect x={100} y={165} width={200} height={40} rx={8} fill={b} />
        <rect x={188} y={165} width={24} height={155} fill={c} />
        <path d="M200 165 C 160 110, 120 150, 200 165 C 240 110, 280 150, 200 165 Z" fill={d(palette)} />
      </g>
    );
  } else {
    const container =
      format === "box" ? (
        <g>
          <path d="M112 230 H288 L276 322 a10 10 0 0 1 -10 8 H134 a10 10 0 0 1 -10 -8 Z" fill="#ffffff" stroke="#00000014" />
          <rect x={112} y={226} width={176} height={16} rx={6} fill={b} />
        </g>
      ) : format === "vase" ? (
        <path d="M160 228 H240 C 236 262, 262 282, 250 322 a12 12 0 0 1 -12 8 H162 a12 12 0 0 1 -12 -8 C 138 282, 164 262, 160 228 Z" fill="#DDEBEA" stroke="#9fc1bd" opacity={0.9} />
      ) : format === "bag" ? (
        <g>
          <path d="M165 232 C 165 196, 235 196, 235 232" fill="none" stroke={b} strokeWidth={6} />
          <path d="M122 232 H278 L268 328 H132 Z" fill="#ffffff" stroke="#00000014" />
          <rect x={122} y={232} width={156} height={14} fill={b} opacity={0.7} />
        </g>
      ) : (
        <g>
          <path d="M120 215 L200 340 L280 215 Z" fill="#ffffff" stroke="#00000012" />
          <path d="M150 215 L200 340 L250 215 Z" fill={c} opacity={0.55} />
          <path d="M176 292 H224" stroke={b} strokeWidth={8} strokeLinecap="round" />
        </g>
      );
    body = (
      <g>
        <ellipse cx={200} cy={336} rx={110} ry={10} fill="#00000012" />
        {[-58, -30, 0, 30, 58].map((angle, i) => (
          <Leaf key={i} x={200 + angle * 1.4} y={205} angle={angle} fill={green} />
        ))}
        {container}
        {BLOOMS.map(([x, y, r], i) => {
          const fill = fills[Math.floor(rand() * fills.length)];
          const core = fill === c ? b : c;
          return <Bloom key={i} x={x + (rand() - 0.5) * 10} y={y + (rand() - 0.5) * 10} r={r} fill={fill} core={core} />;
        })}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width={400} height={400} fill={c} opacity={0.28} />
      <circle cx={200} cy={190} r={170} fill="#ffffff" opacity={0.55} />
      {body}
    </svg>
  );
}

const d = (palette: string[]) => palette[3];
