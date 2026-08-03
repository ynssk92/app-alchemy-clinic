import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRound } from "lucide-react";

const field =
  "mt-2 h-12 rounded-2xl border-transparent bg-muted/70 text-base focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15";

export const GuestDetailsForm = () => {
  const { register, setValue, watch, formState: { errors } } = useFormContext<any>();
  const gender = watch("gender");

  const Err = ({ name }: { name: string }) =>
    errors?.[name] ? (
      <p className="mt-1.5 text-xs font-medium text-destructive">{String((errors as any)[name]?.message)}</p>
    ) : null;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
        Vos coordonnées
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pas besoin de compte : nous créons votre dossier patient automatiquement.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="first_name" className="text-sm font-semibold">Prénom *</Label>
          <Input id="first_name" autoComplete="given-name" className={field} {...register("first_name")} />
          <Err name="first_name" />
        </div>
        <div>
          <Label htmlFor="last_name" className="text-sm font-semibold">Nom *</Label>
          <Input id="last_name" autoComplete="family-name" className={field} {...register("last_name")} />
          <Err name="last_name" />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
          <Input id="email" type="email" autoComplete="email" className={field} {...register("email")} />
          <Err name="email" />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm font-semibold">Téléphone *</Label>
          <Input id="phone" type="tel" autoComplete="tel" className={field} {...register("phone")} />
          <Err name="phone" />
        </div>
        <div>
          <Label htmlFor="dob" className="text-sm font-semibold">Date de naissance</Label>
          <Input id="dob" type="date" className={field} {...register("dob")} />
          <Err name="dob" />
        </div>
        <div>
          <Label htmlFor="gender" className="text-sm font-semibold">Genre</Label>
          <Select value={gender || ""} onValueChange={(v) => setValue("gender", v, { shouldValidate: true })}>
            <SelectTrigger id="gender" className={field}>
              <SelectValue placeholder="Préférence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Femme</SelectItem>
              <SelectItem value="male">Homme</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsForm;
