"use client";

import { motion } from "framer-motion";
import { Award, Shield, Sun, Truck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { benefits } from "@/lib/data";

const iconMap = {
  sun: Sun,
  shield: Shield,
  award: Award,
  truck: Truck,
};

export function WhyAluminum() {
  return (
    <section id="why-aluminum" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Why Aluminum"
          title="Built Different. Built for Arizona."
          description="While wood rots and steel bakes in the sun, aluminum reflects heat, resists corrosion, and stays beautiful for decades — with zero maintenance."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => {
            const Icon = iconMap[benefit.icon];
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl border border-sand-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-600/20 hover:shadow-xl hover:shadow-sand-300/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-600 text-arizona-gold shadow-lg shadow-navy-600/25 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-2xl bg-navy-900 p-8 md:p-12"
        >
          <div className="arizona-stripe mb-8 rounded-full" aria-hidden />
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                Aluminum vs. Wood & Steel in 115°F Heat
              </h3>
              <p className="mt-4 leading-relaxed text-mist-300">
                In Phoenix summers, your shed&apos;s material matters. Wood absorbs and
                retains heat, turning your storage into an oven. Steel radiates heat
                inward. Aluminum reflects up to 95% of radiant energy — keeping your
                belongings cooler without climate control.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { material: "Aluminum", temp: "Cool", width: "25%", color: "bg-sage-400" },
                { material: "Wood", temp: "Hot", width: "75%", color: "bg-adobe-500" },
                { material: "Steel", temp: "Very Hot", width: "90%", color: "bg-arizona-red" },
              ].map((item) => (
                <div key={item.material}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-white">{item.material}</span>
                    <span className="text-mist-400">{item.temp}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
