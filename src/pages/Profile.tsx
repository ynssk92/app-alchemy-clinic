import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  User as UserIcon, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

import { ProfileOverviewCard } from "@/components/profile/ProfileOverviewCard";
import { ProfileQuickActions } from "@/components/profile/ProfileQuickActions";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { MedicalInfoCard } from "@/components/profile/MedicalInfoCard";
import { ProfessionalInfoCard } from "@/components/profile/ProfessionalInfoCard";
import { SecurityCard } from "@/components/profile/SecurityCard";
import { NotificationSettingsCard } from "@/components/profile/NotificationSettingsCard";
import { PrivacySettingsCard } from "@/components/profile/PrivacySettingsCard";
import { StickySaveBar } from "@/components/profile/StickySaveBar";
import logo from "@/assets/logo.png";

const Profile = () => {
  const { user, signOut, isAdmin, isDoctor, isPatient, isAssistant } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [profileData, setProfileData] = useState<any>({});
  const [initialData, setInitialData] = useState<any>({});
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPassword, setPendingPassword] = useState("");

  const loadAvatar = async (path: string | null) => {
    if (!path) return setAvatarUrl(null);
    try {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      setAvatarUrl(data?.signedUrl || null);
    } catch (err) {
      console.error("Error loading avatar:", err);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Fetch core profile
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profErr) throw profErr;

      let combinedData: any = { ...profile };

      // Fetch specific role data
      if (isPatient) {
        const { data: patient } = await supabase
          .from("patient_intake")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (patient) combinedData = { ...combinedData, ...patient };
      }

      if (isDoctor) {
        const { data: doctor } = await supabase
          .from("doctors")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (doctor) combinedData = { ...combinedData, ...doctor };
      }

      setProfileData(combinedData);
      setInitialData(combinedData);
      if (combinedData.avatar_url) loadAvatar(combinedData.avatar_url);
    } catch (err: any) {
      toast.error("Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isDoctor, isPatient]);

  const handleChange = (field: string, value: any) => {
    setProfileData((prev: any) => {
      const newData = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(newData) !== JSON.stringify(initialData));
      return newData;
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const currentPrefs = profileData.notification_preferences || {};
    handleChange("notification_preferences", { ...currentPrefs, [key]: value });
  };

  const handlePrivacyChange = (key: string, value: any) => {
    const currentSettings = profileData.privacy_settings || {};
    handleChange("privacy_settings", { ...currentSettings, [key]: value });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      // Split data for different tables
      const profileFields = [
        'full_name', 'phone', 'gender', 'nationality', 'address', 'city', 
        'country', 'preferred_language', 'emergency_contact_name', 
        'emergency_contact_phone', 'preferred_communication', 'dob',
        'notification_preferences', 'privacy_settings'
      ];
      
      const profileUpdate: any = {};
      profileFields.forEach(f => {
        if (profileData[f] !== undefined) profileUpdate[f] = profileData[f];
      });

      const { error: profErr } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);
      
      if (profErr) throw profErr;

      // Update patient intake if applicable
      if (isPatient) {
        const patientFields = [
          'blood_group', 'insurance_provider', 'insurance_number', 
          'allergies', 'medical_conditions'
        ];
        const patientUpdate: any = {};
        patientFields.forEach(f => {
          if (profileData[f] !== undefined) patientUpdate[f] = profileData[f];
        });
        
        // Also sync shared fields
        patientUpdate.first_name = profileData.first_name || profileData.full_name?.split(' ')[0] || '';
        patientUpdate.last_name = profileData.last_name || profileData.full_name?.split(' ').slice(1).join(' ') || '';
        patientUpdate.phone = profileData.phone;
        patientUpdate.dob = profileData.dob;
        patientUpdate.city = profileData.city;
        patientUpdate.country = profileData.country;

        await supabase
          .from("patient_intake")
          .update(patientUpdate)
          .eq("user_id", user.id);
      }

      // Update doctor if applicable
      if (isDoctor) {
        const doctorFields = [
          'license_number', 'experience_years', 'consultation_duration', 
          'biography', 'languages'
        ];
        const doctorUpdate: any = {};
        doctorFields.forEach(f => {
          if (profileData[f] !== undefined) doctorUpdate[f] = profileData[f];
        });
        doctorUpdate.full_name = profileData.full_name;

        await supabase
          .from("doctors")
          .update(doctorUpdate)
          .eq("id", user.id);
      }

      setInitialData(profileData);
      setHasChanges(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      
      if (upErr) throw upErr;

      if (profileData.avatar_url) {
        await supabase.storage.from("avatars").remove([profileData.avatar_url]);
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", user.id);
      
      if (updErr) throw updErr;

      handleChange("avatar_url", path);
      await loadAvatar(path);
      setCropSrc(null);
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePassword = (password: string) => {
    setPendingPassword(password);
    setConfirmOpen(true);
  };

  const confirmPasswordChange = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pendingPassword });
      if (error) throw error;
      
      toast.success("Password updated — signing you out.");
      setConfirmOpen(false);
      setTimeout(async () => {
        await signOut();
        navigate("/auth");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profileData.id) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleLabel = isAdmin ? "Administrator" : isDoctor ? "Doctor" : isAssistant ? "Receptionist" : "Patient";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Seo
        title={`${profileData.full_name || 'Profile'} — La Dune`}
        description="Manage your professional or patient profile, medical info and security settings."
        path="/profile"
      />
      
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
              <ArrowLeft className="w-4 h-4 text-primary group-hover:text-white" />
            </div>
            <img src={logo} alt="Logo" className="h-8" />
          </Link>
          <div className="flex items-center gap-3">
             <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-1.5">
               <CheckCircle2 className="w-3.5 h-3.5" />
               Changes Synced
             </span>
          </div>
        </div>
      </nav>

      <main className="container max-w-[1280px] mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {(profileData.full_name || "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">{profileData.full_name || "User Profile"}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profileData.created_at).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-8">
          <aside className="space-y-6">
            <ProfileOverviewCard 
              user={user} 
              profile={profileData} 
              avatarUrl={avatarUrl} 
              onUploadClick={() => fileInputRef.current?.click()}
              uploading={uploading}
            />
            <ProfileQuickActions />
            
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarSelect}
            />
          </aside>

          <section className="space-y-8">
            <PersonalInfoCard 
              formData={profileData} 
              onChange={handleChange} 
              userEmail={user?.email}
            />

            {isPatient && (
              <MedicalInfoCard 
                formData={profileData} 
                onChange={handleChange} 
              />
            )}

            {isDoctor && (
              <ProfessionalInfoCard 
                formData={profileData} 
                onChange={handleChange} 
              />
            )}

            <SecurityCard 
              onUpdatePassword={handleUpdatePassword} 
              loading={saving} 
            />

            <NotificationSettingsCard 
              preferences={profileData.notification_preferences} 
              onChange={handleNotificationChange} 
            />

            <PrivacySettingsCard 
              settings={profileData.privacy_settings} 
              onChange={handlePrivacyChange} 
            />
          </section>
        </div>
      </main>

      <StickySaveBar 
        show={hasChanges} 
        loading={saving} 
        onSave={handleSave} 
        onDiscard={() => {
          setProfileData(initialData);
          setHasChanges(false);
          toast.info("Changes discarded");
        }}
      />

      <AvatarCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onCropped={handleCropped}
        busy={uploading}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Confirm Password Update</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Changing your password will sign you out of all devices. You will need to log in again with your new credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmPasswordChange}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Update & Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
