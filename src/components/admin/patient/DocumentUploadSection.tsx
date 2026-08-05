import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  X, 
  File as FileIcon, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Eye,
  Maximize2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type PendingFile = {
  file: File;
  category: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id: string;
  previewUrl?: string;
};

interface DocumentUploadSectionProps {
  files: PendingFile[];
  onFilesChange: (files: PendingFile[]) => void;
}

const CATEGORIES = [
  { value: "id_card", label: "ID Card / Passport" },
  { value: "insurance", label: "Insurance Card" },
  { value: "consent", label: "Consent Form" },
  { value: "medical_record", label: "Medical Record" },
  { value: "other", label: "Other" }
];

const DocumentUploadSection = ({ files, onFilesChange }: DocumentUploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<{url: string, type: string, name: string} | null>(null);

  useEffect(() => {
    // Cleanup preview URLs when component unmounts
    return () => {
      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        category: "other",
        progress: 0,
        status: 'pending' as const,
        id: Math.random().toString(36).substr(2, 9),
        previewUrl: file.type.startsWith('image/') || file.type === 'application/pdf' 
          ? URL.createObjectURL(file) 
          : undefined
      }));
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    onFilesChange(files.filter(f => f.id !== id));
  };

  const updateCategory = (id: string, category: string) => {
    onFilesChange(files.map(f => f.id === id ? { ...f, category } : f));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Upload className="w-5 h-5" />
        <h2 className="text-xl font-bold">Patient Documents</h2>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).map(file => ({
              file,
              category: "other",
              progress: 0,
              status: 'pending' as const,
              id: Math.random().toString(36).substr(2, 9),
              previewUrl: file.type.startsWith('image/') || file.type === 'application/pdf' 
                ? URL.createObjectURL(file) 
                : undefined
            }));
            onFilesChange([...files, ...newFiles]);
          }
        }}
        className={`border-2 border-dashed rounded-[20px] p-10 flex flex-col items-center justify-center transition-all ${
          isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/50 hover:border-primary/50"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">Click to upload or drag and drop</p>
          <p className="text-sm text-muted-foreground mt-1">PDF, PNG, JPG or WEBP (max. 10MB)</p>
        </div>
        <input
          type="file"
          multiple
          className="hidden"
          id="file-upload"
          onChange={handleFileSelect}
        />
        <Button 
          variant="outline" 
          className="mt-6 rounded-xl"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Select Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {files.map((f) => (
            <div 
              key={f.id} 
              className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-border/50 shadow-sm relative group overflow-hidden"
            >
              <button
                onClick={() => removeFile(f.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-white flex items-center justify-center transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-4">
                <div className="relative group/preview shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border/50">
                    {f.previewUrl ? (
                      f.file.type.startsWith('image/') ? (
                        <img src={f.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-8 h-8 text-primary/40" />
                      )
                    ) : (
                      <FileIcon className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  {f.previewUrl && (
                    <button 
                      onClick={() => setSelectedPreview({
                        url: f.previewUrl!,
                        type: f.file.type,
                        name: f.file.name
                      })}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity rounded-xl"
                    >
                      <Eye className="w-6 h-6 text-white" />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="pr-8">
                    <p className="text-sm font-bold truncate">{f.file.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {(f.file.size / (1024 * 1024)).toFixed(2)} MB • {f.file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </p>
                  </div>
                  
                  <div className="mt-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Category</Label>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => updateCategory(f.id, cat.value)}
                          className={`px-2 py-1 text-[10px] rounded-lg border transition-all ${
                            f.category === cat.value 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/30"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {f.status !== 'pending' && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>{f.status === 'uploading' ? 'Uploading...' : f.status === 'completed' ? 'Success' : 'Error'}</span>
                        <span>{f.progress}%</span>
                      </div>
                      <Progress value={f.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedPreview} onOpenChange={(open) => !open && setSelectedPreview(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-0 overflow-hidden bg-slate-900 border-none">
          <DialogHeader className="p-4 bg-slate-800/50 flex flex-row items-center justify-between border-b border-slate-700">
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedPreview?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full w-full bg-slate-900 flex items-center justify-center p-4">
            {selectedPreview?.type.startsWith('image/') ? (
              <img 
                src={selectedPreview.url} 
                alt="Document Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
            ) : selectedPreview?.type === 'application/pdf' ? (
              <iframe 
                src={selectedPreview.url} 
                className="w-full h-full border-none rounded-lg bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="text-white flex flex-col items-center gap-4">
                <FileIcon className="w-16 h-16 text-slate-500" />
                <p>Preview not available for this file type</p>
                <Button variant="outline" onClick={() => window.open(selectedPreview?.url, '_blank')}>
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUploadSection;