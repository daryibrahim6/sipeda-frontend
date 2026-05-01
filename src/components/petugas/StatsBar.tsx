'use client';

type StatsBarProps = {
    total: number;
    berhasil: number;
    gagal: number;
    tidak_memenuhi: number;
};

export function StatsBar({ total, berhasil, gagal, tidak_memenuhi }: StatsBarProps) {
    const items = [
        { label: 'Total', val: total, cls: 'text-gray-900' },
        { label: 'Berhasil', val: berhasil, cls: 'text-green-600' },
        { label: 'Gagal', val: gagal, cls: 'text-red-600' },
        { label: 'Tdk Memenuhi', val: tidak_memenuhi, cls: 'text-amber-500' },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            {items.map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
                    <div className={`text-xl font-extrabold ${s.cls}`}>{s.val}</div>
                    <div className="text-[10px] font-bold text-gray-500 mt-1">{s.label}</div>
                </div>
            ))}
        </div>
    );
}
