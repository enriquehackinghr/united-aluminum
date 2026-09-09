import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { company, navLinks, products } from "@/lib/data";

export function Footer() {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <footer className="bg-navy-950 text-mist-300">
      <div className="arizona-stripe" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-600 ring-2 ring-arizona-gold/80">
                <span className="font-display text-lg font-bold text-arizona-gold">UA</span>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">United Aluminum</p>
                <p className="text-xs text-mist-400">Arizona · Since {company.founded}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Arizona&apos;s trusted supplier of aluminum storage sheds, pergolas, patio covers,
              and building materials — built to beat the desert heat.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">
              Products
            </h3>
            <ul className="space-y-2">
              {featuredProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={product.href}
                    className="text-sm transition-colors hover:text-arizona-gold"
                  >
                    {product.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-sm font-medium text-arizona-gold hover:text-arizona-gold/80">
                  View all products →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-arizona-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/quote" className="text-sm transition-colors hover:text-arizona-gold">
                  Get a Quote
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm transition-colors hover:text-arizona-gold">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm transition-colors hover:text-arizona-gold">
                  Create account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={company.phoneHref}
                  className="flex items-start gap-3 transition-colors hover:text-arizona-gold"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-start gap-3 transition-colors hover:text-arizona-gold"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {company.address}
                  <br />
                  {company.city}, {company.state} {company.zip}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {company.hours.weekday}
                  <br />
                  {company.hours.saturday}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-mist-400">
            © {new Date().getFullYear()} United Aluminum, Inc. All rights reserved.
          </p>
          <p className="text-sm text-mist-400">
            Serving {company.serviceAreas.join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
