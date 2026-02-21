
export default function StokDarahLoading() {
  return (
    <>
<main id="main" className="animate-pulse">
        {/* Header skeleton */}
        <div className="bg-gray-950 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-3 w-20 bg-gray-800 rounded mb-3" />
            <div className="h-10 w-64 bg-gray-800 rounded mb-3" />
            <div className="h-4 w-96 bg-gray-800 rounded" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Stok grid skeleton */}
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-72 bg-gray-100 rounded mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded" />
                  <div className="h-7 w-8 bg-gray-200 rounded" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Lokasi cards skeleton */}
          <div className="space-y-4">
            <div className="h-7 w-40 bg-gray-200 rounded mb-6" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="h-4 w-16 bg-gray-200 rounded-full mb-2" />
                  <div className="h-5 w-48 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                        <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1" />
                        <div className="h-3 w-full bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
</>
  );
}