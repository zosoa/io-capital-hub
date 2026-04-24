export default function AdminProjectsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-40 bg-white/8 rounded mb-2"/>
        <div className="h-4 w-56 bg-white/5 rounded"/>
      </div>
      <div className="mb-6 flex gap-2 flex-wrap animate-pulse">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-8 w-28 bg-white/5 rounded-full"/>
        ))}
      </div>
      <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
        <div className="hidden sm:flex gap-4 px-5 py-3 border-b border-white/8 animate-pulse">
          <div className="h-3 w-24 bg-white/10 rounded"/>
          <div className="h-3 w-20 bg-white/10 rounded"/>
          <div className="ml-auto h-3 w-24 bg-white/10 rounded"/>
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 5 ? "border-b border-white/5" : ""} animate-pulse`}>
            <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="h-4 w-48 bg-white/8 rounded mb-1.5"/>
              <div className="h-3 w-36 bg-white/5 rounded"/>
            </div>
            <div className="h-6 w-20 bg-white/5 rounded-full"/>
            <div className="h-5 w-16 bg-white/5 rounded"/>
          </div>
        ))}
      </div>
    </div>
  );
}
