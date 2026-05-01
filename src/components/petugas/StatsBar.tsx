'use client';

type StatsBarProps = {
    total: number;
    berhasil: number;
    gagal: number;
    tidak_memenuhi: number;
};

export function StatsBar({ total, berhasil, gagal, tidak_memenuhi }: StatsBarProps) {
    const items = [
        { label: 'Total', val: total, cls: 'text-white' },
        { label: 'Berhasil', val: berhasil, cls: 'text-green-400' },
        { label: 'Gagal', val: gagal, cls: 'text-red-400' },
        { label: 'Tdk Memenuhi', val: tidak_memenuhi, cls: 'text-yellow-400' },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            {items.map(s => (
                <div key={s.label} className="bg-gray-900 rounded-xl border border-white/5 p-3 text-center">
                    <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{s.label}</div>
                </div>
            ))}
        </div>
    );
}
