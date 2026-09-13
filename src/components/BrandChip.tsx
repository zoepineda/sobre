import { CHIP_BG, brandLogo, brandMark } from "@/lib/brandLogos";
import { cardStyle } from "@/lib/cardStyles";

// Mini brand card: real logo when we have one, gradient monogram otherwise.
// Plain component — safe in both server and client trees.
export default function BrandChip({
  name,
  type,
}: {
  name: string;
  type: string;
}) {
  const hit = brandLogo(name);
  if (hit) {
    return (
      <span
        aria-hidden
        className={`flex h-6 w-10 shrink-0 items-center justify-center rounded-[5px] px-1 shadow-sm ${CHIP_BG[hit.chip]}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/brands/${hit.logo}`}
          alt=""
          className="max-h-4 max-w-full object-contain"
        />
      </span>
    );
  }
  const st = cardStyle(name, type);
  return (
    <span
      aria-hidden
      className="flex h-6 w-10 shrink-0 items-center justify-center rounded-[5px] text-[9px] font-bold tracking-wide shadow-sm"
      style={{ background: st.bg, color: st.fg }}
    >
      {brandMark(name)}
    </span>
  );
}
