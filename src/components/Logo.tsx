// Sobre — "envelope" in Tagalog. V2 mark: a wobbly hand-drawn envelope with
// eyes peeking over the rim, chunky ink strokes, amber tile.

const INK = "#1a1d24";
const EYE_FILL = "#f6f6f4";
const TILE = "#ffb80a";
const SW = 3.2;

function Eye({ cx }: { cx: number }) {
  const cy = 19;
  const r = 5.5;
  const pr = r * 0.62;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={EYE_FILL} stroke={INK} strokeWidth={SW} />
      <circle cx={cx - 1.2} cy={cy + 0.8} r={pr} fill={INK} />
    </g>
  );
}

export function LogoMark({
  size = 28,
  tile = true,
}: {
  size?: number;
  tile?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {tile && <rect width="48" height="48" rx="10" fill={TILE} />}
      {/* wobbly envelope body */}
      <path
        d="M9.2 21.4 Q8.6 20.2 10 19.9 L23.2 19.4 L38.2 19.8 Q39.6 19.8 39.7 21.2 L40.2 37.4 Q40.3 39.5 38.4 39.6 L10.4 40.2 Q8.6 40.2 8.5 38.4 Z"
        fill={tile ? "none" : EYE_FILL}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* open flap */}
      <path
        d="M9.6 21.2 L24 31 L39.3 20.8"
        stroke={INK}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* peeking eyes */}
      <Eye cx={17.75} />
      <Eye cx={30.25} />
    </svg>
  );
}

export default function Logo({
  size = 28,
  wordmark = true,
  tile = true,
  className = "",
}: {
  size?: number;
  wordmark?: boolean;
  tile?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} tile={tile} />
      {wordmark && (
        <span
          className="font-heading font-black tracking-tight"
          style={{ fontSize: size * 0.72 }}
        >
          sobre
        </span>
      )}
    </span>
  );
}
