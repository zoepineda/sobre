"use client";

import { usePathname } from "next/navigation";

// The app frame reserves room for the desktop sidebar and caps content
// width. Public pages (landing, login) have no nav, so they get the full
// viewport and center themselves.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare =
    pathname.startsWith("/welcome") || pathname.startsWith("/login");
  if (bare) return <div className="min-h-dvh">{children}</div>;
  return (
    <div className="min-h-dvh pb-24 lg:pb-10 lg:pl-60">
      <div className="mx-auto max-w-md lg:max-w-5xl">{children}</div>
    </div>
  );
}
