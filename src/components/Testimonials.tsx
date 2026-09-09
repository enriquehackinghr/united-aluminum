"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  return (
    <section id="reviews" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Customer Reviews"
          title="Trusted by Arizona Homeowners"
          description="Over five decades of delivering quality aluminum products across the Phoenix metro area."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-sand-200 bg-white p-8 shadow-sm"
            >
              <Quote className="mb-4 h-8 w-8 text-arizona-gold/40" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-arizona-gold text-arizona-gold" />
                ))}
              </div>
              <p className="leading-relaxed text-navy-600">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="mt-6 border-t border-sand-100 pt-4">
                <p className="font-semibold text-navy-900">{testimonial.name}</p>
                <p className="text-sm text-navy-500">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
