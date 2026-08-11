import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    created_at: string;
    author?: { name: string } | null;
    category?: { name: string } | null;
  };
  index: number;
}

export const BlogCard = ({ post, index }: BlogCardProps) => {
  const date = new Date(post.published_at || post.created_at);
  const day = format(date, "dd");
  const month = format(date, "MMM", { locale: fr }).toUpperCase().replace(".", "");
  const fullDate = format(date, "dd MMMM yyyy", { locale: fr });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/blog/${post.slug}`} className="group block h-full">
        <div className="bg-white rounded-[20px] border border-blue-50 overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative h-56 overflow-hidden">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Tag className="w-8 h-8 text-blue-200" />
                </div>
              </div>
            )}
            
            {/* Date Badge */}
            <div className="absolute bottom-4 right-4 bg-primary text-white px-3 py-2 rounded-xl shadow-lg flex flex-col items-center justify-center min-w-[50px]">
              <span className="text-lg font-bold leading-none">{day}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{month}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                {fullDate}
              </div>
              {post.author && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-secondary" />
                  {post.author.name}
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Action */}
            <div className="mt-auto flex items-center gap-2 text-secondary font-bold text-sm tracking-wide">
              Lire l'article
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
