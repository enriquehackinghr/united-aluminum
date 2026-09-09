import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InventoryDashboard } from "@/components/InventoryDashboard";
import { isAdminEmail } from "@/lib/admin";
import { getEmailLogs } from "@/lib/email-log";
import { toCatalogItem } from "@/lib/inventory";
import { getInventoryUpload } from "@/lib/inventory-server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Upload and manage United Aluminum inventory.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/account");
  }

  const [itemsResult, lastUpload, emailLogs] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
    getInventoryUpload(),
    getEmailLogs(),
  ]);

  const importedItems = itemsResult.error ? [] : (itemsResult.data ?? []).map((row) => toCatalogItem(row));

  return (
    <div className="pt-24">
      <section className="relative bg-navy-950 py-16 md:py-20">
        <div className="arizona-stripe absolute bottom-0 left-0 right-0" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-arizona-gold">
            Administration
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-mist-200">
            Switch between inventory and the email log to review stock, briefings, and every message that went out.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <InventoryDashboard
            initialItems={importedItems}
            initialUpload={lastUpload}
            initialEmailLogs={emailLogs}
          />
        </div>
      </section>
    </div>
  );
}
