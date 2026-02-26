import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { submitPhase1 } from '../services/authService';

const PROVINCES = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje',
    'Moxico', 'Namibe', 'Uíge', 'Zaire',
];



export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ farmName: '', province: '', cultivableArea: '', location: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('A geolocalização não é suportada por este navegador.');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, location: `${pos.coords.latitude}, ${pos.coords.longitude}` }));
                setLocating(false);
            },
            (_err) => {
                setError('Não foi possível obter a localização. Insira manualmente.');
                setLocating(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');

        // Parse coordinates
        let parsedLocation;
        const locStr = form.location.trim();
        if (locStr) {
            const parts = locStr.split(',').map(s => s.trim());
            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lon = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lon)) {
                    parsedLocation = { lat, lon };
                }
            }
        }

        try {
            await submitPhase1({
                farmName: form.farmName,
                province: form.province,
                cultivableArea: parseFloat(form.cultivableArea),
                ...(parsedLocation ? { location: parsedLocation } : {})
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

            {/* ── Left image panel ── */}
            <div className="hidden md:block w-[45%] relative overflow-hidden">
                <img
                    src="/img/fase1.png"
                    alt="Fase 1 NDIMA"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
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
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-1.5 flex justify-between">
                                <span>Localização (opcional)</span>
                            </label>
                            <div className="flex gap-2">
                                <input name="location" type="text" placeholder="-8.925, 13.203"
                                    value={form.location} onChange={handleChange} className={`${inputClass} flex-1`}
                                    onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'} />
                                <button type="button" onClick={handleGetLocation} disabled={locating}
                                    className="px-4 rounded-xl flex items-center justify-center border border-[#E5E7EB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    title="Obter localização atual">
                                    {locating ? <Loader2 size={20} className="animate-spin text-[#1A4D2E]" /> : <MapPin size={20} className="text-[#1A4D2E]" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#9CA3AF] mt-1.5">
                                Formato: latitude, longitude (ex: -8.925, 13.203)
                            </p>
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
