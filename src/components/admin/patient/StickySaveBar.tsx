import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";

interface StickySaveBarProps {
  visible: boolean;
  isBusy: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

const StickySaveBar = ({ visible, isBusy, onSave, onDiscard }: StickySaveBarProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Unsaved Changes</p>
                <p className="text-xs text-muted-foreground">You have modified the patient record</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDiscard}
                disabled={isBusy}
                className="hover:bg-destructive/10 hover:text-destructive gap-2 h-10 px-4 rounded-xl"
              >
                <X className="w-4 h-4" /> Discard
              </Button>
              <Button 
                size="sm" 
                onClick={onSave}
                disabled={isBusy}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-6 rounded-xl shadow-lg shadow-primary/20"
              >
                {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickySaveBar;
