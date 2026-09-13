"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) {
      // email confirmation is on: no session until the link is clicked
      setMode("signin");
      setNotice(
        "Almost there — check your email for the confirmation link, then come back and sign in."
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo size={40} className="text-2xl" />
        </div>
        <Card className="py-5 shadow-sm">
          <CardContent className="px-5">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {notice && (
                <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                  {notice}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy
                  ? "…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-3 w-full text-center text-xs text-primary"
            >
              {mode === "signin"
                ? "First time? Create the account"
                : "Already set up? Sign in"}
            </button>
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground">
          Every peso, spoken for.
        </p>
      </div>
    </main>
  );
}
