import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your United Aluminum customer account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (data?.claims) {
    redirect(params.next === "/admin" && isAdminEmail(email) ? "/admin" : "/account");
  }

  return (
    <div className="pt-24">
      <section className="relative bg-navy-950 py-16 md:py-24">
        <div className="arizona-stripe absolute bottom-0 left-0 right-0" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-arizona-gold">
            Customer Account
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Welcome Back
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-200">
            Sign in to manage your United Aluminum account.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-md px-4 md:px-6">
          <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
            {params.error === "auth" && (
              <p className="mb-5 rounded-xl border border-arizona-red/20 bg-arizona-red/5 px-4 py-3 text-sm text-arizona-red">
                We could not complete that sign-in. Please try again.
              </p>
            )}
            <AuthForm mode="login" nextPath={params.next} />
          </div>
        </div>
      </section>
    </div>
  );
}
