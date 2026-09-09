import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Phone } from "lucide-react";
import { Button } from "@/components/Button";
import { CTABanner } from "@/components/CTABanner";
import { products, company } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.title,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);

  if (!product) notFound();

  const related = products.filter((p) => p.id !== slug && p.featured).slice(0, 3);

  return (
    <div className="pt-24">
      <section className="relative">
        <div className="relative h-[40vh] min-h-[320px] md:h-[50vh]">
          <Image src={product.image} alt={product.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="mx-auto max-w-7xl">
              <Link
                href="/products"
                className="mb-4 inline-flex items-center gap-1 text-sm text-mist-200 hover:text-arizona-gold"
              >
                <ArrowLeft className="h-4 w-4" />
                All Products
              </Link>
              <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
                {product.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="text-lg leading-relaxed text-navy-600">{product.description}</p>

              <h2 className="mt-10 font-display text-2xl font-bold text-navy-900">
                Key Features
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 rounded-xl border border-sand-200 bg-sand-50 p-4"
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
                    <span className="text-navy-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm lg:sticky lg:top-28 lg:self-start">
              <h3 className="font-display text-xl font-bold text-navy-900">
                Get a Free Quote
              </h3>
              <p className="mt-2 text-sm text-navy-600">
                Tell us about your project and we&apos;ll respond with clear pricing.
              </p>
              <Button href={`/quote?product=${product.id}`} className="mt-6 w-full">
                Request Quote
              </Button>
              <a
                href={company.phoneHref}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-navy-600 hover:text-arizona-copper"
              >
                <Phone className="h-4 w-4" />
                Or call {company.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-sand-200 bg-sand-50 py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="mb-8 font-display text-2xl font-bold text-navy-900">
              Related Products
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={p.href}
                  className="group overflow-hidden rounded-xl border border-sand-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-40">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-navy-900">{p.title}</h3>
                    <p className="mt-1 text-sm text-navy-500 line-clamp-2">
                      {p.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </div>
  );
}
