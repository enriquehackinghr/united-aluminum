"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { formatLineTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/inventory";
import { Button } from "../Button";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

export function CartView() {
  const { items, ready, subtotal, updateQuantity, removeItem } = useCart();
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white px-6 py-16 text-center text-sm text-navy-600">
        Loading your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-navy-300" />
        <p className="mt-3 font-display text-lg font-bold text-navy-900">Your cart is empty</p>
        <p className="mt-1 text-sm text-navy-600">Add quantities from the inventory catalog to get started.</p>
        <Button href="/account/inventory" size="sm" className="mt-6">
          Browse inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
        <div className="hidden md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-navy-950 text-xs uppercase tracking-wider text-mist-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((line) => (
                <tr key={line.sku} className="border-t border-sand-100">
                  <td className="px-4 py-4">
                    <p className="font-medium text-navy-900">{line.name}</p>
                    <p className="mt-0.5 text-xs text-navy-500">
                      {line.category} · SKU {line.sku}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-navy-900">{formatPrice(line.price)}</td>
                  <td className="px-4 py-4">
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      onChange={(quantity) => updateQuantity(line.sku, quantity)}
                      ariaLabel={`Quantity for ${line.name}`}
                    />
                  </td>
                  <td className="px-4 py-4 font-semibold text-navy-900">{formatLineTotal(line)}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(line.sku)}
                      className="rounded-lg p-2 text-navy-500 hover:bg-sand-100 hover:text-arizona-red"
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {items.map((line) => (
            <article key={line.sku} className="rounded-xl border border-sand-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy-900">{line.name}</p>
                  <p className="mt-0.5 text-xs text-navy-500">
                    {line.category} · SKU {line.sku}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.sku)}
                  className="rounded-lg p-2 text-navy-500 hover:bg-sand-100 hover:text-arizona-red"
                  aria-label={`Remove ${line.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  onChange={(quantity) => updateQuantity(line.sku, quantity)}
                  ariaLabel={`Quantity for ${line.name}`}
                />
                <div className="text-right">
                  <p className="text-xs text-navy-500">{formatPrice(line.price)} each</p>
                  <p className="font-semibold text-navy-900">{formatLineTotal(line)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy-950">Order summary</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-navy-600">Items</span>
          <span className="font-medium text-navy-900">{items.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-navy-600">Subtotal</span>
          <span className="font-display text-2xl font-bold text-navy-950">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-navy-500">
          Tax and shipping will be calculated at checkout when Stripe is connected.
        </p>
        {checkoutNotice && (
          <p className="mt-4 rounded-xl border border-arizona-gold/40 bg-arizona-gold/10 px-4 py-3 text-sm text-navy-800">
            Complete Purchase will open Stripe checkout next. Your cart is saved.
          </p>
        )}
        <button
          type="button"
          onClick={() => setCheckoutNotice(true)}
          className="mt-5 w-full rounded-xl bg-arizona-gold px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-arizona-gold/90"
        >
          Complete Purchase
        </button>
        <Link
          href="/account/inventory"
          className="mt-3 inline-flex w-full justify-center text-sm font-semibold text-navy-800 hover:text-navy-600"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
