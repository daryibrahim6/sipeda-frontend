'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Schedule } from '@/lib/types';
import { getScheduleById } from '@/lib/api';
import { RegisterForm } from '@/components/jadwal/RegisterForm';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client wrapper for RegisterForm.
 * Features:
 * 1. Refetches schedule from Supabase after registration (bypass ISR)
 * 2. Supabase Realtime subscription — kuota updates live when
 *    another user registers for the same jadwal
 */
export function JadwalRegistrationSection({ schedule: initialSchedule }: { schedule: Schedule }) {
    const [schedule, setSchedule] = useState(initialSchedule);

    const isFull = schedule.status === 'penuh' || schedule.sisa_kuota === 0;

    // Refresh schedule from Supabase directly
    const refreshSchedule = useCallback(async () => {
        try {
            const fresh = await getScheduleById(schedule.id);
            if (fresh) setSchedule(fresh);
        } catch { /* silent */ }
    }, [schedule.id]);

    // Realtime: listen for changes to registrasi_donor for this jadwal
    useEffect(() => {
        const client = createClient(supabaseUrl, supabaseKey);

        const channel = client
            .channel(`jadwal-kuota-${schedule.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'registrasi_donor',
                    filter: `jadwal_id=eq.${schedule.id}`,
                },
                () => {
                    // Small delay to let the trigger update sisa_kuota
                    setTimeout(refreshSchedule, 500);
                }
            )
            .subscribe();

        return () => {
            client.removeChannel(channel);
        };
    }, [schedule.id, refreshSchedule]);

    if (isFull) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-sm font-semibold text-red-700">Kuota Penuh</p>
                <p className="text-xs text-red-500 mt-1">Silakan pilih jadwal lain yang tersedia.</p>
            </div>
        );
    }

    return <RegisterForm schedule={schedule} onRegistrationSuccess={refreshSchedule} />;
}
