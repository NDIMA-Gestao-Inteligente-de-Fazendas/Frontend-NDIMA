import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { submitPhase2 } from '../services/authService';

const PRODUCTS = [
    { label: 'Milho', emoji: '🌽' },
    { label: 'Mandioca', emoji: '🥔' },
    { label: 'Feijão', emoji: '🫘' },
    { label: 'Café', emoji: '☕' },
    { label: 'Banana', emoji: '🍌' },
    { label: 'Tomate', emoji: '🍅' },
    { label: 'Batata-doce', emoji: '🍠' },
    { label: 'Laranja', emoji: '🍊' },
    { label: 'Cana-de-açúcar', emoji: '🌾' },
    { label: 'Amendoim', emoji: '🥜' },
    { label: 'Arroz', emoji: '🍚' },
    { label: 'Sorgo', emoji: '🌿' },
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

export default function OnboardingProductsPage() {
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
        if (selected.size === 0) { setError('Selecione pelo menos 1 produto.'); return; }
        setLoading(true);
        setError('');
        try {
            await submitPhase2([...selected]);
            navigate('/onboarding/objetivos');
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

                <ProgressBar step={2} />

                <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-1">O que cultiva na sua fazenda?</h1>
                <p className="text-[#6B7280] mb-8">Selecione todos os produtos que produz. Pode escolher vários.</p>

                {/* Product chips */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {PRODUCTS.map(({ label, emoji }) => {
                        const active = selected.has(label);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => toggle(label)}
                                className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none hover:scale-105"
                                style={{
                                    borderColor: active ? '#1A4D2E' : '#E5E7EB',
                                    backgroundColor: active ? 'rgba(26,77,46,0.07)' : 'white',
                                    boxShadow: active ? '0 0 0 3px rgba(26,77,46,0.1)' : 'none',
                                }}
                            >
                                <span className="text-3xl">{emoji}</span>
                                <span
                                    className="text-xs font-semibold text-center leading-tight"
                                    style={{ color: active ? '#1A4D2E' : '#374151' }}
                                >
                                    {label}
                                </span>
                                {active && (
                                    <div
                                        className="w-4 h-4 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#1A4D2E' }}
                                    >
                                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                                            <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {selected.size > 0 && (
                    <p className="text-sm text-[#1A4D2E] font-semibold mb-4">
                        {selected.size} produto{selected.size > 1 ? 's' : ''} selecionado{selected.size > 1 ? 's' : ''}
                    </p>
                )}

                {error && <p className="text-sm font-medium mb-4" style={{ color: '#DC2626' }}>{error}</p>}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                >
                    {loading
                        ? <><Loader2 size={18} className="animate-spin" /> A guardar...</>
                        : <>Seguinte <ArrowRight size={18} /></>
                    }
                </button>
            </div>
        </div>
    );
}
