"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/data";

export function StatsBar() {
  return (
    <section className="relative z-10 -mt-8 mx-4 md:mx-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-sand-300 shadow-2xl ring-1 ring-navy-600/20 md:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="card-shine flex flex-col items-center bg-white px-6 py-8 text-center"
          >
            <p className="font-display text-3xl font-bold text-navy-600 md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-navy-500">{stat.label}</p>
            {i === 0 && (
              <div className="mt-2 h-0.5 w-8 rounded-full bg-arizona-gold" aria-hidden />
            )}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
