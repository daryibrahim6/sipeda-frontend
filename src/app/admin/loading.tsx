import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
    </div>
  );
}
