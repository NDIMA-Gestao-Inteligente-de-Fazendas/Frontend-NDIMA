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
                        {s <= step && s < step ? '✓' : s}
                    </div>
                    {s < 3 && (
                        <div
                            className="h-px w-12 transition-all duration-500"
                            style={{ backgroundColor: s < step ? '#1A4D2E' : '#E5E7EB' }}
                        />
                    )}
                </div>
            ))}
            <span className="ml-2 text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">Passo {step} de 3</span>
        </div>
    );
}

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        farmName: '',
        province: '',
        cultivableArea: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
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

    const inputClass = 'w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none transition-all';

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-6 py-12 font-['Inter']">
            <div className="w-full max-w-[480px]">
                {/* Logo */}
                <div className="flex justify-center mb-10">
                    <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-12 w-auto" />
                </div>

                <ProgressBar step={1} />

                <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-1">Fale-nos da sua fazenda</h1>
                <p className="text-[#6B7280] mb-8">Vamos personalizar a experiência com base na sua realidade.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Nome da Fazenda */}
                    <div>
                        <label className="block text-sm font-semibold text-[#374151] mb-1.5">Nome da Fazenda</label>
                        <input
                            name="farmName"
                            type="text"
                            placeholder="Ex: Fazenda Esperança"
                            value={form.farmName}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Província */}
                    <div>
                        <label className="block text-sm font-semibold text-[#374151] mb-1.5">Província</label>
                        <select
                            name="province"
                            value={form.province}
                            onChange={handleChange}
                            required
                            className={`${inputClass} appearance-none cursor-pointer`}
                            onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        >
                            <option value="">Selecione a província</option>
                            {PROVINCES.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tamanho */}
                    <div>
                        <label className="block text-sm font-semibold text-[#374151] mb-1.5">Área cultivável (hectares)</label>
                        <input
                            name="cultivableArea"
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Ex: 5.5"
                            value={form.cultivableArea}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {error && <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                    >
                        {loading
                            ? <><Loader2 size={18} className="animate-spin" /> A guardar...</>
                            : <>Seguinte <ArrowRight size={18} /></>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
