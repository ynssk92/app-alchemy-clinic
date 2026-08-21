import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileText, Search, Filter, Plus, Download, Eye, Trash2, 
  MoreVertical, FileIcon, ImageIcon, FileSearch, Camera,
  Loader2, Calendar, User, Info, CheckCircle2, AlertCircle,
  FileDigit, FileSpreadsheet, FileArchive, X, GripVertical,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MedicalArchiveProps {
  patientId: string;
}

interface Document {
  id: string;
  document_name: string;
  category: string;
  document_type: string;
  file_path: string;
  document_date: string;
  created_at: string;
  metadata: any;
  uploaded_by: string;
}

const CATEGORIES = [
  "Ordonnance",
  "Scanner",
  "RIM",
  "IRM",
  "Radiographie",
  "Échographie",
  "Analyse laboratoire",
  "Compte rendu médical",
  "Rapport radiologique",
  "Certificat médical",
  "Arrêt maladie",
  "Dossier administratif",
  "Assurance",
  "Autre"
];

const MedicalArchive = ({ patientId }: MedicalArchiveProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // New document form state
  const [newDoc, setNewDoc] = useState({
    name: "",
    category: "Autre",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    files: [] as File[]
  });

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("patient_documents")
        .select("*")
        .eq("patient_id", patientId)
        .order("document_date", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setNewDoc(prev => ({
        ...prev,
        files: [...prev.files, ...selectedFiles],
        name: prev.name || selectedFiles[0]?.name.split('.')[0] || ""
      }));
    }
  };

  const removeFile = (index: number) => {
    setNewDoc(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const saveDocument = async () => {
    if (newDoc.files.length === 0) {
      toast({ title: "Error", description: "Please select at least one file", variant: "destructive" });
      return;
    }

    try {
      setUploadLoading(true);
      
      // For now, we handle one file per database record as per current schema
      // In the future, we could combine pages into a PDF or use the JSONB metadata for multiple paths
      for (const file of newDoc.files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${patientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("patient_documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from("patient_documents")
          .insert({
            patient_id: patientId,
            document_name: newDoc.files.length > 1 ? `${newDoc.name} - ${file.name}` : newDoc.name,
            category: newDoc.category,
            document_type: file.type,
            file_path: filePath,
            document_date: newDoc.date,
            metadata: { description: newDoc.description }
          });

        if (dbError) throw dbError;
        
        // Log event
        await supabase.from("patient_events").insert({
          patient_id: patientId,
          event_type: "document_upload",
          title: "Document uploaded",
          description: `Uploaded ${newDoc.category}: ${newDoc.name}`,
          metadata: { category: newDoc.category, name: newDoc.name }
        });
      }

      toast({ title: "Success", description: "Document(s) uploaded successfully" });
      setIsUploadOpen(false);
      setNewDoc({ name: "", category: "Autre", date: format(new Date(), "yyyy-MM-dd"), description: "", files: [] });
      fetchDocuments();
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("patient_documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("patient_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast({ title: "Deleted", description: "Document removed successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("patient_documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.document_name || "document";
      a.click();
    } catch (error: any) {
      toast({ title: "Download failed", description: error.message, variant: "destructive" });
    }
  };

  const previewDocument = async (doc: Document) => {
    try {
      const { data } = await supabase.storage
        .from("patient_documents")
        .createSignedUrl(doc.file_path, 60);
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error: any) {
      toast({ title: "Preview failed", description: error.message, variant: "destructive" });
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.document_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    if (type?.includes("pdf")) return <FileDigit className="w-8 h-8 text-red-500" />;
    if (type?.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (type?.includes("sheet") || type?.includes("excel")) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    return <FileIcon className="w-8 h-8 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un document..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter au dossier médical</DialogTitle>
                <DialogDescription>
                  Importez des documents, analyses ou examens radiologiques.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom du document</Label>
                    <Input 
                      placeholder="Ex: RIM Abdominal" 
                      value={newDoc.name}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={newDoc.category} onValueChange={(v) => setNewDoc(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date du document</Label>
                    <Input 
                      type="date" 
                      value={newDoc.date}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optionnel)</Label>
                    <textarea 
                      className="w-full h-24 p-2 rounded-md border text-sm bg-transparent"
                      placeholder="Notes ou détails supplémentaires..."
                      value={newDoc.description}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Fichiers / Pages</Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <FileSearch className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Cliquer pour importer</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Supporte PDF, Images, Drag & Drop
                    </span>
                    <input 
                      id="file-upload"
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="space-y-2 max-h-48 overflow-auto">
                    {newDoc.files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                          <X className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsScanning(true)}>
                      <Camera className="w-4 h-4 mr-2" />
                      Scanner
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Annuler</Button>
                <Button 
                  className="bg-gradient-primary" 
                  onClick={saveDocument}
                  disabled={uploadLoading || newDoc.files.length === 0}
                >
                  {uploadLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enregistrer dans l'archive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))
        ) : filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-md transition-all border-[#E2E8F0]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/5 transition-colors">
                      {getFileIcon(doc.document_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate leading-tight mb-1">
                        {doc.document_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {doc.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {format(new Date(doc.document_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => previewDocument(doc)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Aperçu
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadDocument(doc)}>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteDocument(doc)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
            <FileArchive className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Aucun document trouvé</p>
            <p className="text-sm">Importez les premiers documents du patient.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalArchive;
