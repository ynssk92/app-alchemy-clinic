import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Copy, Trash2, Upload, FolderOpen } from "lucide-react";

interface MediaItem {
  name: string;
  url: string;
}

const AdminMediaLibrary = () => {
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("branding").list();
    if (error) {
      toast({ title: "Failed to list media", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const items = await Promise.all(
      data.map(async (f) => ({
        name: f.name,
        url: supabase.storage.from("branding").getPublicUrl(f.name).data.publicUrl,
      }))
    );
    setFiles(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage.from("branding").upload(file.name, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Uploaded successfully" });
      load();
    }
    setUploading(false);
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Delete this file?")) return;
    const { error } = await supabase.storage.from("branding").remove([name]);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted successfully" });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground text-sm">Manage assets used across the CMS.</p>
        </div>
        <div className="relative">
          <Button disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
        </div>
      </div>
      
      {loading ? (
        <Card className="p-10 text-center text-muted-foreground">Loading...</Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((f) => (
            <Card key={f.name} className="p-2 space-y-2">
              <img src={f.url} alt={f.name} className="w-full h-24 object-cover rounded-md" />
              <div className="text-xs truncate font-medium">{f.name}</div>
              <div className="flex justify-between">
                <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(f.url); toast({ title: "URL copied!" }); }}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(f.name)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMediaLibrary;