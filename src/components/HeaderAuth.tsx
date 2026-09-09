"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import { CartLink } from "./cart/CartLink";

export function HeaderAuth({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) {
          setUser(data.user);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return <div className={compact ? "h-10" : "h-9 w-36"} aria-hidden />;
  }

  if (user) {
    return (
      <div className={compact ? "flex flex-col gap-2" : "flex items-center gap-2"}>
        {isAdminEmail(user.email) && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={
              compact
                ? "rounded-lg px-4 py-3 text-base font-medium text-arizona-gold hover:bg-white/5"
                : "rounded-lg px-3 py-2 text-sm font-medium text-arizona-gold transition-colors hover:bg-white/5"
            }
          >
            Admin
          </Link>
        )}
        <Link
          href="/account/inventory"
          onClick={onNavigate}
          className={
            compact
              ? "rounded-lg px-4 py-3 text-base font-medium text-mist-200 hover:bg-white/5 hover:text-arizona-gold"
              : "rounded-lg px-3 py-2 text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
          }
        >
          Catalog
        </Link>
        <CartLink compact={compact} onNavigate={onNavigate} />
        <Link
          href="/account"
          onClick={onNavigate}
          className={
            compact
              ? "rounded-lg px-4 py-3 text-base font-medium text-mist-200 hover:bg-white/5 hover:text-arizona-gold"
              : "rounded-lg px-3 py-2 text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
          }
        >
          Dashboard
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            onClick={onNavigate}
            className={
              compact
                ? "w-full rounded-xl border border-white/20 px-4 py-3 text-left text-base font-medium text-mist-200 hover:bg-white/5 hover:text-arizona-gold"
                : "rounded-lg px-3 py-2 text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
            }
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={compact ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      <Link
        href="/login"
        onClick={onNavigate}
        className={
          compact
            ? "rounded-lg px-4 py-3 text-base font-medium text-mist-200 hover:bg-white/5 hover:text-arizona-gold"
            : "rounded-lg px-3 py-2 text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
        }
      >
        Sign in
      </Link>
      <Button href="/signup" size="sm" variant={compact ? "primary" : "outline"} onClick={onNavigate}>
        Sign up
      </Button>
    </div>
  );
}
