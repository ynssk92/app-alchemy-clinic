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
    <div className="flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Linked Accounts</h2>
                <p className="text-sm text-muted-foreground">Manage your connected social login providers.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "google", name: "Google", icon: (
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 43c5.4 0 10.3-2 14-5.3l-6.5-5.3C29.4 34 26.8 35 24 35c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.4 38.7 16.1 43 24 43z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.7l6.5 5.3C41 35 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                  </svg>
                )},
                { id: "apple", name: "Apple", icon: (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                )},
                { id: "facebook", name: "Facebook", icon: (
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )},
                { id: "twitter", name: "X (Twitter)", icon: (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )},
              ].map((provider) => {
                const isLinked = user?.app_metadata?.providers?.includes(provider.id);
                return (
                  <div key={provider.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      {provider.icon}
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <Button 
                      variant={isLinked ? "ghost" : "outline"} 
                      size="sm"
                      className={isLinked ? "text-green-600 hover:text-green-700" : ""}
                      onClick={() => !isLinked && (provider.id === 'google' || provider.id === 'apple' ? 
                        supabase.auth.signInWithOAuth({ provider: provider.id as 'google' | 'apple', options: { redirectTo: `${window.location.origin}/auth/callback` } }) :
                        supabase.auth.signInWithOAuth({ provider: provider.id as 'facebook' | 'twitter', options: { redirectTo: `${window.location.origin}/auth/callback` } })
                      )}
                    >
                      {isLinked ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Linked</span>
                        </div>
                      ) : "Connect"}
                    </Button>
                  </div>
                );
              })}
            </div>
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
