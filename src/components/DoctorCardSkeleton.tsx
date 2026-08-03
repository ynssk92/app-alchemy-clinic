export const DoctorCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="flex animate-pulse flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
  >
    <div className="mb-5 h-[140px] w-[140px] rounded-full bg-muted" />
    <div className="h-6 w-40 rounded-full bg-muted" />
    <div className="mt-3 h-5 w-24 rounded-full bg-muted/70" />
    <div className="mt-4 h-4 w-36 rounded-full bg-muted/70" />
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <div className="h-6 w-20 rounded-full bg-muted/70" />
      <div className="h-6 w-20 rounded-full bg-muted/70" />
      <div className="h-6 w-20 rounded-full bg-muted/70" />
    </div>
    <div className="mt-5 h-4 w-full rounded-full bg-muted/70" />
    <div className="mt-2 h-4 w-4/5 rounded-full bg-muted/70" />
    <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
      <div className="h-10 flex-1 rounded-xl bg-muted" />
      <div className="h-10 flex-1 rounded-xl bg-muted/70" />
    </div>
  </div>
);

export default DoctorCardSkeleton;
