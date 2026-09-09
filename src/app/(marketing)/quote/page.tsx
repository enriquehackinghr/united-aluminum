import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Request a free quote for aluminum storage sheds, pergolas, patio covers, and building products from United Aluminum.",
};

type SearchParams = Promise<{ product?: string; size?: string; color?: string; sku?: string }>;

export default async function QuotePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <div className="pt-24">
      <section className="relative bg-navy-950 py-16 md:py-24">
        <div className="arizona-stripe absolute left-0 right-0 bottom-0" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-arizona-gold">
            Free Quote
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Start Your Project Today
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-200">
            Installation included with every shed. 20-year warranty. Family-owned since 1968.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm
              defaultProduct={params.product ?? ""}
              defaultSize={params.size ?? ""}
              defaultColor={params.color ?? ""}
              defaultSku={params.sku ?? ""}
              title="Get Your Free Quote"
              description="Tell us about your project and we'll respond quickly with clear pricing and next steps."
            />
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-28 rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
              <h3 className="font-display text-xl font-bold text-navy-900">
                What to Expect
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Response within one business day",
                  "Clear, transparent pricing",
                  "Free on-site consultation available",
                  "Installation scheduling included",
                  "HOA compliance assistance",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-navy-600">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
