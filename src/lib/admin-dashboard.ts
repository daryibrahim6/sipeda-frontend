import { createClient } from '@/lib/supabase-browser';

const supabase = createClient();

export async function getDashboardStats(): Promise<{
  total_stok: number;
  jadwal_aktif: number;
  lokasi_aktif: number;
  total_stok_kritis: number;
  registrasi_bulan_ini: number;
}> {
  const [statsRes, regRes] = await Promise.allSettled([
    supabase.from('v_stats').select('*').single(),
    supabase.rpc('count_registrasi_bulan_ini'),
  ]);

  const stats = statsRes.status === 'fulfilled' ? statsRes.value.data : null;
  const regCount = regRes.status === 'fulfilled' ? (regRes.value.data ?? 0) : 0;

  return {
    total_stok: Number(stats?.total_stok ?? 0),
    jadwal_aktif: Number(stats?.jadwal_aktif ?? 0),
    lokasi_aktif: Number(stats?.lokasi_aktif ?? 0),
    total_stok_kritis: Number(stats?.total_stok_kritis ?? 0),
    registrasi_bulan_ini: regCount,
  };
}

export type MonthlyTrend = { bulan: string; berhasil: number; gagal: number; tms: number };
export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 11);
  cutoff.setDate(1);

  const { data, error } = await supabase
    .from('pencatatan_donor')
    .select('created_at, status_donor')
    .gte('created_at', cutoff.toISOString())
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const months: Record<string, { berhasil: number; gagal: number; tms: number }> = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(cutoff.getFullYear(), cutoff.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { berhasil: 0, gagal: 0, tms: 0 };
  }

  for (const row of data) {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      if (row.status_donor === 'berhasil') months[key].berhasil++;
      else if (row.status_donor === 'gagal') months[key].gagal++;
      else months[key].tms++;
    }
  }

  return Object.entries(months).map(([bulan, v]) => ({ bulan, ...v }));
}

export type BloodTypeDist = { golongan_darah: string; total: number };
export async function getBloodTypeDistribution(): Promise<BloodTypeDist[]> {
  const { data, error } = await supabase
    .from('pencatatan_donor')
    .select('golongan_darah')
    .eq('status_donor', 'berhasil');

  if (error || !data) return [];

  const groups: Record<string, number> = {};
  for (const row of data) {
    const g = row.golongan_darah;
    groups[g] = (groups[g] ?? 0) + 1;
  }

  return Object.entries(groups)
    .map(([golongan_darah, total]) => ({ golongan_darah, total }))
    .sort((a, b) => b.total - a.total);
}

export type StatusRate = { status: string; total: number; persen: number };
export async function getSuccessRate(): Promise<StatusRate[]> {
  const { data, error } = await supabase
    .from('pencatatan_donor')
    .select('status_donor');

  if (error || !data) return [];

  const groups: Record<string, number> = {};
  for (const row of data) {
    groups[row.status_donor] = (groups[row.status_donor] ?? 0) + 1;
  }

  const total = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(groups)
    .map(([status, total_count]) => ({
      status,
      total: total_count,
      persen: Math.round((total_count / total) * 100),
    }))
    .sort((a, b) => b.total - a.total);
}

export type GenderDist = { jenis_kelamin: string; total: number };
export async function getGenderDistribution(): Promise<GenderDist[]> {
  const { data, error } = await supabase
    .from('pencatatan_donor')
    .select('registrasi_id')
    .eq('status_donor', 'berhasil')
    .not('registrasi_id', 'is', null);

  if (error || !data) return [];

  const ids = data.map(r => r.registrasi_id);
  if (ids.length === 0) return [{ jenis_kelamin: 'L', total: 0 }, { jenis_kelamin: 'P', total: 0 }];

  const { data: regData, error: regErr } = await supabase
    .from('registrasi_donor')
    .select('jenis_kelamin')
    .in('id', ids);

  if (regErr || !regData) return [];

  const groups: Record<string, number> = {};
  for (const row of regData) {
    const g = row.jenis_kelamin === 'L' ? 'Laki-laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : 'Tidak diketahui';
    groups[g] = (groups[g] ?? 0) + 1;
  }

  return Object.entries(groups).map(([jenis_kelamin, total]) => ({ jenis_kelamin, total }));
}
