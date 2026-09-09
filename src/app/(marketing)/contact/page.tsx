import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { company } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with United Aluminum. Visit our Phoenix showroom or contact us by phone, email, or our online form.",
};

export default function ContactPage() {
  return (
    <div className="pt-24">
      <section className="relative bg-navy-950 py-16 md:py-24">
        <div className="arizona-stripe absolute left-0 right-0 bottom-0" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-arizona-gold">
            Contact Us
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            How Can We Help You?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-200">
            Whether you&apos;re a homeowner or contractor, our team is ready to help you find
            the right aluminum solution for your project.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-navy-900">Visit Our Showroom</h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start gap-3 text-navy-600">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-navy-600" />
                  <span>
                    {company.address}
                    <br />
                    {company.city}, {company.state} {company.zip}
                  </span>
                </li>
                <li>
                  <a
                    href={company.phoneHref}
                    className="flex items-center gap-3 text-navy-600 transition-colors hover:text-navy-800"
                  >
                    <Phone className="h-5 w-5 shrink-0 text-arizona-gold" />
                    {company.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-3 text-navy-600 transition-colors hover:text-navy-800"
                  >
                    <Mail className="h-5 w-5 shrink-0 text-arizona-gold" />
                    {company.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-navy-600">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-arizona-gold" />
                  <span>
                    {company.hours.weekday}
                    <br />
                    {company.hours.saturday}
                  </span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-sand-200 shadow-sm ring-1 ring-navy-600/10">
              <iframe
                title="United Aluminum location"
                src="https://maps.google.com/maps?q=2229+W+Indian+School+Rd,+Phoenix,+AZ+85015&output=embed"
                className="h-64 w-full border-0 md:h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="rounded-2xl bg-sand-100 p-6">
              <h3 className="font-display text-lg font-bold text-navy-900">Service Area</h3>
              <p className="mt-2 text-sm text-navy-600">
                Proudly serving the greater Phoenix metro area:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {company.serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-navy-600/10 bg-white px-3 py-1 text-sm font-medium text-navy-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
