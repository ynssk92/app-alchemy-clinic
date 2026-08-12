import { CheckCircle2, ShieldCheck, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { resolveIcon } from "@/lib/pageContent";
import type { PageBlock } from "@/hooks/usePageContent";

interface TrustSectionProps {
  blocks?: PageBlock[];
}

export const TrustSection = ({ blocks }: TrustSectionProps) => {
  const defaultItems = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Safe & Professional",
      desc: "Highest standards of sterilization and professional care."
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "Experienced Specialists",
      desc: "A multidisciplinary team of experienced dental practitioners."
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Personalized Care",
      desc: "Customized treatment plans tailored to your specific needs."
    }
  ];

  const items = blocks ? blocks.map(b => {
    const Icon = resolveIcon(b.icon);
    return {
      icon: <Icon className="w-6 h-6 text-primary" />,
      title: b.title || "",
      desc: b.body || ""
    };
  }) : defaultItems;

  return (
    <section className="py-20 bg-white border-b border-slate-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
