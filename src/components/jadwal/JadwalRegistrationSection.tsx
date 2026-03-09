'use client';

import { useState, useCallback } from 'react';
import type { Schedule } from '@/lib/types';
import { getScheduleById } from '@/lib/api';
import { RegisterForm } from '@/components/jadwal/RegisterForm';

/**
 * Client wrapper for RegisterForm.
 * After registration, refetches schedule from Supabase directly
 * (bypassing Vercel ISR cache) so the "Sisa Kuota" info box
 * in the header updates.
 */
export function JadwalRegistrationSection({ schedule: initialSchedule }: { schedule: Schedule }) {
    const [schedule, setSchedule] = useState(initialSchedule);

    const isFull = schedule.status === 'penuh' || schedule.sisa_kuota === 0;

    // Refresh schedule from Supabase directly
    const handleRegistrationSuccess = useCallback(async () => {
        try {
            const fresh = await getScheduleById(schedule.id);
            if (fresh) setSchedule(fresh);
        } catch { /* silent */ }
    }, [schedule.id]);

    if (isFull) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-sm font-semibold text-red-700">Kuota Penuh</p>
                <p className="text-xs text-red-500 mt-1">Silakan pilih jadwal lain yang tersedia.</p>
            </div>
        );
    }

    return <RegisterForm schedule={schedule} onRegistrationSuccess={handleRegistrationSuccess} />;
}
