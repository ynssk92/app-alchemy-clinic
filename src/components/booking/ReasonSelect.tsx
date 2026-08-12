import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export interface ConsultationReason {
  id: string;
  category: string;
  label: string;
  icon: string | null;
  is_other: boolean;
  duration?: number;
  price?: number;
}

interface ReasonSelectProps {
  value?: string;
  onChange: (reason?: ConsultationReason) => void;
  invalid?: boolean;
}

export const ReasonSelect = ({ value, onChange, invalid }: ReasonSelectProps) => {
  const [open, setOpen] = useState(false);
  const [reasons, setReasons] = useState<ConsultationReason[]>([]);

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, duration, price, category:service_categories(name)")
      .eq("active", true)
      .order("name", { ascending: true })
      .then(({ data }) => {
        const mapped: ConsultationReason[] = (data || []).map((s: any) => ({
          id: s.id,
          label: s.name,
          category: s.category?.name || "General",
          icon: "Stethoscope",
          is_other: false,
          duration: s.duration,
          price: s.price
        }));
        
        // Add "Other" option
        mapped.push({
          id: "other",
          label: "Other / Custom Consultation",
          category: "Custom",
          icon: "Search",
          is_other: true
        });
        
        setReasons(mapped);
      });
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, ConsultationReason[]>();
    reasons.forEach((r) => map.set(r.category, [...(map.get(r.category) ?? []), r]));
    return [...map.entries()];
  }, [reasons]);

  const selected = reasons.find((r) => r.id === value);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "mt-2 h-14 w-full justify-between rounded-2xl border-transparent bg-muted/70 px-4 text-left text-base font-normal transition-all duration-200 hover:bg-muted",
            invalid && "border-destructive ring-2 ring-destructive/20"
          )}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <Stethoscope className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? selected.label : "Rechercher un service…"}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] min-w-[min(92vw,320px)] rounded-2xl p-0"
      >
        <Command>
          <CommandInput placeholder="Rechercher un service…" />
          <CommandList className="max-h-[min(60vh,320px)]">
            <CommandEmpty>Aucun service trouvé.</CommandEmpty>
            {groups.map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((r) => {
                  return (
                    <CommandItem
                      key={r.id}
                      value={`${r.label} ${r.category}`}
                      onSelect={() => {
                        onChange(r.id === value ? undefined : r);
                        setOpen(false);
                      }}
                      className="gap-2.5 rounded-xl py-2.5 cursor-pointer"
                    >
                      <Stethoscope className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{r.label}</span>
                        {!r.is_other && (
                          <span className="text-[10px] text-muted-foreground">
                            {r.duration} min • {r.price} MAD
                          </span>
                        )}
                      </div>
                      {r.id === value && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ReasonSelect;
