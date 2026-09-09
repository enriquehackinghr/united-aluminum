"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "./Button";
import { company } from "@/lib/data";

export function CTABanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-8 py-16 text-center md:px-16 md:py-20"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-arizona-gold blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-arizona-red blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-adobe-400 blur-3xl" />
          </div>

          <div className="arizona-stripe absolute left-0 right-0 top-0" aria-hidden />

          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Ready to Beat the Heat?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-200">
              Get a free quote on your custom aluminum shed, pergola, or patio cover.
              Installation included. Family-owned since {company.founded}.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href="/quote" size="lg">
                Get Your Free Quote
              </Button>
              <a
                href={company.phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-arizona-gold/40 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-arizona-gold/10"
              >
                <Phone className="h-5 w-5" />
                {company.phone}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
