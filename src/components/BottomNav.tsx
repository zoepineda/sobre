"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoAnimated from "@/components/LogoAnimated";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: "lni-home-2" },
  { href: "/activity", label: "Activity", icon: "lni-notebook-1" },
  { href: "/add", label: "Add", icon: "lni-plus" },
  { href: "/card", label: "Card", icon: "lni-credit-card-multiple" },
  { href: "/settings", label: "Setup", icon: "lni-gear-1" },
];

// Bottom tab bar on mobile; fixed left sidebar on desktop.
export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 border-t border-black/10 bg-card/95 backdrop-blur lg:inset-x-auto lg:left-0 lg:top-0 lg:bottom-0 lg:w-60 lg:border-t-0 lg:border-r">
      <div className="mx-auto grid max-w-md grid-cols-5 lg:flex lg:max-w-none lg:flex-col lg:gap-1 lg:p-4">
        <p className="hidden px-3 pb-4 pt-4 lg:block">
          <LogoAnimated size={30} className="text-lg" />
        </p>
        {tabs.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          const isAdd = t.href === "/add";
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px]",
                "lg:flex-row lg:gap-3 lg:rounded-md lg:px-3 lg:py-2 lg:text-sm",
                active
                  ? "text-primary font-semibold lg:bg-secondary"
                  : "text-muted-foreground lg:hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  isAdd
                    ? "flex h-14 w-14 -mt-4 items-center justify-center rounded-full bg-primary text-white text-2xl shadow-lg lg:mt-0 lg:h-6 lg:w-6 lg:text-sm lg:shadow-none"
                    : "flex h-5 items-center justify-center text-base lg:w-6"
                )}
              >
                <i className={cn("lni", t.icon)} aria-hidden />
              </span>
              <span className={isAdd ? "sr-only lg:not-sr-only" : undefined}>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
