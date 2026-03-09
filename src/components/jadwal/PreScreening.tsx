'use client';

import { useState } from 'react';
import {
    ShieldCheck, XCircle, ChevronRight, ArrowLeft,
    Thermometer, Weight, Baby, Wine, Clock, Moon, Utensils, Pill,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PreScreeningData = {
    berat_badan: number;
    suhu_normal: boolean;
    tidak_menstruasi: boolean;
    tidak_hamil_menyusui: boolean;
    tidak_alkohol: boolean;
    tidak_donor_56_hari: boolean;
    tidur_cukup: boolean;
    sudah_makan: boolean;
    tidak_obat: boolean;
    lulus: boolean;
};

type Props = {
    tanggalLahir: string;
    jenisKelamin: 'L' | 'P' | '';
    onPass: (data: PreScreeningData) => void;
    onBack: () => void;
};

// ─── Questions config ─────────────────────────────────────────────────────────

type Question = {
    id: string;
    label: string;
    icon: typeof Thermometer;
    type: 'toggle' | 'number';
    required: boolean; // if true, failing = rejection
    showIf?: (jk: string) => boolean;
    rejectMsg?: string;
};

const QUESTIONS: Question[] = [
    {
        id: 'berat_badan', label: 'Berat badan Anda (kg)', icon: Weight,
        type: 'number', required: true,
        rejectMsg: 'Berat badan minimal 45 kg untuk donor darah.',
    },
    {
        id: 'suhu_normal', label: 'Suhu tubuh saya normal (tidak demam > 37.5°C)', icon: Thermometer,
        type: 'toggle', required: true,
        rejectMsg: 'Anda tidak boleh donor saat sedang demam (suhu > 37.5°C).',
    },
    {
        id: 'tidak_menstruasi', label: 'Saya tidak sedang menstruasi', icon: Baby,
        type: 'toggle', required: true,
        showIf: (jk) => jk === 'P',
        rejectMsg: 'Anda tidak boleh donor saat sedang menstruasi.',
    },
    {
        id: 'tidak_hamil_menyusui', label: 'Saya tidak sedang hamil atau menyusui', icon: Baby,
        type: 'toggle', required: true,
        showIf: (jk) => jk === 'P',
        rejectMsg: 'Anda tidak boleh donor saat sedang hamil atau menyusui.',
    },
    {
        id: 'tidak_alkohol', label: 'Saya tidak mengonsumsi alkohol dalam 24 jam terakhir', icon: Wine,
        type: 'toggle', required: true,
        rejectMsg: 'Anda harus menunggu 24 jam setelah konsumsi alkohol.',
    },
    {
        id: 'tidak_donor_56_hari', label: 'Saya tidak donor darah dalam 56 hari terakhir', icon: Clock,
        type: 'toggle', required: true,
        rejectMsg: 'Jarak antar donor darah minimal 56 hari (8 minggu).',
    },
    // Informatif (tidak blokir)
    {
        id: 'tidur_cukup', label: 'Saya tidur cukup (minimal 5 jam) tadi malam', icon: Moon,
        type: 'toggle', required: false,
    },
    {
        id: 'sudah_makan', label: 'Saya sudah makan sebelum datang donor', icon: Utensils,
        type: 'toggle', required: false,
    },
    {
        id: 'tidak_obat', label: 'Saya tidak sedang konsumsi obat-obatan tertentu', icon: Pill,
        type: 'toggle', required: false,
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PreScreening({ tanggalLahir, jenisKelamin, onPass, onBack }: Props) {
    const [answers, setAnswers] = useState<Record<string, boolean | number>>({
        berat_badan: 0,
        suhu_normal: false,
        tidak_menstruasi: false,
        tidak_hamil_menyusui: false,
        tidak_alkohol: false,
        tidak_donor_56_hari: false,
        tidur_cukup: false,
        sudah_makan: false,
        tidak_obat: false,
    });
    const [rejections, setRejections] = useState<string[]>([]);
    const [checked, setChecked] = useState(false);

    // Filter questions based on jenis kelamin
    const visibleQuestions = QUESTIONS.filter(q => !q.showIf || q.showIf(jenisKelamin));

    // Calculate age from tanggal_lahir
    function getAge(): number | null {
        if (!tanggalLahir) return null;
        const birth = new Date(tanggalLahir);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }

    function handleCheck() {
        const fails: string[] = [];
        const age = getAge();

        // Age check
        if (age !== null && (age < 17 || age > 65)) {
            fails.push(`Usia Anda ${age} tahun. Usia donor yang diperbolehkan adalah 17–65 tahun.`);
        }

        // Weight check
        const berat = Number(answers.berat_badan);
        if (!berat || berat < 45) {
            fails.push('Berat badan minimal 45 kg untuk donor darah.');
        }

        // Required toggle checks
        for (const q of visibleQuestions) {
            if (q.required && q.type === 'toggle' && !answers[q.id]) {
                fails.push(q.rejectMsg ?? `${q.label} — tidak memenuhi syarat.`);
            }
        }

        setRejections(fails);
        setChecked(true);

        if (fails.length === 0) {
            const data: PreScreeningData = {
                berat_badan: Number(answers.berat_badan),
                suhu_normal: !!answers.suhu_normal,
                tidak_menstruasi: !!answers.tidak_menstruasi,
                tidak_hamil_menyusui: !!answers.tidak_hamil_menyusui,
                tidak_alkohol: !!answers.tidak_alkohol,
                tidak_donor_56_hari: !!answers.tidak_donor_56_hari,
                tidur_cukup: !!answers.tidur_cukup,
                sudah_makan: !!answers.sudah_makan,
                tidak_obat: !!answers.tidak_obat,
                lulus: true,
            };
            onPass(data);
        }
    }

    const age = getAge();

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h3 className="font-bold text-gray-900">Pre-Screening Kesehatan</h3>
                    <p className="text-xs text-gray-400">Jawab pertanyaan berikut sebelum melanjutkan pendaftaran</p>
                </div>
            </div>

            {/* Age display */}
            {age !== null && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${age >= 17 && age <= 65
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    Usia Anda: <strong>{age} tahun</strong>
                    {age >= 17 && age <= 65 ? ' ✓ memenuhi syarat' : ' — tidak memenuhi syarat (17–65 tahun)'}
                </div>
            )}

            {/* Required section */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Syarat Wajib
                </div>
                <div className="space-y-2">
                    {visibleQuestions.filter(q => q.required).map(q => {
                        const Icon = q.icon;
                        if (q.type === 'number') {
                            return (
                                <div key={q.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                                    <Icon className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 flex-1">{q.label}</span>
                                    <input
                                        type="number"
                                        min={30}
                                        max={200}
                                        value={Number(answers[q.id]) || ''}
                                        onChange={e => setAnswers(a => ({ ...a, [q.id]: Number(e.target.value) }))}
                                        placeholder="kg"
                                        className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            );
                        }
                        return (
                            <label key={q.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-red-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={!!answers[q.id]}
                                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.checked }))}
                                    className="w-4 h-4 accent-red-600 flex-shrink-0"
                                />
                                <Icon className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{q.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Informative section */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Informasi Tambahan <span className="text-gray-400 font-normal">(tidak wajib)</span>
                </div>
                <div className="space-y-2">
                    {visibleQuestions.filter(q => !q.required).map(q => {
                        const Icon = q.icon;
                        return (
                            <label key={q.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={!!answers[q.id]}
                                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.checked }))}
                                    className="w-4 h-4 accent-gray-600 flex-shrink-0"
                                />
                                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-500">{q.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Rejection messages */}
            {checked && rejections.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-1">
                        <XCircle className="w-4 h-4" />
                        Maaf, Anda belum memenuhi syarat donor
                    </div>
                    {rejections.map((msg, i) => (
                        <div key={i} className="text-sm text-red-600 pl-6">• {msg}</div>
                    ))}
                    <p className="text-xs text-red-400 pl-6 mt-2">
                        Silakan konsultasi dengan petugas PMI jika ada pertanyaan.
                    </p>
                </div>
            )}

            {/* Submit */}
            <button
                onClick={handleCheck}
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
                <ShieldCheck className="w-4 h-4" />
                Cek Kelayakan & Lanjutkan
                <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-gray-400 text-center">
                Pre-screening berdasarkan standar PMI Pusat. Hasil akhir tetap ditentukan oleh petugas.
            </p>
        </div>
    );
}
