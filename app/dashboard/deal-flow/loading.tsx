// Next 15 auto-mounts this while the async server component streams.
// Audit I-L4: visual continuity instead of a blank flash when navigating
// between the project-owner view and the deal-flow list.

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#EAE4D8] bg-white p-5 flex flex-col animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-24 bg-[#F7F5F1] rounded-full"/>
        <div className="h-4 w-12 bg-[#F7F5F1] rounded"/>
      </div>
      <div className="h-4 w-4/5 bg-[#F7F5F1] rounded mb-2"/>
      <div className="h-3 w-full bg-[#F7F5F1] rounded mb-1"/>
      <div className="h-3 w-3/4 bg-[#F7F5F1] rounded mb-4"/>
      <div className="border-t border-[#EAE4D8] pt-3 mt-auto flex gap-2">
        <div className="h-5 w-20 bg-[#F7F5F1] rounded-full"/>
        <div className="h-5 w-24 bg-[#F7F5F1] rounded-full"/>
        <div className="ml-auto h-5 w-20 bg-[#F7F5F1] rounded"/>
      </div>
      <div className="mt-4 h-8 rounded-lg border border-[#BC5A34]/20 bg-[#BC5A34]/5"/>
    </div>
  );
}

export default function DealFlowLoading() {
  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="h-7 w-40 bg-[#F7F5F1] rounded mb-2 animate-pulse"/>
        <div className="h-4 w-64 bg-[#F7F5F1] rounded animate-pulse"/>
      </div>
      <div className="mb-6 flex gap-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-7 w-28 bg-[#F7F5F1] rounded-full animate-pulse"/>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i}/>)}
      </div>
    </div>
  );
}
