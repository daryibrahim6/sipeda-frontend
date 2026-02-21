
export default function FaqLoading() {
    return (
        <>
<main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-busy="true">
                {/* Header */}
                <div className="text-center mb-12 animate-pulse">
                    <div className="h-4 w-20 bg-red-100 rounded mx-auto mb-3" />
                    <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-3" />
                    <div className="h-5 w-96 bg-gray-100 rounded mx-auto" />
                </div>

                {/* FAQ items */}
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl px-6 py-4 animate-pulse">
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-4 bg-gray-200 rounded flex-1" style={{ width: `${60 + (i % 4) * 10}%` }} />
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
</>
    );
}
