"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { products } from "@/lib/data";

export function ProductsSection() {
  const featured = products.filter((p) => p.featured);

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Our Products"
          title="Everything You Need for Arizona Outdoor Living"
          description="From storage sheds to pergolas, patio covers, and custom metal fabrication — all engineered for the desert."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={product.href}
                className="group block overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-600/20 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 font-display text-xl font-bold text-white">
                    {product.title}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-navy-600">
                    {product.shortDescription}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-600 transition-colors group-hover:text-arizona-copper">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-navy-600 px-8 py-4 font-semibold text-navy-600 transition-all hover:bg-navy-600 hover:text-white"
          >
            View All Products & Services
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
