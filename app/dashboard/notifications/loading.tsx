export default function NotificationsLoading() {
  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 animate-pulse">
        <div>
          <div className="h-7 w-40 bg-white rounded mb-2"/>
          <div className="h-4 w-56 bg-white rounded"/>
        </div>
        <div className="h-7 w-28 border border-[#1F4E79]/20 rounded-lg"/>
      </div>
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="rounded-xl border border-[#E4E7EC] bg-white p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#EDEFF2] mt-1.5 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 mb-1">
                  <div className="h-3 w-16 bg-[#EDEFF2] rounded"/>
                  <div className="h-3 w-20 bg-white rounded"/>
                </div>
                <div className="h-4 w-3/4 bg-white rounded mb-1.5"/>
                <div className="h-3 w-full bg-white rounded"/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
