import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Products & Services",
  description:
    "Explore United Aluminum's full range of aluminum storage sheds, pergolas, patio covers, screen rooms, and building materials.",
};

export default function ProductsPage() {
  return (
    <div className="pt-24">
      <section className="relative bg-navy-950 py-16 md:py-24">
        <div className="arizona-stripe absolute left-0 right-0 bottom-0" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Products & Services"
            title="Aluminum Solutions for Every Project"
            description="From backyard storage to commercial fabrication — all built to withstand Arizona's desert climate."
            dark
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8">
            {products.map((product, i) => (
              <div
                key={product.id}
                className={`grid items-center gap-8 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[direction:rtl]" : ""
                }`}
              >
                <div className={`relative h-64 md:h-80 ${i % 2 === 1 ? "md:[direction:ltr]" : ""}`}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className={`p-8 md:p-10 ${i % 2 === 1 ? "md:[direction:ltr]" : ""}`}>
                  <h2 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">
                    {product.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-navy-600">{product.description}</p>
                  <ul className="mt-4 space-y-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-navy-600">
                        <Check className="h-4 w-4 shrink-0 text-sage-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={product.href}
                    className="mt-6 inline-flex items-center gap-1 font-semibold text-navy-600 hover:text-arizona-copper"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button href="/quote" size="lg">
              Request a Free Quote
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
