import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { submitPhase1 } from '../services/authService';

const PROVINCES = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje',
    'Moxico', 'Namibe', 'Uíge', 'Zaire',
];

function StepDot({ n, current }: { n: number; current: number }) {
    const done = n < current;
    const active = n === current;
    return (
        <div className="flex items-center gap-0">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={{
                    backgroundColor: done || active ? '#F7C04A' : 'rgba(255,255,255,0.15)',
                    color: done || active ? '#123520' : 'rgba(255,255,255,0.5)',
                }}
            >
                {done ? '✓' : n}
            </div>
            {n < 3 && (
                <div className="w-10 h-0.5 transition-all duration-500"
                    style={{ backgroundColor: done ? '#F7C04A' : 'rgba(255,255,255,0.15)' }} />
            )}
        </div>
    );
}

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ farmName: '', province: '', cultivableArea: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await submitPhase1({
                farmName: form.farmName,
                province: form.province,
                cultivableArea: parseFloat(form.cultivableArea),
            });
            navigate('/onboarding/produtos');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao guardar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none transition-all text-sm';

    return (
        <div className="min-h-screen flex font-['Inter']" style={{ animation: 'slideIn 0.4s ease' }}>
            <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>

            {/* ── Left brand panel ── */}
            <div
                className="hidden md:flex flex-col justify-between w-[45%] p-12"
                style={{ background: 'linear-gradient(145deg, #1A4D2E 0%, #0d2a18 100%)' }}
            >
                <div className="flex flex-col gap-6">
                    <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-14 w-auto object-contain" />
                    {/* Progress steps */}
                    <div className="flex items-center mt-2">
                        {[1, 2, 3].map(n => <StepDot key={n} n={n} current={1} />)}
                    </div>
                </div>

                <div>
                    <div className="text-7xl mb-6">🌱</div>
                    <h2 className="text-4xl font-bold text-white font-['Outfit'] leading-snug mb-4">
                        Vamos conhecer a sua fazenda.
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Diga-nos onde fica e qual o tamanho para personalizarmos a sua experiência NDIMA.
                    </p>
                </div>

                <p className="text-white/30 text-sm">© {new Date().getFullYear()} NDIMA. Todos os direitos reservados.</p>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F9FAFB]">
                <div className="w-full max-w-[420px]">
                    {/* Mobile logo + steps */}
                    <div className="flex flex-col items-center gap-4 mb-8 md:hidden">
                        <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-10 w-auto" />
                        <div className="flex items-center">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="flex items-center">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ backgroundColor: n === 1 ? '#1A4D2E' : '#E5E7EB', color: n === 1 ? 'white' : '#9CA3AF' }}>
                                        {n}
                                    </div>
                                    {n < 3 && <div className="w-8 h-0.5 bg-[#E5E7EB]" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#1A4D2E' }}>Passo 1 de 3</p>
                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-1">Dados da fazenda</h1>
                    <p className="text-[#6B7280] mb-8 text-sm">Preencha os dados básicos sobre a sua propriedade.</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Nome da Fazenda</label>
                            <input name="farmName" type="text" placeholder="Ex: Fazenda Esperança"
                                value={form.farmName} onChange={handleChange} required className={inputClass}
                                onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Província</label>
                            <select name="province" value={form.province} onChange={handleChange} required
                                className={`${inputClass} appearance-none cursor-pointer`}
                                onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                                <option value="">Selecione a província</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Área cultivável (hectares)</label>
                            <input name="cultivableArea" type="number" min="0.1" step="0.1" placeholder="Ex: 5.5"
                                value={form.cultivableArea} onChange={handleChange} required className={inputClass}
                                onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'} />
                        </div>

                        {error && <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#F7C04A', color: '#123520' }}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> A guardar...</> : <>Seguinte <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
