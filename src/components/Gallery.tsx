import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  Plus, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  tag: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
    title: "Reception",
    description: "A warm and welcoming environment for our patients.",
    tag: "Premium Care",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1588776814546-1ffce47267a5?auto=format&fit=crop&q=80&w=800",
    title: "Consultation Room",
    description: "Private spaces for personalized treatment planning.",
    tag: "Comfort",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1629909615184-74f49af3b77e?auto=format&fit=crop&q=80&w=800",
    title: "Treatment Room",
    description: "Advanced clinical suites equipped for excellence.",
    tag: "Technology",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1445527815219-ecbfec67492e?auto=format&fit=crop&q=80&w=800",
    title: "Dental Technology",
    description: "State-of-the-art diagnostic and surgical equipment.",
    tag: "Digital Dentistry",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    title: "Sterilization Area",
    description: "Maximum safety through rigorous hygiene protocols.",
    tag: "Sterilization",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800",
    title: "Patient Lounge",
    description: "Relaxing environment designed for your comfort.",
    tag: "Modern Equipment",
  },
];

export const Gallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const nextImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev! + 1) % GALLERY_IMAGES.length);
  }, [selectedImageIndex]);

  const prevImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev! - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, [selectedImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, nextImage, prevImage]);

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-[90px] pb-[100px]">
      {/* subtle blue radial gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-[#2563EB]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] rounded-full bg-[#06B6D4]/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-[1400px] px-4">
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2563EB] shadow-sm"
          >
            <Camera className="h-3.5 w-3.5" />
            📷 GALLERY
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-[48px] font-bold leading-[1.1] tracking-tight text-[#111827]"
          >
            Discover Our Modern Clinic
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500"
          >
            Take a look inside our clinic and explore our advanced facilities, treatment rooms, technology and patient experience.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-[28px] md:grid-cols-2 lg:grid-cols-3">
          {GALLERY_IMAGES.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative h-[340px] overflow-hidden rounded-[28px] bg-white shadow-soft transition-all duration-300 hover:shadow-large"
              onClick={() => openLightbox(index)}
            >
              {/* Top left badge */}
              <div className="absolute left-6 top-6 z-10">
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {image.tag}
                </div>
              </div>

              {/* Image */}
              <motion.img
                src={image.url}
                alt={image.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              />

              {/* Bottom Overlay Card */}
              <div className="absolute inset-x-0 bottom-0 p-5 pt-0 transition-transform duration-300 group-hover:-translate-y-2">
                <div className="relative flex items-center justify-between overflow-hidden rounded-[22px] bg-white/90 p-[22px] shadow-lg backdrop-blur-xl transition-all duration-300 group-hover:shadow-xl">
                  <div className="min-w-0 pr-4">
                    <h3 className="truncate text-[24px] font-bold tracking-tight text-[#111827]">
                      {image.title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {image.description}
                    </p>
                  </div>
                  <button className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white shadow-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <ArrowUpRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm md:p-10"
          >
            <button
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-[110] rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:left-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={GALLERY_IMAGES[selectedImageIndex].url}
                alt={GALLERY_IMAGES[selectedImageIndex].title}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white md:p-10">
                <h4 className="text-2xl font-bold">{GALLERY_IMAGES[selectedImageIndex].title}</h4>
                <p className="mt-2 text-white/70">{GALLERY_IMAGES[selectedImageIndex].description}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                   {GALLERY_IMAGES.map((_, i) => (
                     <div 
                       key={i} 
                       className={cn(
                         "h-1.5 rounded-full transition-all duration-300",
                         i === selectedImageIndex ? "w-8 bg-[#2563EB]" : "w-1.5 bg-white/30"
                       )}
                     />
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
