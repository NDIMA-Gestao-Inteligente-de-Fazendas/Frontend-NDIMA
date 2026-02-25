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
        setLoading(true); setError('');
        try {
            await submitPhase2([...selected]);
            navigate('/onboarding/objetivos');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao guardar. Tente novamente.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex font-['Inter']" style={{ animation: 'slideIn 0.4s ease' }}>
            <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>

            {/* ── Left brand panel ── */}
            <div className="hidden md:flex flex-col justify-between w-[45%] p-12"
                style={{ background: 'linear-gradient(145deg, #1A4D2E 0%, #0d2a18 100%)' }}>
                <div className="flex flex-col gap-6">
                    <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-14 w-auto object-contain" />
                    <div className="flex items-center mt-2">
                        {[1, 2, 3].map(n => <StepDot key={n} n={n} current={2} />)}
                    </div>
                </div>
                <div>
                    <div className="text-7xl mb-6">🌾</div>
                    <h2 className="text-4xl font-bold text-white font-['Outfit'] leading-snug mb-4">
                        O que cultiva na sua terra?
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Saber os seus produtos ajuda-nos a sugerir melhores práticas e ferramentas para a sua fazenda.
                    </p>
                </div>
                <p className="text-white/30 text-sm">© {new Date().getFullYear()} NDIMA. Todos os direitos reservados.</p>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F9FAFB]">
                <div className="w-full max-w-[480px]">
                    {/* Mobile logo + steps */}
                    <div className="flex flex-col items-center gap-4 mb-8 md:hidden">
                        <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-10 w-auto" />
                        <div className="flex items-center">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="flex items-center">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ backgroundColor: n <= 2 ? '#1A4D2E' : '#E5E7EB', color: n <= 2 ? 'white' : '#9CA3AF' }}>
                                        {n < 2 ? '✓' : n}
                                    </div>
                                    {n < 3 && <div className="w-8 h-0.5" style={{ backgroundColor: n < 2 ? '#1A4D2E' : '#E5E7EB' }} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#1A4D2E' }}>Passo 2 de 3</p>
                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-1">Produtos cultivados</h1>
                    <p className="text-[#6B7280] mb-6 text-sm">Selecione todos os que produz. Pode escolher vários.</p>

                    {/* Product chips */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {PRODUCTS.map(({ label, emoji }) => {
                            const active = selected.has(label);
                            return (
                                <button key={label} type="button" onClick={() => toggle(label)}
                                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none hover:scale-105"
                                    style={{
                                        borderColor: active ? '#1A4D2E' : '#E5E7EB',
                                        backgroundColor: active ? 'rgba(26,77,46,0.07)' : 'white',
                                        boxShadow: active ? '0 0 0 3px rgba(26,77,46,0.1)' : 'none',
                                    }}>
                                    <span className="text-3xl">{emoji}</span>
                                    <span className="text-xs font-semibold text-center leading-tight"
                                        style={{ color: active ? '#1A4D2E' : '#374151' }}>{label}</span>
                                    {active && (
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A4D2E' }}>
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
                        <p className="text-sm font-semibold mb-3" style={{ color: '#1A4D2E' }}>
                            {selected.size} produto{selected.size > 1 ? 's' : ''} selecionado{selected.size > 1 ? 's' : ''}
                        </p>
                    )}
                    {error && <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>}

                    <button type="button" onClick={handleSubmit} disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#F7C04A', color: '#123520' }}>
                        {loading ? <><Loader2 size={18} className="animate-spin" /> A guardar...</> : <>Seguinte <ArrowRight size={18} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
