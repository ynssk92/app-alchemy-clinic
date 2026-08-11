import { motion } from "framer-motion";

export const BlogSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-[20px] border border-blue-50 overflow-hidden shadow-soft h-[450px]">
          <div className="h-56 bg-slate-100 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-slate-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
            <div className="mt-6 h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BlogEmpty = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-24 bg-white rounded-[32px] border border-blue-50 shadow-soft"
    >
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 2v6h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 13h8M8 17h6" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucun article trouvé</h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Nous n'avons pas encore publié d'articles. Revenez bientôt pour découvrir nos derniers conseils !
      </p>
    </motion.div>
  );
};
