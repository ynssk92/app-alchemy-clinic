import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  FileText, 
  ChevronRight, 
  Printer, 
  Download, 
  Share2, 
  ArrowUp,
  Clock,
  CheckCircle,
  Lock,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageData {
  title: string;
  subtitle: string;
  estimated_reading_time: string;
  sections: LegalSection[];
  version: string;
  last_updated: string;
}

export const LegalPage = () => {
  const { pathname } = useLocation();
  const pageType = pathname.includes("privacy") ? "privacy" : "terms";
  const [data, setData] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const { data: page, error } = await supabase
          .from("legal_pages")
          .select("*")
          .eq("page_type", pageType)
          .maybeSingle();

        if (error) throw error;
        
        if (page) {
          const content = page.content as any;
          setData({
            title: page.title,
            subtitle: content.subtitle,
            estimated_reading_time: content.estimated_reading_time,
            sections: content.sections,
            version: page.version,
            last_updated: new Date(page.last_updated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })
          });
        }
      } catch (err) {
        console.error("Error fetching legal page:", err);
        toast.error("Failed to load page content.");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageType]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      
      // Update active section based on scroll position
      const sections = data?.sections.map((_, i) => document.getElementById(`section-${i}`));
      if (sections) {
        const scrollPosition = window.scrollY + 150;
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section && scrollPosition >= section.offsetTop) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handlePrint = () => window.print();
  
  const handleShare = () => {
    navigator.share?.({
      title: data?.title,
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-primary/10 selection:text-primary">
      <Seo 
        title={`${data.title} — La Dune`}
        description={data.subtitle}
        path={pathname}
      />
      
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium">{data.title}</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-4 max-w-2xl">
              <Badge variant="outline" className="bg-white text-primary border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {pageType === "privacy" ? "Privacy & Security" : "Legal Framework"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                {data.title}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                {data.subtitle}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-slate-200 text-slate-600 h-10 px-4 rounded-xl hover:bg-slate-50 gap-2"
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>Print</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-slate-200 text-slate-600 h-10 px-4 rounded-xl hover:bg-slate-50 gap-2"
                onClick={handleShare}
              >
                <Share2 size={16} />
                <span>Share</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-[24px] border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Clock size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Updated</span>
                <span className="block text-sm font-semibold text-slate-700">{data.last_updated}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <FileText size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Version</span>
                <span className="block text-sm font-semibold text-slate-700">{data.version}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Clock size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Read Time</span>
                <span className="block text-sm font-semibold text-slate-700">{data.estimated_reading_time}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                <span className="block text-sm font-semibold text-green-600">{pageType === "privacy" ? "GDPR Ready" : "Active"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-12 pb-20">
            {data.sections.map((section, index) => (
              <motion.section 
                key={index}
                id={`section-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="scroll-mt-32 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="mt-1 p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Shield size={18} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {section.title}
                  </h2>
                </div>
                <div className="pl-12 prose prose-slate prose-lg max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              </motion.section>
            ))}

            <div className="pt-12 border-t border-slate-200">
              <div className="bg-primary/5 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-900">Still have questions?</h3>
                  <p className="text-slate-600 max-w-md">
                    Our legal and support teams are here to help you understand our terms and how we handle your data.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/contact">
                    <Button size="lg" className="rounded-2xl h-14 px-8 gap-2 shadow-lg shadow-primary/20">
                      Contact Support
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Navigation */}
          <aside className="lg:w-1/3">
            <div className="sticky top-32 space-y-6">
              <Card className="p-6 rounded-[28px] border-slate-200/60 shadow-md shadow-slate-200/20 overflow-hidden">
                <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                    <FileText size={16} />
                  </div>
                  <span>Table of Contents</span>
                </div>
                
                <nav className="space-y-1">
                  {data.sections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSection(index)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-between group",
                        activeSection === index 
                          ? "bg-primary/10 text-primary shadow-sm" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <span className="truncate pr-4">{section.title}</span>
                      <ChevronRight 
                        size={14} 
                        className={cn(
                          "transition-transform duration-300",
                          activeSection === index ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        )} 
                      />
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-xl text-slate-500 hover:text-primary gap-3"
                    onClick={() => window.print()}
                  >
                    <Download size={18} />
                    <span className="font-semibold">Download PDF Copy</span>
                  </Button>
                </div>
              </Card>

              {/* Quick Contact Card */}
              <div className="p-6 rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                <h4 className="font-bold text-lg mb-2">Need help?</h4>
                <p className="text-slate-400 text-sm mb-6">
                  For any questions regarding our policies or your data privacy.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Lock size={14} />
                    </div>
                    <span className="text-sm font-medium">privacy@ladune.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Shield size={14} />
                    </div>
                    <span className="text-sm font-medium">security-center</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center text-primary z-50 hover:bg-primary hover:text-white transition-all duration-300"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  );
};

// SiteFooter Component (Local for now to ensure consistency)
const SiteFooter = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="La Dune" className="h-8" />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              La Dune Clinique Dentaire provides premium dental care with cutting-edge technology and patient-centered experience.
            </p>
          </div>
          
          <div>
            <h5 className="font-bold text-slate-900 mb-6">Patient Links</h5>
            <ul className="space-y-4">
              <li><Link to="/booking" className="text-sm text-slate-500 hover:text-primary transition-colors">Book Appointment</Link></li>
              <li><Link to="/doctors" className="text-sm text-slate-500 hover:text-primary transition-colors">Our Doctors</Link></li>
              <li><Link to="/auth" className="text-sm text-slate-500 hover:text-primary transition-colors">Patient Portal</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-500 hover:text-primary transition-colors">Common Questions</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-6">Legal & Support</h5>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-500 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-500 hover:text-primary transition-colors">Contact Support</Link></li>
              <li><button className="text-sm text-slate-500 hover:text-primary transition-colors">Cookie Policy</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-6">Clinic Info</h5>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-slate-500">
                <Badge variant="outline" className="h-6 px-2 rounded-lg bg-slate-50 border-slate-200 text-slate-400">v1.2.0</Badge>
                <span>HealthBook Platform</span>
              </li>
              <li className="text-sm text-slate-500">
                Open Mon - Sat<br />
                09:00 - 19:00
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            &copy; {new Date().getFullYear()} La Dune Clinique Dentaire. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Terms</Link>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secured with AES-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LegalPage;