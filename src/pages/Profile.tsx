import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Upload, User as UserIcon, Lock, CheckCircle2, Copy, ShieldCheck, Mail, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { cn } from "@/lib/utils";

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
  const { user, signOut, isAdmin } = useAuth();
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
        if (data?.avatar_url) {
            supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600).then(({data: signed}) => setAvatarUrl(signed?.signedUrl || null));
        }
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
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    if (avatarPath && avatarPath !== path) await supabase.storage.from("avatars").remove([avatarPath]);
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    setUploading(false);
    if (updErr) return toast.error(updErr.message);
    setAvatarPath(path);
    supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({data: signed}) => setAvatarUrl(signed?.signedUrl || null));
    setCropSrc(null);
    toast.success("Profile photo updated!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ full_name: fullName, phone });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null }).eq("id", user.id);
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
    if (!parsed.success) { setConfirmOpen(false); return toast.error(parsed.error.issues[0].message); }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    setChangingPassword(false);
    setConfirmOpen(false);
    if (error) return toast.error(error.message);
    setNewPassword(""); setConfirmPassword("");
    toast.success("Password updated — signing out.");
    setTimeout(async () => { await signOut(); navigate("/auth"); }, 800);
  };

  const progressFields = [!!avatarPath, !!fullName, !!user?.email, !!phone];
  const completion = Math.round((progressFields.filter(Boolean).length / progressFields.length) * 100);

  const initials = (fullName || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 md:p-10">
      <Seo title="Profile & Settings" description="Manage your account." path="/profile" />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 mb-2 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
          <p className="text-slate-500">Manage your personal information, account security and preferences.</p>
        </div>

        <Card className="p-6 md:p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-medium ring-1 ring-slate-100">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{fullName || "User"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-medium hover:bg-primary/20">{isAdmin ? "Administrator" : "User"}</Badge>
                  <span className="text-sm text-slate-500">{user?.email}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => document.getElementById('personal-info')?.scrollIntoView({behavior: 'smooth'})} variant="outline" className="rounded-full">Edit profile</Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card id="personal-info" className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Personal information</h3>
              <p className="text-sm text-slate-500 mb-6">Keep your contact information up to date.</p>
              <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label>Profile photo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full" disabled={uploading}>
                      <Upload className="w-4 h-4 mr-2" /> {uploading ? "Uploading..." : "Change photo"}
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                </div>
                <div><Label>Email</Label><Input value={user?.email || ""} disabled className="bg-slate-50" /><p className="text-[10px] text-slate-400 mt-1">Email cannot be changed</p></div>
                <div><Label>Display Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                <div className="md:col-span-2 pt-2"><Button type="submit" disabled={saving} className="bg-primary text-white rounded-full px-8">{saving ? "Saving..." : "Save changes"}</Button></div>
              </form>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Security</h3>
              <p className="text-sm text-slate-500 mb-6">Keep your account secure with a strong password.</p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" variant="secondary" className="rounded-full" disabled={changingPassword}><Lock className="w-4 h-4 mr-2" /> Change password</Button>
              </form>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Account overview</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-3"><span className="text-slate-500">Status</span><span className="font-medium text-emerald-600">Active</span></div>
                <div className="flex justify-between border-b pb-3"><span className="text-slate-500">Role</span><span className="font-medium">{isAdmin ? "Admin" : "Patient"}</span></div>
                <div className="flex justify-between border-b pb-3"><span className="text-slate-500">User ID</span><span className="font-mono text-slate-900">{user?.id.slice(0, 8)}...</span></div>
              </div>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Profile completeness</h3>
              <Progress value={completion} className="h-2 mb-2" />
              <p className="text-sm text-slate-500">{completion}% complete</p>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Account actions</h3>
                <Button onClick={signOut} variant="ghost" className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl mt-4">Sign out</Button>
            </Card>
          </div>
        </div>
      </div>
      
      <AvatarCropDialog open={!!cropSrc} imageSrc={cropSrc} onCancel={() => setCropSrc(null)} onCropped={handleCropped} busy={uploading} />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update password?</AlertDialogTitle>
            <AlertDialogDescription>You will be signed out to re-authenticate.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangePassword}>Update & Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
