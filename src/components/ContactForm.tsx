"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "./Button";
import { products } from "@/lib/data";

type ContactFormProps = {
  defaultProduct?: string;
  defaultSize?: string;
  defaultColor?: string;
  defaultSku?: string;
  title?: string;
  description?: string;
};

export function ContactForm({
  defaultProduct = "",
  defaultSize = "",
  defaultColor = "",
  defaultSku = "",
  title = "Send Us a Message",
  description = "Fill out the form below and a member of our team will get back to you promptly.",
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-sage-400/30 bg-sage-400/10 p-12 text-center">
        <CheckCircle className="mb-4 h-12 w-12 text-sage-500" />
        <h3 className="font-display text-2xl font-bold text-navy-900">Message Sent!</h3>
        <p className="mt-2 text-navy-600">
          Thank you for reaching out. We&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">{title}</h2>
      <p className="mt-2 text-navy-600">{description}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-navy-700">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-navy-700">
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-navy-700">
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="product" className="mb-1.5 block text-sm font-medium text-navy-700">
            Product Interest
          </label>
          <select
            id="product"
            name="product"
            defaultValue={defaultProduct}
            className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
            {defaultProduct &&
              !products.some((p) => p.id === defaultProduct) &&
              defaultProduct !== "other" && (
                <option value={defaultProduct}>{defaultProduct}</option>
              )}
            <option value="other">Other / Not Sure</option>
          </select>
        </div>

        {defaultSku && (
          <div>
            <label htmlFor="sku" className="mb-1.5 block text-sm font-medium text-navy-700">
              Catalog SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              defaultValue={defaultSku}
              readOnly
              className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-navy-900"
            />
          </div>
        )}

        {(defaultSize || defaultColor) && (
          <div className="grid gap-5 sm:grid-cols-2">
            {defaultSize && (
              <div>
                <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-navy-700">
                  Shed Size
                </label>
                <input
                  id="size"
                  name="size"
                  type="text"
                  defaultValue={defaultSize}
                  readOnly
                  className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-navy-900"
                />
              </div>
            )}
            {defaultColor && (
              <div>
                <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-navy-700">
                  Shed Color
                </label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  defaultValue={defaultColor}
                  readOnly
                  className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-navy-900"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-navy-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full resize-none rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 outline-none transition-colors focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            placeholder="Tell us about your project..."
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-navy-600">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-sand-300 text-navy-600 focus:ring-navy-600"
          />
          <span>
            I agree to the Terms of Service and Privacy Policy. By providing my phone number,
            I agree to receive text messages from United Aluminum.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Send className="h-5 w-5" />
          Submit
        </Button>
      </form>
    </div>
  );
}
