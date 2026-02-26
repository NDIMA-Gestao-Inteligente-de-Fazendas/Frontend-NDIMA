import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitPhase3 } from '../services/authService';

const GOALS = [
    { label: 'Organizar tarefas diárias', icon: '📋' },
    { label: 'Aumentar a qualidade dos produtos', icon: '⭐' },
    { label: 'Conseguir crédito bancário', icon: '🏦' },
    { label: 'Aumentar a produção', icon: '📈' },
    { label: 'Reduzir perdas', icon: '💧' },
    { label: 'Outro', icon: '🎯' },
];

function StepDot({ n, current }: { n: number; current: number }) {
    const done = n < current;
    const active = n === current;
    return (
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={{
                    backgroundColor: done || active ? '#F7C04A' : 'rgba(255,255,255,0.15)',
                    color: done || active ? '#123520' : 'rgba(255,255,255,0.5)',
                }}>
                {done ? '✓' : n}
            </div>
            {n < 3 && <div className="w-10 h-0.5 transition-all duration-500"
                style={{ backgroundColor: done ? '#F7C04A' : 'rgba(255,255,255,0.15)' }} />}
        </div>
    );
}

export default function OnboardingGoalsPage() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggle = (label: string) => {
        const next = new Set(selected);
        next.has(label) ? next.delete(label) : next.add(label);
        setSelected(next);
        setError('');
    };

    const handleSubmit = async () => {
        if (selected.size === 0) { setError('Selecione pelo menos 1 objetivo.'); return; }
        setLoading(true); setError('');
        try {
            await submitPhase3([...selected]);
            navigate('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao guardar. Tente novamente.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex font-['Inter']" style={{ animation: 'slideIn 0.4s ease' }}>
            <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>

            {/* ── Left image panel ── */}
            <div className="hidden md:block w-[45%] relative overflow-hidden">
                <img
                    src="/img/fase3.png"
                    alt="Fase 3 NDIMA"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F9FAFB]">
                <div className="w-full max-w-[460px]">
                    {/* Mobile logo + steps */}
                    <div className="flex flex-col items-center gap-4 mb-8 md:hidden">
                        <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-10 w-auto" />
                        <div className="flex items-center">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="flex items-center">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ backgroundColor: '#1A4D2E', color: 'white' }}>
                                        {n < 3 ? '✓' : n}
                                    </div>
                                    {n < 3 && <div className="w-8 h-0.5 bg-[#1A4D2E]" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#1A4D2E' }}>Passo 3 de 3</p>
                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-1">Os seus objetivos</h1>
                    <p className="text-[#6B7280] mb-6 text-sm">Pode escolher mais de um objetivo para a sua fazenda.</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {GOALS.map(({ label, icon }) => {
                            const active = selected.has(label);
                            return (
                                <button key={label} type="button" onClick={() => toggle(label)}
                                    className="flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                    style={{
                                        borderColor: active ? '#1A4D2E' : '#E5E7EB',
                                        backgroundColor: active ? 'rgba(26,77,46,0.07)' : 'white',
                                        boxShadow: active ? '0 0 0 3px rgba(26,77,46,0.1)' : 'none',
                                    }}>
                                    <span className="text-2xl flex-shrink-0">{icon}</span>
                                    <span className="text-sm font-semibold leading-snug flex-1"
                                        style={{ color: active ? '#1A4D2E' : '#374151' }}>{label}</span>
                                    {active && <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: '#1A4D2E' }} />}
                                </button>
                            );
                        })}
                    </div>

                    {error && <p className="text-sm font-medium mb-4" style={{ color: '#DC2626' }}>{error}</p>}

                    <button type="button" onClick={handleSubmit} disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#1A4D2E', color: 'white' }}>
                        {loading
                            ? <><Loader2 size={18} className="animate-spin" /> A finalizar...</>
                            : <><CheckCircle2 size={18} /> Finalizar</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
