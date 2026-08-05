import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PendingFile = {
  file: File;
  category: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id: string;
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        category: "other",
        progress: 0,
        status: 'pending' as const,
        id: Math.random().toString(36).substr(2, 9)
      }));
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
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
              id: Math.random().toString(36).substr(2, 9)
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
              className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-border/50 shadow-sm relative group"
            >
              <button
                onClick={() => removeFile(f.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <FileIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{f.file.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Category</Label>
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
    </div>
  );
};

export default DocumentUploadSection;