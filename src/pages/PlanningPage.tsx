import { useState, useEffect } from 'react';
import {
    MapPin, Sun, Leaf, Sprout, Combine, AlertTriangle,
    CheckCircle2, Calculator, Download, Droplets, FlaskConical, Loader2
} from 'lucide-react';
import { getMe, type UserProfile } from '../services/authService';
import {
    getCrops, getFarmSoil, getSoilVerdict, getWeather, getActivePlan, createPlan,
    type Crop, type SoilData, type SoilVerdict, type WeatherData, type Plan,
} from '../services/planningService';
import PlanningWizard from '../components/PlanningWizard';

/* ─────────── Helpers ─────────── */
const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });

/** Percentage (0-100) → nutrient label */
function nutrientLabel(v: number) {
    if (v >= 70) return { label: 'Alto', color: '#10B981' };
    if (v >= 40) return { label: 'Médio', color: '#F59E0B' };
    return { label: 'Baixo', color: '#EF4444' };
}

/** pH → needle rotation degrees (-90 to +90) */
const phRotation = (ph: number) => Math.round(((ph - 7) / 7) * 90);

/** Phase name → icon + color */
function phaseStyle(phase: string): { color: string } {
    const p = phase.toLowerCase();
    if (p.includes('preparação')) return { color: '#10B981' };
    if (p.includes('plantio')) return { color: '#22C55E' };
    if (p.includes('adubação') || p.includes('tratamento')) return { color: '#3B82F6' };
    if (p.includes('monitorização') || p.includes('crescimento')) return { color: '#8B5CF6' };
    if (p.includes('colheita')) return { color: '#1A4D2E' };
    return { color: '#9CA3AF' };
}

/* ─────────── Page ─────────── */
export default function PlanningPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [soil, setSoil] = useState<SoilData | null>(null);
    const [verdict, setVerdict] = useState<SoilVerdict | null>(null);
    const [verdictLoading, setVerdictLoading] = useState(false);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [activePlan, setActivePlan] = useState<Plan | null>(null);
    const [wizardOpen, setWizardOpen] = useState(false);

    // Simulator state
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [hectares, setHectares] = useState(10);
    const [pricePerKg, setPricePerKg] = useState(150);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [confirmingPlan, setConfirmingPlan] = useState(false);
    const [confirmError, setConfirmError] = useState('');

    // 1. Load user, crops, soil and active plan in parallel
    useEffect(() => {
        getMe().then(u => {
            setUser(u);
            setHectares(u.farm?.cultivableArea || 10);
        }).catch(() => { });

        getCrops().then(c => {
            setCrops(c);
            setSelectedCrop(c[0] ?? null);
        }).catch(() => { });

        getFarmSoil().then(setSoil).catch(() => { });
        getActivePlan().then(setActivePlan).catch(() => { });
    }, []);

    // 2. Fetch weather once province is known
    useEffect(() => {
        if (user?.farm?.province) {
            getWeather(user.farm.province).then(setWeather).catch(() => { });
        }
    }, [user]);

    // 3. Fetch AI verdict once soil + province are ready
    useEffect(() => {
        if (soil?.available && soil.ph !== null && soil.texture && soil.nitrogen !== null && soil.organicCarbon !== null && user?.farm?.province) {
            setVerdictLoading(true);
            getSoilVerdict({
                ph: soil.ph,
                clay: soil.texture.clay,
                sand: soil.texture.sand,
                silt: soil.texture.silt,
                nitrogen: soil.nitrogen,
                organicCarbon: soil.organicCarbon,
                province: user.farm.province,
                qualityScore: soil.qualityScore ?? undefined,
            }).then(setVerdict).catch(() => { }).finally(() => setVerdictLoading(false));
        }
    }, [soil, user]);

    // Map AI suggestions: cropId → suggestedStartDate
    const aiSuggestions: Record<string, string> = {};
    verdict?.recommendedCrops.forEach(r => { aiSuggestions[r.cropId] = r.suggestedStartDate; });

    // Simulator financials (real-time)
    const totalCost = selectedCrop ? selectedCrop.costPerHa * hectares : 0;
    const expectedYield = selectedCrop ? selectedCrop.yieldPerHaKg * hectares : 0;
    const grossRevenue = expectedYield * pricePerKg;
    const profit = grossRevenue - totalCost;
    const profitMargin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;

    const handleConfirmPlan = async () => {
        if (!selectedCrop || !user?.farm?.province) return;
        setConfirmingPlan(true);
        setConfirmError('');
        try {
            const newPlan = await createPlan({
                cropId: selectedCrop.id,
                hectares,
                startDate,
                pricePerKgAoa: pricePerKg,
                province: user.farm.province,
                aiVerdictUsed: verdict?.verdict,
            });
            setActivePlan(newPlan);
        } catch (e) {
            setConfirmError(e instanceof Error ? e.message : 'Erro ao criar plano.');
        } finally {
            setConfirmingPlan(false);
        }
    };

    // Soil section helpers — round to avoid floating-point artifacts (e.g. 25.2000000000003%)
    const clay = Math.round(soil?.texture?.clay ?? 40);
    const sand = Math.round(soil?.texture?.sand ?? 35);
    const silt = Math.round(soil?.texture?.silt ?? 25);
    const soilPieGradient = `conic-gradient(#8B4513 0% ${clay}%, #E6C280 ${clay}% ${clay + sand}%, #A0522D ${clay + sand}% 100%)`;
    const nitrogenPct = soil?.nutrients?.nitrogen.value ?? 0;
    const organicPct = soil?.nutrients?.organicMatter.value ?? 0;
    const nitrogenInfo = nutrientLabel(nitrogenPct);
    const organicInfo = nutrientLabel(organicPct);
    const phVal = soil?.ph ?? 6.5;
    const needleRotation = phRotation(phVal);

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8 font-['Inter']">

            {/* ── A. Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#E9EEE9] shadow-sm">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#111827] font-['Outfit']">
                        {user?.farm?.name || 'A Minha Fazenda'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-[#1A4D2E]" />
                            {user?.farm?.province || 'Angola'}
                        </span>
                        {/* Weather — only show divider + data when loaded */}
                        {user?.farm?.province && (
                            <>
                                <div className="w-px h-4 bg-[#E5E7EB]" />
                                {weather ? (
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Sun size={16} className="text-[#D48806]" />
                                        {weather.temperatureCelsius}°C · {weather.condition}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <Sun size={16} className="text-[#E5E7EB]" />
                                        <span className="w-24 h-3.5 bg-[#E5E7EB] rounded-full animate-pulse" />
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <button onClick={() => setWizardOpen(true)}
                    className="bg-[#1A4D2E] hover:bg-[#123520] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Sprout size={18} /> Novo Planeamento de Safra
                </button>
            </header>

            {/* ── B. Diagnóstico do Solo ── */}
            <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <FlaskConical size={20} className="text-[#1A4D2E]" />
                    <h2 className="text-xl font-bold text-[#111827] font-['Outfit']">Diagnóstico do Solo</h2>
                    <span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                        Dados: SoilGrids
                    </span>
                    {soil?.qualityLabel && (
                        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]">
                            Índice: {soil.qualityScore}/100 · {soil.qualityLabel}
                        </span>
                    )}
                </div>

                {soil && !soil.available ? (
                    <div className="flex items-center gap-3 p-4 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                        <AlertTriangle size={18} className="text-[#D48806] shrink-0" />
                        <p className="text-sm text-[#B45309]">
                            Dados de solo ainda não disponíveis. Complete o <strong>onboarding fase 1</strong> para activar o diagnóstico.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 p-2 md:grid-cols-3 gap-6 items-stretch">
                        {/* pH Gauge */}
                        <div className="flex flex-col items-center justify-center gap-4 p-6 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                            <span className="text-sm font-semibold text-[#6B7280]">pH do Solo</span>
                            <div className="relative w-32 h-16 overflow-hidden flex items-end justify-center mb-2">
                                <div className="w-32 h-32 rounded-full border-[12px] opacity-30 absolute top-0"
                                    style={{ backgroundImage: 'conic-gradient(from 270deg at 50% 50%, #EF4444 0deg, #10B981 90deg, #3B82F6 180deg)', borderRadius: '50%' }} />
                                <div className="w-[104px] h-[52px] bg-[#F9FAFB] rounded-t-full absolute bottom-0 z-10 flex items-end justify-center pb-1">
                                    <span className="text-2xl font-bold font-['Outfit'] text-[#111827]">
                                        {soil?.ph?.toFixed(1) ?? '—'}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 w-1 h-14 bg-gray-800 origin-bottom z-20 rounded-full transition-transform duration-700"
                                    style={{ transform: `rotate(${needleRotation}deg)` }} />
                            </div>
                            <span className="text-xs font-bold mt-1" style={{ color: nitrogenInfo.color }}>
                                {soil?.phLabel ?? 'Neutro (Ideal)'}
                            </span>
                        </div>

                        {/* Texture Pie */}
                        <div className="flex flex-col justify-center p-6 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                            <span className="text-sm font-semibold text-[#6B7280] mb-5 text-center block">
                                Textura — {soil?.texture?.classification ?? 'franco-argiloso'}
                            </span>
                            <div className="flex items-center justify-center gap-6 flex-1">
                                <div className="w-20 h-20 rounded-full shrink-0" style={{ background: soilPieGradient }} />
                                <div className="flex flex-col justify-center gap-2 text-xs font-medium text-[#4B5563]">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8B4513]" /> Argila ({clay}%)</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#E6C280]" /> Areia ({sand}%)</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#A0522D]" /> Silte ({silt}%)</div>
                                </div>
                            </div>
                        </div>

                        {/* Nutrients */}
                        <div className="flex flex-col justify-center gap-6 p-6 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#4B5563]">Nitrogénio (N)</span>
                                    <span style={{ color: nitrogenInfo.color }}>{soil?.nutrients?.nitrogen.label ?? '—'}</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${nitrogenPct}%`, background: nitrogenInfo.color }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#4B5563]">Matéria Orgânica</span>
                                    <span style={{ color: organicInfo.color }}>{soil?.nutrients?.organicMatter.label ?? '—'}</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${organicPct}%`, background: organicInfo.color }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <br />
                {/* AI Verdict */}
                <div className="mt-6 flex items-start gap-3 p-4 bg-gradient-to-r from-[#1A4D2E]/10 to-transparent rounded-xl border border-[#1A4D2E]/20 min-h-[68px]">
                    <span className="text-xl shrink-0">🤖</span>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                            Veredito NDIMA IA
                            {verdict?.source === 'rule-based' && (
                                <span className="text-[10px] font-normal text-[#9CA3AF]">(baseado em regras)</span>
                            )}
                        </p>
                        {verdictLoading ? (
                            <div className="flex items-center gap-2 mt-1">
                                <Loader2 size={14} className="animate-spin text-[#1A4D2E]" />
                                <span className="text-xs text-[#6B7280]">A analisar o seu solo com IA…</span>
                            </div>
                        ) : verdict ? (
                            <>
                                <p className="text-sm text-[#4B5563] p-2 mt-3.5">{verdict.verdict}</p>
                                {verdict.warnings.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {verdict.warnings.map((w, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
                                                ⚠ {w}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-[#9CA3AF] mt-0.5">Complete o cadastro da fazenda para activar a análise IA.</p>
                        )}
                    </div>
                </div>
                <br />
                {/* Culturas recomendadas pela IA */}
                {verdict?.recommendedCrops && verdict.recommendedCrops.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {verdict.recommendedCrops.map((r, idx) => {
                            // If all scores equal 100, give a visual gradient based on rank
                            const allSame = verdict.recommendedCrops.every(x => x.compatibilityScore === verdict.recommendedCrops[0].compatibilityScore);
                            const displayScore = allSame ? Math.max(55, 100 - idx * 10) : r.compatibilityScore;
                            const barColor = displayScore >= 80 ? '#10B981' : displayScore >= 60 ? '#F59E0B' : '#EF4444';
                            return (
                                <div key={r.cropId} className="flex flex-col gap-1.5 p-3 bg-white border border-[#E9EEE9] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl">{r.cropIcon}</span>
                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-md text-white"
                                            style={{ backgroundColor: barColor }}>
                                            {r.compatibilityScore}%
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#111827]">{r.cropName}</p>
                                    <p className="text-[10px] text-[#9CA3AF]">Plantio: {r.suggestedStartMonth}</p>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${displayScore}%`, backgroundColor: barColor }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── C. Simulador + D. Cronograma ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Simulador */}
                <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6">
                        <Calculator size={20} className="text-[#1A4D2E]" />
                        <h2 className="text-xl font-bold text-[#111827] font-['Outfit']">Simulador de Safra</h2>
                    </div>

                    {crops.length === 0 ? (
                        <div className="flex items-center gap-2 py-4">
                            <Loader2 size={16} className="animate-spin text-[#1A4D2E]" />
                            <span className="text-sm text-[#9CA3AF]">A carregar culturas…</span>
                        </div>
                    ) : (
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {crops.map(crop => (
                                <button key={crop.id} onClick={() => {
                                    setSelectedCrop(crop);
                                    if (aiSuggestions[crop.id]) setStartDate(aiSuggestions[crop.id]);
                                }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all font-semibold text-sm
                                        ${selectedCrop?.id === crop.id ? 'border-[#1A4D2E] bg-[#1A4D2E] text-white shadow-md' : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#1A4D2E]/50'}`}>
                                    <span className="text-base">{crop.icon}</span> {crop.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Área (Hectares)</label>
                            <input type="number" min="1" value={hectares}
                                onChange={e => setHectares(Number(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A4D2E] font-bold text-[#111827] bg-[#F9FAFB]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Preço Venda (AOA/Kg)</label>
                            <input type="number" min="1" value={pricePerKg}
                                onChange={e => setPricePerKg(Number(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A4D2E] font-bold text-[#111827] bg-[#F9FAFB]" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Data de Início</label>
                            <input type="date" value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A4D2E] font-bold text-[#111827] bg-[#F9FAFB]" />
                        </div>
                    </div>
                    <br />
                    <div className="bg-[#111827] rounded-2xl p-5 text-white mt-auto">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[#9CA3AF] text-sm">Custo Estimado</span>
                            <span className="font-semibold text-white">{fmtCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[#9CA3AF] text-sm">Receita Bruta Esperada</span>
                            <span className="font-semibold text-white">{fmtCurrency(grossRevenue)}</span>
                        </div>
                        <div className="h-px w-full bg-[#374151] my-3" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold font-['Outfit'] text-lg">Lucro Previsto</span>
                            <div className="text-right">
                                <span className={`font-black font-['Outfit'] text-2xl ${profit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                    {fmtCurrency(profit)}
                                </span>
                                <p className={`text-xs font-semibold mt-1 ${profit >= 0 ? 'text-[#34D399]' : 'text-[#FCA5A5]'}`}>
                                    Margem: {profitMargin.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {confirmError && (
                        <p className="text-sm font-medium text-[#DC2626] mt-3">{confirmError}</p>
                    )}
                    <br />
                    <button onClick={handleConfirmPlan} disabled={!selectedCrop || confirmingPlan}
                        className="w-full mt-4 bg-[#F7C04A] hover:bg-[#F5B027] text-[#123520] font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {confirmingPlan ? <><Loader2 size={18} className="animate-spin" /> A criar plano…</> : 'Confirmar este Plano'}
                    </button>
                </section>

                {/* Cronograma + Logística */}
                <div className="flex flex-col gap-6">
                    {/* Cronograma */}
                    <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[#111827] font-['Outfit']">Cronograma da Safra</h2>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#F3F4F6] text-[#6B7280]">Meteorologia Integrada</span>
                        </div>

                        {activePlan ? (
                            <div className="relative pl-6 border-l-2 border-[#E5E7EB] flex flex-col gap-8">
                                {activePlan.timeline.map((phase, i) => {
                                    const { color } = phaseStyle(phase.phase);
                                    const isLast = i === activePlan.timeline.length - 1;
                                    return (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm"
                                                style={{ background: isLast ? color : (i === 0 ? '#10B981' : color) }}>
                                                {i === 0 ? <CheckCircle2 size={12} className="text-white" /> :
                                                    isLast ? <Combine size={12} className="text-white" /> :
                                                        <Droplets size={12} className="text-white" />}
                                            </div>
                                            <h3 className="text-sm font-bold text-[#111827]">{phase.phase}</h3>
                                            <p className="text-xs text-[#6B7280] mt-1">{fmtDate(phase.date)}</p>
                                            {i === 0 && weather?.condition?.toLowerCase().includes('seca') && (
                                                <div className="mt-2 flex items-start gap-2 p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg">
                                                    <AlertTriangle size={14} className="text-[#D48806] shrink-0 mt-0.5" />
                                                    <p className="text-xs font-medium text-[#B45309]">Época seca detectada — considere adiar o plantio.</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <span className="text-4xl">🌱</span>
                                <p className="text-sm font-semibold text-[#374151]">Sem plano ativo</p>
                                <p className="text-xs text-[#9CA3AF]">Confirme um plano no simulador ou use o Wizard para criar o seu primeiro cronograma.</p>
                                <button onClick={() => setWizardOpen(true)}
                                    className="mt-2 px-4 py-2 bg-[#1A4D2E] text-white text-sm font-semibold rounded-xl hover:bg-[#123520] transition-colors">
                                    Criar Plano
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Necessidades Logísticas */}
                    <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-bold text-[#111827] font-['Outfit']">Necessidades Logísticas</h2>
                            <button className="text-[#1A4D2E] hover:bg-[#F3F4F6] p-1.5 rounded-lg transition-colors" title="Exportar PDF">
                                <Download size={18} />
                            </button>
                        </div>
                        <ul className="flex flex-col gap-4">
                            <li className="flex justify-between items-center text-sm border-b border-[#F3F4F6] pb-2">
                                <span className="text-[#4B5563] flex items-center gap-2">
                                    <Leaf size={14} className="text-[#10B981]" />
                                    Sementes ({activePlan?.cropName ?? selectedCrop?.name ?? '—'})
                                </span>
                                <span className="font-semibold text-[#111827]">
                                    {activePlan ? `${activePlan.logistics.seedsKg} kg`
                                        : selectedCrop ? `${hectares * selectedCrop.seedsPerHaKg} kg` : '—'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center text-sm border-b border-[#F3F4F6] pb-2">
                                <span className="text-[#4B5563] flex items-center gap-2">
                                    <FlaskConical size={14} className="text-[#F59E0B]" /> Fertilizante (NPK)
                                </span>
                                <span className="font-semibold text-[#111827]">
                                    {activePlan ? `${activePlan.logistics.fertilizerKg} kg`
                                        : selectedCrop ? `${hectares * selectedCrop.fertilizerPerHaKg} kg` : '—'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-[#4B5563] flex items-center gap-2">
                                    <Droplets size={14} className="text-[#3B82F6]" /> Combustível Trator
                                </span>
                                <span className="font-semibold text-[#111827]">
                                    {activePlan ? `${activePlan.logistics.fuelLiters} L`
                                        : selectedCrop ? `${hectares * selectedCrop.fuelPerHaL} L` : '—'}
                                </span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>

            <PlanningWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                defaultProvince={user?.farm?.province}
                defaultHectares={user?.farm?.cultivableArea}
                crops={crops}
                verdictText={verdict?.verdict}
                aiSuggestions={aiSuggestions}
                onPlanSaved={(plan: Plan) => setActivePlan(plan)}
            />
        </div>
    );
}
