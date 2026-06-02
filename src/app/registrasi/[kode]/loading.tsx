export default function RegistrasiDetailLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6 mx-auto" />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
