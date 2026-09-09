import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your United Aluminum order before checkout.",
};

export default async function CartPage() {
  await requireAccount();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-arizona-copper">
          Checkout
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-950">Your cart</h1>
        <p className="mt-2 max-w-2xl text-navy-600">
          Matching products are combined into a single line. Quantities can be updated here before
          you complete your purchase.
        </p>
      </div>
      <CartView />
    </div>
  );
}
