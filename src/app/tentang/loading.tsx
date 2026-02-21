
export default function TentangLoading() {
    return (
        <>
<main id="main" aria-busy="true" className="animate-pulse">
                {/* Hero */}
                <section className="bg-gray-950 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-4 w-24 bg-gray-800 rounded mb-4 mx-auto" />
                        <div className="h-12 w-72 bg-gray-800 rounded-lg mb-4 mx-auto" />
                        <div className="h-5 w-96 bg-gray-700 rounded mx-auto" />
                    </div>
                </section>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                                <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2" />
                                <div className="h-4 w-24 bg-gray-100 rounded mx-auto" />
                            </div>
                        ))}
                    </div>

                    {/* Content blocks */}
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-3">
                                <div className="h-4 w-20 bg-red-100 rounded" />
                                <div className="h-8 w-64 bg-gray-200 rounded-lg" />
                                <div className="h-4 w-full bg-gray-100 rounded" />
                                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                                <div className="h-4 w-5/6 bg-gray-100 rounded" />
                            </div>
                            <div className="h-64 bg-gray-100 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </main>
</>
    );
}
