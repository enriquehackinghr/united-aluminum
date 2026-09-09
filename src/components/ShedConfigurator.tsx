"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "./Button";
import { SectionHeading } from "./SectionHeading";
import { shedColors, shedSizes } from "@/lib/data";

export function ShedConfigurator() {
  const [selectedSize, setSelectedSize] = useState(shedSizes[1].size);
  const [selectedColor, setSelectedColor] = useState(shedColors[0].hex);

  const colorName = shedColors.find((c) => c.hex === selectedColor)?.name ?? "Custom";

  return (
    <section id="configurator" className="desert-section py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Design Your Shed"
          title="Configure Your Perfect Storage Solution"
          description="Choose your size and color — then request a free quote. We'll handle customization for HOA requirements and tricky spaces."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-sand-200"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative flex min-h-[320px] items-center justify-center bg-gradient-to-br from-sand-100 via-sand-200 to-adobe-400/30 p-8 lg:min-h-[480px]">
              <div
                className="relative h-48 w-64 rounded-lg shadow-2xl ring-1 ring-navy-600/10 transition-colors duration-500 md:h-56 md:w-80"
                style={{ backgroundColor: selectedColor }}
              >
                <div
                  className="absolute -right-2 top-1/2 h-16 w-2 -translate-y-1/2 rounded-r-sm bg-black/10 md:h-20 md:w-3"
                  aria-hidden
                />
                <div
                  className="absolute bottom-0 left-1/2 h-24 w-14 -translate-x-1/2 rounded-t-sm border-2 border-black/10 bg-black/5 md:h-28 md:w-16"
                  aria-hidden
                />
              </div>
              <div className="absolute bottom-6 left-6 rounded-xl border border-navy-600/10 bg-white/95 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm text-navy-500">Your selection</p>
                <p className="font-display text-lg font-bold text-navy-900">
                  {selectedSize} · {colorName}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="mb-8">
                <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">
                  Select Size
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {shedSizes.map((size) => (
                    <button
                      key={size.size}
                      type="button"
                      onClick={() => setSelectedSize(size.size)}
                      className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all ${
                        selectedSize === size.size
                          ? "border-navy-600 bg-navy-600/10 text-navy-700"
                          : "border-sand-200 text-navy-600 hover:border-sand-400"
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">
                  Select Color
                </h3>
                <div className="flex gap-3">
                  {shedColors.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      className={`group relative h-12 w-12 rounded-full border-2 transition-all ${
                        selectedColor === color.hex
                          ? "border-navy-600 ring-2 ring-arizona-gold/50"
                          : "border-sand-300 hover:border-sand-400"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                    >
                      {selectedColor === color.hex && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-navy-800" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-navy-500">{colorName}</p>
              </div>

              <ul className="mb-8 space-y-2">
                {[
                  "Installation included",
                  "20-year baked enamel warranty",
                  "HOA customization available",
                  "Free delivery in metro Phoenix",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-navy-600">
                    <Check className="h-4 w-4 shrink-0 text-sage-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                href={`/quote?size=${encodeURIComponent(selectedSize)}&color=${encodeURIComponent(colorName)}`}
                size="lg"
                className="w-full sm:w-auto"
              >
                Get Quote for This Configuration
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
