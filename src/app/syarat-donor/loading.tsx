
export default function SyaratDonorLoading() {
    return (
        <>
<main id="main" aria-busy="true" className="animate-pulse">
                {/* Hero */}
                <section className="bg-gray-950 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="h-4 w-24 bg-gray-800 rounded mb-4 mx-auto" />
                        <div className="h-12 w-80 bg-gray-800 rounded-lg mb-4 mx-auto" />
                        <div className="h-5 w-96 bg-gray-700 rounded mx-auto" />
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                    {/* Requirements grid */}
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Process steps */}
                    <div>
                        <div className="h-8 w-56 bg-gray-200 rounded-lg mb-6" />
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
</>
    );
}
