import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { WhyAluminum } from "@/components/WhyAluminum";
import { ShedConfigurator } from "@/components/ShedConfigurator";
import { ProductsSection } from "@/components/ProductsSection";
import { Gallery } from "@/components/Gallery";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CTABanner } from "@/components/CTABanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <WhyAluminum />
      <ShedConfigurator />
      <ProductsSection />
      <Gallery />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </>
  );
}
