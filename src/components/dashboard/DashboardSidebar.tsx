"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, PackageSearch, Shield, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/inventory", label: "Inventory catalog", icon: PackageSearch },
  { href: "/account/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account/settings", label: "Account", icon: UserRound },
];

export function DashboardSidebar({
  displayName,
  email,
  isAdmin = false,
}: {
  displayName: string;
  email?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const { itemCount, ready } = useCart();
  const cartCount = ready ? itemCount : 0;

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-sand-200 bg-white/80 lg:block">
        <div className="sticky top-[72px] flex h-[calc(100vh-72px)] flex-col px-4 py-6">
          <div className="rounded-2xl bg-navy-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-arizona-gold">
              Customer portal
            </p>
            <p className="mt-2 truncate font-display text-lg font-bold">{displayName}</p>
            {email && <p className="mt-1 truncate text-sm text-mist-300">{email}</p>}
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {(isAdmin
              ? [...links, { href: "/admin", label: "Admin dashboard", icon: Shield }]
              : links
            ).map((link) => {
              const active =
                link.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-navy-950 text-white"
                      : "text-navy-700 hover:bg-sand-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{link.label}</span>
                  {link.href === "/account/cart" && cartCount > 0 && (
                    <span className="rounded-full bg-arizona-gold px-2 py-0.5 text-[10px] font-bold text-navy-900">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-sand-100 hover:text-navy-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <nav className="border-b border-sand-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {(isAdmin
            ? [...links, { href: "/admin", label: "Admin dashboard", icon: Shield }]
            : links
          ).map((link) => {
            const active =
              link.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                  active ? "bg-navy-950 text-white" : "bg-sand-100 text-navy-700"
                }`}
              >
                {link.label}
                {link.href === "/account/cart" && cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
