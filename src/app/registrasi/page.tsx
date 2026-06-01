'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegistrasiPage() {
    const router = useRouter();
    const [kode, setKode] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = kode.trim().toUpperCase();
        if (!trimmed) return;
        router.push(`/registrasi/${encodeURIComponent(trimmed)}`);
    }

    return (
        <main id="main" className="min-h-[70vh] flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
                        <Search className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Cek Status Registrasi</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                        Masukkan kode registrasi yang kamu terima saat mendaftar donor.
                    </p>
                </div>

                <form onSubmit={handleSearch}>
                    <Card className="p-6 space-y-4">
                        <Input
                            id="kode"
                            type="text"
                            label="Kode Registrasi"
                            value={kode}
                            onChange={e => setKode(e.target.value.toUpperCase())}
                            placeholder="Contoh: REG-2025-XXXXXX"
                            className="font-mono font-bold placeholder:font-medium uppercase"
                        />

                        <Button type="submit" disabled={!kode.trim()} className="w-full" icon={<Search className="w-4 h-4" />}>
                            Cek Status
                        </Button>
                    </Card>
                </form>

                <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
                    Kode registrasi dikirim saat kamu mendaftar jadwal donor. Format: REG-YYYY-XXXXXX
                </p>
            </div>
        </main>
    );
}
