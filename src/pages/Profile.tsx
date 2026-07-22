import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Upload, User as UserIcon, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  phone: z.string().trim().max(30, "Phone must be under 30 characters").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadAvatar = async (path: string | null) => {
    if (!path) return setAvatarUrl(null);
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    setAvatarUrl(data?.signedUrl || null);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name || "");
        setPhone(data?.phone || "");
        setAvatarPath(data?.avatar_url || null);
        loadAvatar(data?.avatar_url || null);
        setLoading(false);
      });
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropped = async (blob: Blob) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/avatar-${Date.now()}.jpg`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }

    if (avatarPath && avatarPath !== path) {
      await supabase.storage.from("avatars").remove([avatarPath]);
    }

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", user.id);
    setUploading(false);
    if (updErr) return toast.error(updErr.message);

    setAvatarPath(path);
    await loadAvatar(path);
    setCropSrc(null);
    toast.success("Profile photo updated!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ full_name: fullName, phone });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setConfirmOpen(true);
  };

  const confirmChangePassword = async () => {
    const parsed = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      setConfirmOpen(false);
      return toast.error(parsed.error.issues[0].message);
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    setChangingPassword(false);
    setConfirmOpen(false);
    if (error) return toast.error(error.message);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated — signing you out.");
    setTimeout(async () => {
      await signOut();
      navigate("/auth");
    }, 800);
  };

  const initials = (fullName || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Your Profile — HealthBook"
        description="Update your display name, photo and contact info on HealthBook."
        path="/profile"
      />
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="HealthBook Logo" className="h-10" />
          </Link>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
        </div>
      </nav>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Update your photo, display name and contact details.</p>

          <Card className="p-8 border-border bg-card shadow-large">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-2 border-border shadow-medium">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile photo" />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {initials || <UserIcon className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : avatarPath ? "Change photo" : "Upload photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG or JPG, up to 5MB.</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <Label htmlFor="full_name">Display Name</Label>
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card className="p-8 border-border bg-card shadow-large mt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update the password used to sign in.</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="new_password">New password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground mt-1">At least 8 characters.</p>
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                <Lock className="w-4 h-4 mr-2" />
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Card>
        </div>
      </section>
      <AvatarCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onCropped={handleCropped}
        busy={uploading}
      />
      <AlertDialog open={confirmOpen} onOpenChange={(o) => !changingPassword && setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update your password?</AlertDialogTitle>
            <AlertDialogDescription>
              After updating, you'll be signed out on this device and will need to sign in again with your new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={changingPassword}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangePassword} disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update & sign out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
