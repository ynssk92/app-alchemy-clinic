import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StickySaveBarProps {
  show: boolean;
  loading: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const StickySaveBar = ({ show, loading, onSave, onDiscard }: StickySaveBarProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 p-2 bg-white/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl"
        >
          <div className="px-4 py-2 border-r border-border mr-2 hidden sm:block">
            <p className="text-sm font-semibold text-foreground">You have unsaved changes</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDiscard} 
            disabled={loading}
            className="rounded-xl h-10 hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button 
            size="sm" 
            onClick={onSave} 
            disabled={loading}
            className="rounded-xl h-10 bg-primary shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
