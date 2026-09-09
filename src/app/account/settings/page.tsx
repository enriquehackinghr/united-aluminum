import type { Metadata } from "next";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your United Aluminum customer account details.",
};

export default async function AccountSettingsPage() {
  const { displayName, profile, user } = await requireAccount();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-arizona-copper">
          Account
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-950">Profile</h1>
        <p className="mt-2 text-navy-600">
          These details are used when you request quotes from the inventory catalog.
        </p>
      </div>

      <section className="max-w-xl rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy-950">Contact details</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Name</dt>
            <dd className="mt-1 text-navy-900">{profile?.full_name || displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Email</dt>
            <dd className="mt-1 text-navy-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Phone</dt>
            <dd className="mt-1 text-navy-900">{profile?.phone || "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
