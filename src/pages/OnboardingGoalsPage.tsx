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

function ProgressBar({ step }: { step: number }) {
    return (
        <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                        style={{
                            backgroundColor: s <= step ? '#1A4D2E' : '#E5E7EB',
                            color: s <= step ? 'white' : '#9CA3AF',
                        }}
                    >
                        {s < step ? '✓' : s}
                    </div>
                    {s < 3 && (
                        <div className="h-px w-12 transition-all duration-500"
                            style={{ backgroundColor: s < step ? '#1A4D2E' : '#E5E7EB' }} />
                    )}
                </div>
            ))}
            <span className="ml-2 text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">Passo {step} de 3</span>
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
        setLoading(true);
        setError('');
        try {
            await submitPhase3([...selected]);
            // onboardingCompleted === true → go to home (dashboard)
            navigate('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao guardar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-6 py-12 font-['Inter']">
            <div className="w-full max-w-[520px]">
                <div className="flex justify-center mb-10">
                    <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-12 w-auto" />
                </div>

                <ProgressBar step={3} />

                <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-1">Qual o seu maior objetivo?</h1>
                <p className="text-[#6B7280] mb-8">Vamos alcançá-lo, juntos. Pode escolher mais de um.</p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {GOALS.map(({ label, icon }) => {
                        const active = selected.has(label);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => toggle(label)}
                                className="flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                style={{
                                    borderColor: active ? '#1A4D2E' : '#E5E7EB',
                                    backgroundColor: active ? 'rgba(26,77,46,0.07)' : 'white',
                                    boxShadow: active ? '0 0 0 3px rgba(26,77,46,0.1)' : 'none',
                                }}
                            >
                                <span className="text-2xl flex-shrink-0">{icon}</span>
                                <span
                                    className="text-sm font-semibold leading-snug flex-1"
                                    style={{ color: active ? '#1A4D2E' : '#374151' }}
                                >
                                    {label}
                                </span>
                                {active && (
                                    <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: '#1A4D2E' }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {error && <p className="text-sm font-medium mb-4" style={{ color: '#DC2626' }}>{error}</p>}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#1A4D2E', color: 'white' }}
                >
                    {loading
                        ? <><Loader2 size={18} className="animate-spin" /> A finalizar...</>
                        : <><CheckCircle2 size={18} /> Finalizar</>
                    }
                </button>
            </div>
        </div>
    );
}
