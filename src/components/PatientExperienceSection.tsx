import { motion } from "framer-motion";

export const PatientExperienceSection = () => {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Experience</span>
          <h2 className="mt-4 text-[40px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1]">
            Care designed around you.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Calm Environment",
              desc: "We've created a clinic space that feels like a sanctuary, reducing dental anxiety and promoting relaxation."
            },
            {
              title: "Transparent Care",
              desc: "Clear explanations, detailed treatment plans, and upfront pricing. You're always in control of your dental health."
            },
            {
              title: "Modern Comfort",
              desc: "From ergonomic treatment chairs to entertainment options during procedures, your comfort is our priority."
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-primary/10 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
