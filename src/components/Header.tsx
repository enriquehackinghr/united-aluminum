"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "./Button";
import { HeaderAuth } from "./HeaderAuth";
import { company, navLinks } from "@/lib/data";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="border-b border-white/10 bg-navy-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-navy-600 shadow-lg ring-2 ring-arizona-gold/80">
              <span className="font-display text-lg font-bold text-arizona-gold">UA</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold leading-tight text-white">
                United Aluminum
              </p>
              <p className="text-xs text-mist-300">Arizona · Since {company.founded}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={company.phoneHref}
              className="hidden items-center gap-2 text-sm font-medium text-mist-200 transition-colors hover:text-arizona-gold xl:flex"
            >
              <Phone className="h-4 w-4" />
              {company.phone}
            </a>
            <HeaderAuth />
            <Button href="/quote" size="sm">
              Get Free Quote
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <div className="arizona-stripe" aria-hidden />

      {mobileOpen && (
        <div className="border-b border-white/10 bg-navy-950/98 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-arizona-gold"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={company.phoneHref}
              className="flex items-center gap-2 px-4 py-3 text-base font-medium text-arizona-gold"
            >
              <Phone className="h-5 w-5" />
              {company.phone}
            </a>
            <HeaderAuth compact onNavigate={() => setMobileOpen(false)} />
            <Button href="/quote" className="mt-2 w-full" onClick={() => setMobileOpen(false)}>
              Get Free Quote
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
