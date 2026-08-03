import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { resolveIcon } from "@/lib/pageContent";
import { cn } from "@/lib/utils";

export interface ConsultationReason {
  id: string;
  category: string;
  label: string;
  icon: string | null;
  is_other: boolean;
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
      .from("consultation_reasons")
      .select("id, category, label, icon, is_other")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setReasons((data as ConsultationReason[]) ?? []));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, ConsultationReason[]>();
    reasons.forEach((r) => map.set(r.category, [...(map.get(r.category) ?? []), r]));
    return [...map.entries()];
  }, [reasons]);

  const selected = reasons.find((r) => r.id === value);
  const SelectedIcon = selected ? resolveIcon(selected.icon) : Search;

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
            <SelectedIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? selected.label : "Rechercher un motif…"}
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
          <CommandInput placeholder="Rechercher un motif…" />
          <CommandList className="max-h-[min(60vh,320px)]">
            <CommandEmpty>Aucun motif trouvé.</CommandEmpty>
            {groups.map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((r) => {
                  const Icon = resolveIcon(r.icon);
                  return (
                    <CommandItem
                      key={r.id}
                      value={`${r.label} ${r.category}`}
                      onSelect={() => {
                        onChange(r.id === value ? undefined : r);
                        setOpen(false);
                      }}
                      className="gap-2.5 rounded-xl py-2.5"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="flex-1 truncate">{r.label}</span>
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
