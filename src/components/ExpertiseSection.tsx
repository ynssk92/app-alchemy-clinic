import { motion } from "framer-motion";

export const ExpertiseSection = () => {
  return (
    <section className="py-24 md:py-32 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" 
                  alt="Advanced Dental Technology" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -right-8 top-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hidden sm:block">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-slate-900">3D Imaging</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-slate-900">Digital CAD/CAM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-slate-900">Laser Precision</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Technology</span>
            <h2 className="mt-4 text-[40px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1]">
              Advanced technology.<br />
              Exceptional precision.
            </h2>
            <p className="mt-8 text-lg text-slate-500 leading-relaxed">
              We invest in the latest dental innovations to provide you with more accurate diagnoses, faster treatments, and superior comfort. Our clinic is equipped with state-of-the-art systems designed for patient-centered excellence.
            </p>
            
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Digital Workflow</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Streamlined digital scanning and manufacturing for perfect results.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Pain-free Solutions</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Modern anesthesia and laser techniques for a comfortable experience.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
