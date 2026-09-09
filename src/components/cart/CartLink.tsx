"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartLink({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { itemCount, ready } = useCart();
  const count = ready ? itemCount : 0;

  return (
    <Link
      href="/account/cart"
      onClick={onNavigate}
      className={
        compact
          ? "flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-mist-200 hover:bg-white/5 hover:text-arizona-gold"
          : "relative inline-flex items-center rounded-lg px-3 py-2 text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
      }
      aria-label={count ? `Cart, ${count} items` : "Cart"}
    >
      <span className="inline-flex items-center gap-2">
        <ShoppingCart className={compact ? "h-5 w-5" : "h-5 w-5"} />
        {compact && <span>Cart</span>}
      </span>
      {count > 0 && (
        <span
          className={
            compact
              ? "rounded-full bg-arizona-gold px-2 py-0.5 text-xs font-bold text-navy-900"
              : "absolute -right-1 -top-1 min-w-5 rounded-full bg-arizona-gold px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-navy-900"
          }
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
