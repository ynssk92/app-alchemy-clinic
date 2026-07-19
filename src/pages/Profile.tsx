import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  phone: z.string().trim().max(30, "Phone must be under 30 characters").optional().or(z.literal("")),
});

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name || "");
        setPhone(data?.phone || "");
        setLoading(false);
      });
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Your Profile — HealthBook"
        description="Update your display name and contact info on HealthBook."
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
          <p className="text-muted-foreground mb-8">Update your display name and contact details.</p>

          <Card className="p-8 border-border bg-card shadow-large">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
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
        </div>
      </section>
    </div>
  );
};

export default Profile;
