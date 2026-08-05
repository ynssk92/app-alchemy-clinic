import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon, Loader2, Save, GripVertical } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  description: string;
  category: string;
  display_order: number;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAdd = async () => {
    const newImage = {
      title: "New Image",
      description: "Enter description here",
      image_url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2000",
      category: "Clinic",
      display_order: images.length + 1
    };

    const { data, error } = await supabase
      .from("gallery_images")
      .insert(newImage)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setImages([...images, data]);
    toast.success("Image added to gallery");
  };

  const handleUpdate = async (id: string, patch: Partial<GalleryImage>) => {
    const { error } = await supabase
      .from("gallery_images")
      .update(patch)
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setImages(images.map(img => img.id === id ? { ...img, ...patch } : img));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setImages(images.filter(img => img.id !== id));
    toast.success("Image removed from gallery");
  };

  const uploadImage = async (file: File, id: string) => {
    setUploading(id);
    const ext = file.name.split(".").pop();
    const path = `gallery/${id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(path, file);

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("branding")
      .getPublicUrl(path);

    await handleUpdate(id, { image_url: publicUrl });
    setUploading(null);
    toast.success("Image uploaded");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage the images shown in the homepage gallery section.
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              <img 
                src={image.image_url} 
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, image.id);
                    }}
                  />
                  <Button size="icon" variant="secondary" className="h-8 w-8" disabled={uploading === image.id}>
                    {uploading === image.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  </Button>
                </label>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8"
                  onClick={() => handleDelete(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={image.title} 
                    onChange={(e) => handleUpdate(image.id, { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category / Tag</Label>
                  <Input 
                    value={image.category} 
                    onChange={(e) => handleUpdate(image.id, { category: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={image.description} 
                  onChange={(e) => handleUpdate(image.id, { description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Display Order</Label>
                  <Input 
                    type="number"
                    value={image.display_order} 
                    onChange={(e) => handleUpdate(image.id, { display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-20 bg-muted/50 rounded-xl border-2 border-dashed">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">No images in gallery yet.</p>
          <Button variant="link" onClick={handleAdd}>Add your first image</Button>
        </div>
      )}
    </div>
  );
}