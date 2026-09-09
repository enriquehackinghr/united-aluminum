import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a United Aluminum customer account to request quotes and save your details.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) {
    redirect("/account");
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
            Create Your Account
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-200">
            Save your details for faster quotes on sheds, pergolas, and patio covers.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-md px-4 md:px-6">
          <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
            <AuthForm mode="signup" />
          </div>
        </div>
      </section>
    </div>
  );
}
