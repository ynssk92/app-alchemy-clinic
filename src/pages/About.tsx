import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageContent } from "@/hooks/usePageContent";
import { AboutHero } from "@/components/about/AboutHero";
import { StorySection } from "@/components/about/StorySection";
import { MissionVision } from "@/components/about/MissionVision";
import { StatsSection } from "@/components/about/StatsSection";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { WhyChooseUs } from "@/components/about/WhyChooseUs";
import { CertificationBadges } from "@/components/about/CertificationBadges";
import { TestimonialsPreview } from "@/components/about/TestimonialsPreview";
import { AboutCTA } from "@/components/about/AboutCTA";

const About = () => {
  const { page, blocks, loading } = usePageContent("about");
  const mission = blocks.find((b) => b.kind === "mission");
  const values = blocks.filter((b) => b.kind === "value");
  const paragraphs = (page?.intro || "").split(/\n{2,}/).filter(Boolean);

  return (
    <PageShell
      title={page?.seo_title || "À Propos — La Dune Clinique Dentaire"}
      description={
        page?.seo_description ||
        "Découvrez l'histoire, la mission et les valeurs de La Dune Clinique Dentaire."
      }
      path="/about"
      heading={page?.heading || "À Propos"}
      hideHero
    >
      {loading ? (
        <div className="space-y-6 py-10">
          <Skeleton className="h-72 w-full rounded-[28px]" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-[28px]" />
            <Skeleton className="h-48 w-full rounded-[28px]" />
          </div>
        </div>
      ) : (
        <div className="-mx-4 overflow-hidden">
          <AboutHero
            eyebrow={page?.eyebrow}
            heading={page?.heading}
            subheading={page?.subheading}
          />
          <StorySection paragraphs={paragraphs} />
          <MissionVision missionTitle={mission?.title} missionBody={mission?.body} />
          <StatsSection />
          <ValuesGrid values={values} />
          <WhyChooseUs />
          <CertificationBadges />
          <TestimonialsPreview />
          <AboutCTA />
        </div>
      )}
    </PageShell>
  );
};

export default About;
