import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Upload, User as UserIcon, Lock, CheckCircle2, Copy, ShieldCheck, Mail, Calendar, Clock, LayoutGrid } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import { useAppSettings } from "@/hooks/useAppSettings";
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
  const { user, signOut, isAdmin, isAssistant } = useAuth();
  const { logoUrl } = useAppSettings();
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
    <div className="min-h-screen bg-[#F7F9FC]">
      <Seo title="Profile & Settings" description="Manage your account." path="/profile" />
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full h-[64px] md:h-[72px] bg-white border-b border-slate-100 flex items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-[1200px] flex items-center justify-between">
          <Link to={isAdmin || isAssistant ? "/admin" : "/"} className="flex items-center gap-3 shrink-0 transition-transform duration-300 hover:scale-105">
            <img src={logoUrl} alt="La Dune Clinique Dentaire" className="w-[120px] md:w-[150px] h-auto object-contain" />
          </Link>
          
          <div className="flex items-center gap-4">
            {(isAdmin || isAssistant) && (
              <Button 
                onClick={() => navigate("/admin")}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 px-4 flex items-center gap-2 transition-all shadow-sm"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline font-semibold">Admin Panel</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto p-6 md:p-10">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 mb-6 -ml-3 flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
          <p className="text-slate-500 mt-1">Manage your personal information, account security and preferences.</p>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Account overview</h3>
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-slate-500">Status</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase tracking-wider text-[10px]">Active</Badge>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-slate-500">Role</span>
                  <span className="font-bold text-slate-900 uppercase tracking-tighter text-[11px]">{isAdmin ? "Admin" : "Patient"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-slate-500">User ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-900">{user?.id.slice(0, 8)}...</span>
                    <button onClick={() => { navigator.clipboard.writeText(user?.id || ""); toast.success("ID Copied"); }} className="p-1 hover:bg-slate-100 rounded transition-colors">
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Profile completeness</h3>
              <Progress value={completion} className="h-2 mb-2" />
              <p className="text-sm text-slate-500 font-medium">{completion}% complete</p>
              <p className="text-[11px] text-slate-400 mt-1 italic">Complete your profile to keep your account information up to date.</p>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Connected accounts</h3>
              <p className="text-[12px] text-slate-500 mb-6">Manage the services connected to your account.</p>
              <div className="space-y-3">
                {[
                  { id: "google", name: "Google", icon: (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 43c5.4 0 10.3-2 14-5.3l-6.5-5.3C29.4 34 26.8 35 24 35c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.4 38.7 16.1 43 24 43z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.7l6.5 5.3C41 35 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                    </svg>
                  )},
                  { id: "apple", name: "Apple", icon: (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 384 512">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                    </svg>
                  )},
                ].map((provider) => {
                  const isLinked = user?.app_metadata?.providers?.includes(provider.id);
                  return (
                    <div key={provider.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        {provider.icon}
                        <span className="text-xs font-semibold text-slate-700">{provider.name}</span>
                      </div>
                      {isLinked ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Linked</span>
                        </div>
                      ) : (
                        <button 
                          className="text-[10px] font-bold text-primary hover:underline"
                          onClick={() => supabase.auth.signInWithOAuth({ provider: provider.id as 'google' | 'apple', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Account activity</h3>
              <p className="text-[12px] text-slate-500 mb-6">Security and session overview.</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                  <div><p className="text-[12px] font-bold text-slate-900">Email verified</p><p className="text-[10px] text-slate-500">{user?.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString() : "Verified"}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Clock className="w-3.5 h-3.5" /></div>
                  <div><p className="text-[12px] font-bold text-slate-900">Last sign-in</p><p className="text-[10px] text-slate-500">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Just now"}</p></div>
                </div>
              </div>
            </Card>

            <Card className="p-8 rounded-[20px] shadow-soft border-slate-200/60 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Account actions</h3>
              <Button onClick={signOut} variant="ghost" className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl mt-4 h-11 text-sm font-semibold">Sign out</Button>
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
