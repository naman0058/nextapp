import { Suspense } from "react";
import { LandingHero } from "@/components/marketing/home/LandingHero";
import { SampleReportPromoBand } from "@/components/marketing/home/SampleReportPromoBand";
import { PlatformStrip } from "@/components/marketing/home/PlatformStrip";
import { FeaturedToolCard } from "@/components/marketing/home/FeaturedToolCard";
import { ToolsGrid } from "@/components/marketing/home/ToolsGrid";
import { ProcessSection } from "@/components/marketing/home/ProcessSection";
import { CapabilitiesBento } from "@/components/marketing/home/CapabilitiesBento";
import { AudiencesSection } from "@/components/marketing/home/AudiencesSection";
import { CheckCategoriesBand } from "@/components/marketing/home/CheckCategoriesBand";
import { CtaBand } from "@/components/marketing/home/CtaBand";
import { FaqAccordion } from "@/components/marketing/home/FaqAccordion";
import { LatestGuidesSection } from "@/features/blog/components/LatestGuidesSection";
import { LandingSectionHeader } from "@/components/marketing/LandingSectionHeader";
import { Container } from "@/components/ui/Container";
import { HomeGlobalJsonLd } from "@/components/seo/HomeGlobalJsonLd";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/");

export default function HomePage() {
  return (
    <>
      <HomeGlobalJsonLd />
      <LandingHero />
      <SampleReportPromoBand />
      <PlatformStrip />

      <section id="tools" className="py-16 sm:py-20 lg:py-24">
        <Container className="max-w-6xl">
          <LandingSectionHeader
            eyebrow="Product suite"
            title="Every tool you need before publish day"
            description="Live checkers for social posts, contrast, and listening preview—built for production workflows, not demos."
          />
          <div className="space-y-10">
            <FeaturedToolCard />
            <ToolsGrid />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="bg-card py-16 sm:py-20 lg:py-24">
        <Container className="max-w-6xl">
          <LandingSectionHeader
            eyebrow="Workflow"
            title="How preflight fits your publishing routine"
            description="From draft caption to platform-ready copy in four clear steps."
          />
          <ProcessSection />
        </Container>
      </section>

      <CheckCategoriesBand />

      <section id="capabilities" className="py-16 sm:py-20 lg:py-24">
        <Container className="max-w-6xl">
          <LandingSectionHeader
            eyebrow="Depth"
            title="More than a single pass/fail score"
            description="Surface caption noise, alt-text gaps, measured contrast, and platform publishing tasks in one place."
          />
          <CapabilitiesBento />
        </Container>
      </section>

      <section id="audiences" className="bg-card py-16 sm:py-20 lg:py-24">
        <Container className="max-w-6xl">
          <LandingSectionHeader
            eyebrow="Who it helps"
            title="Built for teams that publish in public"
            description="Creators, social managers, comms teams, and accessibility champions—all without connecting social accounts."
          />
          <AudiencesSection />
        </Container>
      </section>

      <Suspense fallback={null}>
        <LatestGuidesSection />
      </Suspense>

      <CtaBand />

      <section id="faq" className="py-16 sm:py-20 lg:py-24">
        <Container className="max-w-3xl">
          <LandingSectionHeader
            eyebrow="Support"
            title="Frequently asked questions"
            description="Privacy, supported platforms, and what automated preflight can and cannot do."
            align="center"
          />
          <FaqAccordion />
        </Container>
      </section>
    </>
  );
}
