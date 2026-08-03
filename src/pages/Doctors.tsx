import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Stethoscope, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { DoctorCard, type DoctorCardData } from "@/components/DoctorCard";
import { DoctorCardSkeleton } from "@/components/DoctorCardSkeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type Doctor = DoctorCardData & {
  rating: number | null;
  is_available: boolean;
  clinics: { name: string } | null;
};

const PAGE_SIZE = 6;
const SELECT =
  "id, full_name, bio, avatar_url, experience_years, rating, is_available, specialties(name), clinics(name)";

/** Keeps supabase-js from parsing the select string at the type level. */
const sel = (s: string): string => s;

/** Strip characters that would break PostgREST filter syntax. */
const sanitize = (q: string) => q.trim().replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").slice(0, 80);

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestId = useRef(0);

  const fetchPage = useCallback(async (rawQuery: string, offset: number) => {
    const q = sanitize(rawQuery);
    let specialtyIds: string[] = [];

    if (q) {
      const { data: specs } = await supabase
        .from("specialties")
        .select(sel("id"))
        .ilike("name", `%${q}%`)
        .returns<{ id: string }[]>();
      specialtyIds = (specs || []).map((s) => s.id);
    }

    let query = supabase.from("doctors").select(sel(SELECT), { count: "exact" });

    if (q) {
      const ors = [`full_name.ilike.%${q}%`, `bio.ilike.%${q}%`];
      if (specialtyIds.length) ors.push(`specialty_id.in.(${specialtyIds.join(",")})`);
      query = query.or(ors.join(","));
    }

    const { data, count, error } = await query
      .order("is_available", { ascending: false })
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)
      .returns<Doctor[]>();

    if (error) throw error;
    return { rows: data || [], count: count ?? 0 };
  }, []);

  // Server-side search — refetch page 1 whenever the debounced query changes
  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    fetchPage(debouncedQuery, 0)
      .then(({ rows, count }) => {
        if (requestId.current !== id) return;
        setDoctors(rows);
        setTotal(count);
      })
      .catch(() => {
        if (requestId.current !== id) return;
        setDoctors([]);
        setTotal(0);
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, [debouncedQuery, fetchPage]);

  const hasMore = doctors.length < total;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const id = requestId.current;
    setLoadingMore(true);
    fetchPage(debouncedQuery, doctors.length)
      .then(({ rows, count }) => {
        if (requestId.current !== id) return;
        setDoctors((prev) => {
          const seen = new Set(prev.map((d) => d.id));
          return [...prev, ...rows.filter((r) => !seen.has(r.id))];
        });
        setTotal(count);
      })
      .catch(() => undefined)
      .finally(() => {
        if (requestId.current === id) setLoadingMore(false);
      });
  }, [hasMore, loadingMore, loading, fetchPage, debouncedQuery, doctors.length]);

  // Infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  const searching = searchQuery !== debouncedQuery;
  const shown = doctors;


  return (
    <PageShell
      title="Find Your Doctor — La Dune Clinique Dentaire"
      description="Browse verified healthcare professionals by name or specialty and book an appointment in seconds."
      path="/doctors"
      heading="Find Your Doctor"
      hideHero
    >
      <section className="relative -mx-4 overflow-hidden px-4 py-16 md:py-24 lg:py-32">
        {/* soft medical background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto max-w-[1280px]">
          {/* header */}
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Stethoscope className="h-3.5 w-3.5" />
              Annuaire des praticiens
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Trouvez votre{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">praticien</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Parcourez notre réseau de professionnels de santé vérifiés et réservez votre
              rendez-vous en quelques secondes.
            </p>

            <div className="relative mx-auto mt-8 max-w-xl">
              <label htmlFor="doctor-search" className="sr-only">Search doctors</label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="doctor-search"
                type="search"
                placeholder="Rechercher par nom ou spécialité..."
                aria-label="Search by doctor name or specialty"
                className="h-14 rounded-2xl border-border bg-card pl-12 text-base shadow-soft focus-visible:ring-4 focus-visible:ring-primary/15"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {!loading && filtered.length > 0 && (
              <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
                {shown.length} / {filtered.length} praticiens affichés
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Aucun praticien à afficher pour le moment.
            </p>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={doctor.is_available ? "" : "relative opacity-60 grayscale"}
                  >
                    {!doctor.is_available && (
                      <span className="absolute right-6 top-6 z-10 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Indisponible
                      </span>
                    )}
                    <DoctorCard doctor={doctor} />
                  </div>
                ))}

                {loadingMore &&
                  Array.from({ length: Math.min(PAGE_SIZE, filtered.length - visible) }).map((_, i) => (
                    <DoctorCardSkeleton key={`more-${i}`} />
                  ))}
              </div>

              {/* sentinel + fallback button */}
              <div ref={sentinelRef} className="mt-12 flex justify-center">
                {hasMore ? (
                  <Button
                    variant="outline"
                    className="rounded-xl px-8 font-semibold"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Chargement…
                      </>
                    ) : (
                      "Afficher plus de praticiens"
                    )}
                  </Button>
                ) : (
                  filtered.length > PAGE_SIZE && (
                    <p className="text-sm text-muted-foreground">
                      Vous avez vu tous nos praticiens.
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default Doctors;
