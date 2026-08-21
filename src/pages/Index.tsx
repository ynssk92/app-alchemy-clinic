import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/components/DoctorCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { HeroSection } from "@/components/HeroSection";
import { TrustSection } from "@/components/TrustSection";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { WhyLaDuneSection } from "@/components/WhyLaDuneSection";
import { PatientExperienceSection } from "@/components/PatientExperienceSection";
import { FinalCTA } from "@/components/FinalCTA";
import { usePageContent } from "@/hooks/usePageContent";
import { ServiceTabs } from "@/components/services/ServiceTabs";
import { ServiceCard } from "@/components/services/ServiceCard";
import { resolveImage } from "@/lib/pageContent";
import { motion } from "framer-motion";

interface Doctor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  experience_years: number | null;
  specialties: { name: string } | null;
  rating?: number | null;
  clinics?: { name: string } | null;
  is_available?: boolean;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const { page, blocks } = usePageContent("home", isPreview);
  
  const departments = blocks.filter(b => b.kind === "department");
  const trustBlocks = blocks.filter(b => b.kind === "trust");
  const expertiseBlocks = blocks.filter(b => b.kind === "expertise");
  const whyUsBlocks = blocks.filter(b => b.kind === "why-us");
  const experienceBlocks = blocks.filter(b => b.kind === "experience");
  
  const [activeDept, setActiveDept] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDept && departments.length) setActiveDept(departments[0].id);
  }, [departments, activeDept]);

  useEffect(() => {
    supabase
      .from("doctors")
      .select("id, full_name, avatar_url, experience_years, specialties(name), rating, clinics(name), is_available")
      .eq("is_available", true)
      .order("full_name")
      .limit(3)
      .then(({ data }) => setDoctors((data as any) || []));

    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,cover_image_url,published_at,created_at")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data }) => setPosts((data as Post[]) || []));
  }, []);

  const currentDept = departments.find((d) => d.id === activeDept) || departments[0];

  const hero = page?.hero_config || {};

  return (
    <PublicLayout>
      <Seo
        title={page?.seo_title || "La Dune Clinique Dentaire — Exceptional Dental Care"}
        description={page?.seo_description || "Premium modern dental clinic in Agadir. Advanced technology, experienced specialists, and personalized care."}
        path="/"
      />

      <HeroSection />
      
      {trustBlocks.length > 0 ? (
        <TrustSection blocks={trustBlocks} />
      ) : (
        <TrustSection />
      )}

      {/* Services Section */}
      <section className="bg-slate-50 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {hero.servicesLabel || "Our Dental Care"}
            </span>
            <h2 className="mt-4 text-[40px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1]">
              {hero.servicesHeading || "Comprehensive treatments designed around your needs."}
            </h2>
          </div>

          {departments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <ServiceTabs
                items={departments.map((d) => ({ id: d.id, label: d.title || "Treatment" }))}
                activeId={activeDept || departments[0].id}
                onChange={setActiveDept}
              />
              <div key={activeDept} className="mt-12">
                <ServiceCard
                  name={currentDept?.title || ""}
                  description={currentDept?.body}
                  features={currentDept?.items || []}
                  imageSrc={resolveImage(currentDept?.image_url) || undefined}
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {expertiseBlocks.length > 0 ? (
        <ExpertiseSection blocks={expertiseBlocks} />
      ) : (
        <ExpertiseSection />
      )}

      {/* Team Section */}
      {doctors.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Our Team</span>
                <h2 className="mt-4 text-[40px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1]">
                  Meet our experts
                </h2>
                <p className="mt-6 text-lg text-slate-500 leading-relaxed">
                  A multidisciplinary team dedicated to your oral health, combining years of clinical experience with continuous training.
                </p>
              </div>
              <Button asChild variant="outline" className="h-12 rounded-full px-8 border-slate-200 hover:bg-slate-50 group">
                <Link to="/equipe">
                  See all the team
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {doctors.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {whyUsBlocks.length > 0 ? (
        <WhyLaDuneSection blocks={whyUsBlocks} />
      ) : (
        <WhyLaDuneSection />
      )}
      
      {experienceBlocks.length > 0 ? (
        <PatientExperienceSection 
          blocks={experienceBlocks} 
          displayStyle={page?.hero_config?.testimonialStyle}
          limit={page?.hero_config?.testimonialLimit}
        />
      ) : (
        <PatientExperienceSection 
          displayStyle={page?.hero_config?.testimonialStyle}
          limit={page?.hero_config?.testimonialLimit}
        />
      )}

      {/* Blog Section */}
      {posts.length > 0 && (
        <section className="bg-slate-50 py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Blog</span>
                <h2 className="mt-4 text-[40px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1]">
                  Latest from our blog
                </h2>
              </div>
              <Button asChild variant="ghost" className="h-12 rounded-full px-8 text-slate-600 hover:text-primary transition-colors">
                <Link to="/blog">
                  Read all articles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              {posts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {blocks.find(b => b.kind === "final-cta") ? (
        <FinalCTA block={blocks.find(b => b.kind === "final-cta")} />
      ) : (
        <FinalCTA />
      )}
    </PublicLayout>
  );
};

export default Index;
