"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Star, ThermometerSun } from "lucide-react";
import { Button } from "./Button";
import { company } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-navy-950 pt-20">
      {/* Full-bleed hero image — visible on the right */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80"
          alt="Arizona desert landscape at sunset"
          fill
          className="object-cover object-[75%_center] brightness-[1.08] contrast-[1.12] saturate-[1.15] md:object-[68%_center]"
          priority
        />
        <div className="hero-overlay absolute inset-0" aria-hidden />
        <div className="hero-image-accent absolute inset-0" aria-hidden />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-4 py-16 md:px-6 lg:py-24">
        <div className="max-w-xl lg:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-arizona-gold/40 bg-navy-950/60 px-4 py-2 text-sm text-white shadow-lg shadow-navy-950/40 backdrop-blur-md"
          >
            <Star className="h-4 w-4 fill-arizona-gold text-arizona-gold" />
            Arizona family-owned since {company.founded} · BBB A+ Rated
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,8,24,0.5)] md:text-6xl lg:text-7xl"
          >
            The Coolest Sheds
            <br />
            <span className="gradient-text drop-shadow-none">in the Desert</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,8,24,0.4)] md:text-xl"
          >
            Custom aluminum storage sheds, pergolas, and patio covers engineered for
            Arizona&apos;s extreme heat. Zero maintenance. 20-year warranty. Installation
            included.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Button href="/quote" size="lg">
              Get Your Free Quote
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href="/#configurator" variant="outline" size="lg">
              Design Your Shed
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-2xl"
          >
            {[
              {
                icon: ThermometerSun,
                label: "Stays Cooler",
                desc: "Aluminum reflects heat — not absorbs it",
              },
              {
                icon: Shield,
                label: "20-Year Warranty",
                desc: "Baked enamel finish guaranteed",
              },
              {
                icon: Star,
                label: "Install Included",
                desc: "We deliver & set up your shed",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-navy-950/55 p-4 shadow-lg shadow-navy-950/30 backdrop-blur-md"
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-arizona-gold" />
                <div>
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-white/75">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
