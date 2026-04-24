// Skeleton for /dashboard (both client and investor variants). Uses cream
// bg for client (default) — investor dashboard is dark but flashes cream
// for <200ms which is barely perceptible.
export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="h-4 w-24 bg-black/5 rounded mb-2 animate-pulse"/>
        <div className="h-8 w-40 bg-black/8 rounded mb-2 animate-pulse"/>
        <div className="h-4 w-72 bg-black/5 rounded animate-pulse"/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-8 w-12 bg-black/8 rounded mb-2"/>
            <div className="h-3 w-16 bg-black/5 rounded"/>
          </div>
        ))}
      </div>
      <div className="h-4 w-40 bg-black/8 rounded mb-3 animate-pulse"/>
      <div className="card overflow-hidden">
        {[1,2,3].map(i => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 3 ? "border-b border-[#EDE7DE]" : ""} animate-pulse`}>
            <div className="w-8 h-8 rounded-lg bg-black/5 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="h-4 w-48 bg-black/8 rounded mb-1.5"/>
              <div className="h-3 w-32 bg-black/5 rounded"/>
            </div>
            <div className="h-6 w-20 bg-black/5 rounded-full"/>
          </div>
        ))}
      </div>
    </div>
  );
}
