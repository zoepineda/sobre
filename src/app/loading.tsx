import { LogoMark } from "@/components/Logo";

// Streams instantly on navigation while the page's queries run.
export default function Loading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="animate-pulse">
        <LogoMark size={44} />
      </div>
    </div>
  );
}
