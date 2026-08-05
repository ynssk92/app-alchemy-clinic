import { motion } from "framer-motion";

interface AuthFeatureCardProps {
  icon: string;
  title: string;
  delay?: number;
}

export const AuthFeatureCard = ({ icon, title, delay = 0 }: AuthFeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex items-center gap-4 p-4 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-primary/20"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
    </motion.div>
  );
};
