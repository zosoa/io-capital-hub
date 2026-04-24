export default function DashboardProjectsLoading() {
  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 animate-pulse">
        <div>
          <div className="h-7 w-40 bg-black/8 rounded mb-2"/>
          <div className="h-4 w-64 bg-black/5 rounded"/>
        </div>
        <div className="h-10 w-36 bg-[#B8913A]/20 rounded-lg"/>
      </div>
      <div className="mb-6 flex gap-2 animate-pulse">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-8 w-24 bg-black/5 rounded-full"/>
        ))}
      </div>
      <div className="card overflow-hidden">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 4 ? "border-b border-[#EDE7DE]" : ""} animate-pulse`}>
            <div className="w-10 h-10 rounded-lg bg-black/5 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="h-4 w-56 bg-black/8 rounded mb-1.5"/>
              <div className="h-3 w-36 bg-black/5 rounded"/>
            </div>
            <div className="h-6 w-24 bg-black/5 rounded-full"/>
            <div className="h-5 w-20 bg-black/5 rounded"/>
          </div>
        ))}
      </div>
    </div>
  );
}
