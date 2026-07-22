import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Mail, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPatientCreate = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setBusy(true);
    try {
      if (asAdmin) {
        const { error } = await supabase
          .from("admin_invites")
          .insert({ email: clean });
        if (error) throw error;
        toast.success("Admin invite created. They'll be promoted on signup / next sign-in.");
      } else {
        // Store a pending invite record via same table? We only have admin_invites.
        // For patients, ask them to self-sign-up: send them the sign-up link.
        const link = `${window.location.origin}/auth`;
        await navigator.clipboard.writeText(link).catch(() => {});
        toast.success("Sign-up link copied. Share it with the patient to complete their account.");
      }
      navigate("/admin/patients");
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create Patient</h1>
          <p className="text-sm text-muted-foreground">Invite a new patient or admin to La Dune Clinic</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/patients"><ArrowLeft className="w-4 h-4 mr-2" />Back to Patients</Link>
        </Button>
      </div>

      <Card className="max-w-2xl p-6 border-border">
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">New person</div>
              <div className="text-xs text-muted-foreground">Fill in the details below</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 …" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={asAdmin}
              onChange={(e) => setAsAdmin(e.target.checked)}
              className="rounded border-border"
            />
            <Shield className="w-4 h-4 text-primary" />
            Promote to admin automatically on signup
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/patients")}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              <Mail className="w-4 h-4 mr-2" />
              {busy ? "Saving…" : asAdmin ? "Send admin invite" : "Copy signup link"}
            </Button>
          </div>

          {!asAdmin && (
            <p className="text-xs text-muted-foreground">
              Patients register themselves through <code>/auth</code>. Once they sign up with this email, they'll appear in the Patients list.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default AdminPatientCreate;
