"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { safeAuthRedirect } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";

type AuthMode = "login" | "signup";

const fieldClass =
  "w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20";

export function AuthForm({ mode, nextPath }: { mode: AuthMode; nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        try {
          await fetch("/api/emails/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name: fullName }),
          });
        } catch {
          // Account creation still succeeded if the confirmation email fails.
        }

        if (!data.session) {
          setNotice(
            "Account created. Check your email for a confirmation, then sign in.",
          );
          return;
        }

        router.push(safeAuthRedirect(email, nextPath));
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(safeAuthRedirect(email, nextPath));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "signup" && (
        <>
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-navy-700">
              Full name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-navy-700">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={fieldClass}
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-700">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy-700">
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-arizona-red/20 bg-arizona-red/5 px-4 py-3 text-sm text-arizona-red">
          {error}
        </p>
      )}

      {notice && (
        <p className="rounded-xl border border-sage-400/30 bg-sage-400/10 px-4 py-3 text-sm text-navy-700">
          {notice}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="h-5 w-5 animate-spin" />}
        {mode === "signup" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-navy-600">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-navy-800 hover:text-navy-600">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to United Aluminum?{" "}
            <Link href="/signup" className="font-semibold text-navy-800 hover:text-navy-600">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
