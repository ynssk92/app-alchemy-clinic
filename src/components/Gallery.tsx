import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  description: string;
  category: string;
}

const trackGalleryEvent = async (imageId: string | null, eventType: string) => {
  try {
    await supabase.from("gallery_events").insert({
      image_id: imageId,
      event_type: eventType,
    });
  } catch (error) {
    console.error("Failed to track gallery event:", error);
  }
};

export const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const openLightbox = (index: number) => {
    const image = images[index];
    trackGalleryEvent(image.id, "open");
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => setSelectedImageIndex(null);

  const nextImage = useCallback(() => {
    if (selectedImageIndex === null || images.length === 0) return;
    const nextIndex = (selectedImageIndex! + 1) % images.length;
    trackGalleryEvent(images[nextIndex].id, "next");
    setSelectedImageIndex(nextIndex);
  }, [selectedImageIndex, images]);

  const prevImage = useCallback(() => {
    if (selectedImageIndex === null || images.length === 0) return;
    const prevIndex = (selectedImageIndex! - 1 + images.length) % images.length;
    trackGalleryEvent(images[prevIndex].id, "previous");
    setSelectedImageIndex(prevIndex);
  }, [selectedImageIndex, images]);

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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-[90px] pb-[100px]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-[1400px] px-4">
        <div className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary shadow-sm"
          >
            <Camera className="h-3.5 w-3.5" />
            📷 GALLERY
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-[48px] font-bold leading-[1.1] tracking-tight text-foreground"
          >
            Discover Our Modern Clinic
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            Take a look inside our clinic and explore our advanced facilities, treatment rooms, technology and patient experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-[28px] md:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative h-[340px] overflow-hidden rounded-[28px] bg-white shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="absolute left-6 top-6 z-10">
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {image.category}
                </div>
              </div>

              <motion.img
                src={image.image_url}
                alt={image.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              />

              <div className="absolute inset-x-0 bottom-0 p-5 pt-0 transition-transform duration-300 group-hover:-translate-y-2">
                <div className="relative flex items-center justify-between overflow-hidden rounded-[22px] bg-white/90 p-[22px] shadow-lg backdrop-blur-xl transition-all duration-300 group-hover:shadow-xl">
                  <div className="min-w-0 pr-4">
                    <h3 className="truncate text-[24px] font-bold tracking-tight text-foreground">
                      {image.title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {image.description}
                    </p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
                src={images[selectedImageIndex].image_url}
                alt={images[selectedImageIndex].title}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white md:p-10">
                <h4 className="text-2xl font-bold">{images[selectedImageIndex].title}</h4>
                <p className="mt-2 text-white/70">{images[selectedImageIndex].description}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                   {images.map((_, i) => (
                     <div 
                       key={i} 
                       className={cn(
                         "h-1.5 rounded-full transition-all duration-300",
                         i === selectedImageIndex ? "w-8 bg-primary" : "w-1.5 bg-white/30"
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