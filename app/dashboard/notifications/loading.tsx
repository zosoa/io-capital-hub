export default function NotificationsLoading() {
  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 animate-pulse">
        <div>
          <div className="h-7 w-40 bg-[#F7F5F1] rounded mb-2"/>
          <div className="h-4 w-56 bg-[#F7F5F1] rounded"/>
        </div>
        <div className="h-7 w-28 border border-[#BC5A34]/20 rounded-lg"/>
      </div>
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="rounded-xl border border-[#EAE4D8] bg-white p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#EFEBE3] mt-1.5 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 mb-1">
                  <div className="h-3 w-16 bg-[#EFEBE3] rounded"/>
                  <div className="h-3 w-20 bg-[#F7F5F1] rounded"/>
                </div>
                <div className="h-4 w-3/4 bg-[#F7F5F1] rounded mb-1.5"/>
                <div className="h-3 w-full bg-[#F7F5F1] rounded"/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
