import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn } from "lucide-react";

interface Props {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  busy?: boolean;
}

async function getCroppedBlob(imageSrc: string, area: Area, size = 512): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
  );
}

export const AvatarCropDialog = ({ open, imageSrc, onCancel, onCropped, busy }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleSave = async () => {
    if (!imageSrc || !area) return;
    const blob = await getCroppedBlob(imageSrc, area);
    onCropped(blob);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
          <DialogDescription>Drag to reposition, use the slider to zoom, then save.</DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-80 bg-muted rounded-md overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            min={1}
            max={4}
            step={0.05}
            onValueChange={(v) => setZoom(v[0])}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button onClick={handleSave} disabled={busy || !area}>
            {busy ? "Uploading..." : "Save photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
