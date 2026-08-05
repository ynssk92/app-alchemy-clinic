export const DoctorCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="flex animate-pulse flex-col overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white p-8 shadow-soft"
  >
    <div className="relative mb-6 flex justify-center">
      <div className="h-[150px] w-[150px] rounded-full bg-slate-100" />
    </div>
    <div className="mx-auto h-8 w-48 rounded-full bg-slate-100" />
    <div className="mx-auto mt-3 h-6 w-24 rounded-full bg-slate-100/70" />
    
    <div className="mt-8 grid grid-cols-2 gap-4">
      <div className="h-12 rounded-xl bg-slate-50" />
      <div className="h-12 rounded-xl bg-slate-50" />
      <div className="h-12 rounded-xl bg-slate-50" />
      <div className="h-12 rounded-xl bg-slate-50" />
    </div>
    
    <div className="mt-8 h-16 rounded-2xl bg-slate-50" />
    
    <div className="mt-8 space-y-3">
      <div className="h-12 w-full rounded-xl bg-slate-100" />
      <div className="h-10 w-full rounded-xl bg-slate-50" />
    </div>
  </div>
);

export default DoctorCardSkeleton;