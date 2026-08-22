import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, User, Stethoscope, Calendar, Receipt, Settings, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  type: 'patient' | 'doctor' | 'appointment' | 'invoice' | 'service';
  title: string;
  subtitle?: string;
  link: string;
};

type SearchGroups = {
  patients: SearchResult[];
  doctors: SearchResult[];
  appointments: SearchResult[];
  invoices: SearchResult[];
  services: SearchResult[];
};

export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  const [results, setResults] = useState<SearchGroups | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Clean query and handle multi-word search
      const cleanQuery = debouncedQuery.trim();
      const searchTerm = `%${cleanQuery}%`;
      const words = cleanQuery.split(/\s+/).filter(w => w.length > 0);
      
      // For multi-word search, we want to match patients where name components match the words
      // e.g. "Rabie Kenzi" matches if (first_name ilike %Rabie% AND last_name ilike %Kenzi%) OR (first_name ilike %Kenzi% AND last_name ilike %Rabie%)
      let patientQuery = supabase.from('patients').select('id, first_name, last_name, phone, email, patient_number, national_id, nationality');
      
      if (words.length >= 2) {
        const word1 = `%${words[0]}%`;
        const word2 = `%${words[1]}%`;
        patientQuery = patientQuery.or(`and(first_name.ilike.${word1},last_name.ilike.${word2}),and(first_name.ilike.${word2},last_name.ilike.${word1}),phone.ilike.${searchTerm},email.ilike.${searchTerm},patient_number.ilike.${searchTerm},national_id.ilike.${searchTerm}`);
      } else {
        patientQuery = patientQuery.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm},patient_number.ilike.${searchTerm},national_id.ilike.${searchTerm}`);
      }

      try {
        const [
          { data: patients },
          
          // Doctors Search
          supabase
            .from('doctors')
            .select('id, full_name, specialty:specialties(name)')
            .or(`full_name.ilike.${searchTerm}`)
            .limit(5),

          // Appointments Search
          supabase
            .from('appointments')
            .select('id, reference, appointment_date, appointment_time, status, patient:patients(first_name, last_name)')
            .or(`reference.ilike.${searchTerm},status.ilike.${searchTerm}`)
            .limit(5),

          // Invoices Search
          supabase
            .from('invoices')
            .select('id, invoice_number, status, patient:profiles(full_name)')
            .or(`invoice_number.ilike.${searchTerm},status.ilike.${searchTerm}`)
            .limit(5),

          // Services Search
          supabase
            .from('services')
            .select('id, name, code, category:service_categories(name)')
            .or(`name.ilike.${searchTerm},code.ilike.${searchTerm}`)
            .limit(5)
        ]);

        const groups: SearchGroups = {
          patients: (patients || []).map(p => ({
            id: p.id,
            type: 'patient',
            title: `${p.first_name} ${p.last_name}`,
            subtitle: p.phone || p.email || p.patient_number || '',
            link: `/admin/patients/details?id=${p.id}`
          })),
          doctors: (doctors || []).map(d => ({
            id: d.id,
            type: 'doctor',
            title: d.full_name,
            subtitle: (d.specialty as any)?.name || '',
            link: `/admin/doctors/details?id=${d.id}`
          })),
          appointments: (appointments || []).map(a => ({
            id: a.id,
            type: 'appointment',
            title: `${(a.patient as any)?.first_name} ${(a.patient as any)?.last_name}`,
            subtitle: `${a.appointment_date} · ${a.appointment_time} (${a.reference || a.status})`,
            link: `/admin/appointments` // Could be improved if there's a specific details page
          })),
          invoices: (invoices || []).map(i => ({
            id: i.id,
            type: 'invoice',
            title: i.invoice_number,
            subtitle: `${(i.patient as any)?.full_name} (${i.status})`,
            link: `/admin/billing/invoices` // Could be improved if there's a specific details page
          })),
          services: (services || []).map(s => ({
            id: s.id,
            type: 'service',
            title: s.name,
            subtitle: `${(s.category as any)?.name || ''} ${s.code ? `(${s.code})` : ''}`,
            link: `/admin/billing/services`
          }))
        };

        setResults(groups);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  const allResults = results ? [
    ...results.patients,
    ...results.doctors,
    ...results.appointments,
    ...results.invoices,
    ...results.services
  ] : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    setIsOpen(false);
    setQuery("");
  };

  const hasResults = allResults.length > 0;

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("nav.searchPlaceholder", { defaultValue: "Search patients, doctors, appointments…" })} 
          className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-sm transition-shadow" 
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {!isLoading && !hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">No results found</p>
              <p>No patients, doctors, appointments or invoices match your search.</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-2 space-y-4">
              {results && Object.entries(results).map(([key, group]) => {
                if (group.length === 0) return null;
                const groupTitle = key.toUpperCase();
                
                return (
                  <div key={key}>
                    <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                      {groupTitle}
                    </div>
                    <div className="space-y-1 mt-1">
                      {group.map((result) => {
                        const globalIdx = allResults.indexOf(result);
                        const isSelected = selectedIndex === globalIdx;
                        
                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                              isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                            )}
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {result.type === 'patient' && <User className="w-4 h-4" />}
                              {result.type === 'doctor' && <Stethoscope className="w-4 h-4" />}
                              {result.type === 'appointment' && <Calendar className="w-4 h-4" />}
                              {result.type === 'invoice' && <Receipt className="w-4 h-4" />}
                              {result.type === 'service' && <Settings className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
