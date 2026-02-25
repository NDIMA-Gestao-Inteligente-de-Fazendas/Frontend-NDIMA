import { useState, useEffect } from 'react';
import {
    X, ChevronRight, ChevronLeft, MapPin, Sprout,
    AlertTriangle, TrendingUp, CheckCircle2, Calendar,
    CloudRain, Leaf, Droplets, Combine, Share2, Download, Loader2
} from 'lucide-react';
import { createPlan, type Crop, type Plan } from '../services/planningService';

/* ─── Data (fallback when no crops from API) ─────────────────── */
const FALLBACK_CROPS: Crop[] = [
    { id: 'milho', name: 'Milho', icon: '🌽', color: '#FEF9C3', costPerHa: 450000, yieldPerHaKg: 5000, growWeeks: 16, seedsPerHaKg: 20, fertilizerPerHaKg: 150, fuelPerHaL: 45, idealPhMin: 5.5, idealPhMax: 7.0, compatibleSoilTypes: [] },
    { id: 'feijao', name: 'Feijão', icon: '🫘', color: '#FEF3C7', costPerHa: 350000, yieldPerHaKg: 1500, growWeeks: 12, seedsPerHaKg: 80, fertilizerPerHaKg: 80, fuelPerHaL: 30, idealPhMin: 6.0, idealPhMax: 7.5, compatibleSoilTypes: [] },
    { id: 'cafe', name: 'Café (Arábica)', icon: '☕', color: '#F5F0EB', costPerHa: 850000, yieldPerHaKg: 2000, growWeeks: 52, seedsPerHaKg: 10, fertilizerPerHaKg: 200, fuelPerHaL: 60, idealPhMin: 5.0, idealPhMax: 6.5, compatibleSoilTypes: [] },
    { id: 'mandioca', name: 'Mandioca', icon: '🍠', color: '#FFF7ED', costPerHa: 280000, yieldPerHaKg: 12000, growWeeks: 40, seedsPerHaKg: 300, fertilizerPerHaKg: 100, fuelPerHaL: 35, idealPhMin: 5.5, idealPhMax: 7.0, compatibleSoilTypes: [] },
    { id: 'tomate', name: 'Tomate', icon: '🍅', color: '#FEF2F2', costPerHa: 600000, yieldPerHaKg: 30000, growWeeks: 14, seedsPerHaKg: 0.3, fertilizerPerHaKg: 180, fuelPerHaL: 40, idealPhMin: 6.0, idealPhMax: 7.0, compatibleSoilTypes: [] },
    { id: 'banana', name: 'Banana', icon: '🍌', color: '#FFFBEB', costPerHa: 500000, yieldPerHaKg: 20000, growWeeks: 36, seedsPerHaKg: 0, fertilizerPerHaKg: 160, fuelPerHaL: 40, idealPhMin: 5.5, idealPhMax: 7.0, compatibleSoilTypes: [] },
    { id: 'soja', name: 'Soja', icon: '🌱', color: '#F0FDF4', costPerHa: 600000, yieldPerHaKg: 3500, growWeeks: 18, seedsPerHaKg: 60, fertilizerPerHaKg: 120, fuelPerHaL: 45, idealPhMin: 6.0, idealPhMax: 7.0, compatibleSoilTypes: [] },
    { id: 'amendoim', name: 'Amendoim', icon: '🥜', color: '#FFF7ED', costPerHa: 300000, yieldPerHaKg: 2000, growWeeks: 14, seedsPerHaKg: 120, fertilizerPerHaKg: 80, fuelPerHaL: 30, idealPhMin: 5.8, idealPhMax: 7.0, compatibleSoilTypes: [] },
];

const LOADING_STEPS = [
    { label: 'A consultar dados de solo (SoilGrids)...', icon: '🌍' },
    { label: 'A analisar histórico de chuvas (Meteostat)...', icon: '🌧️' },
    { label: 'A calcular viabilidade financeira...', icon: '💰' },
    { label: 'A planear cronograma otimizado...', icon: '📅' },
];

interface PlanRecord {
    crop: Crop;
    hectares: number;
    startDate: string;
    province: string;
    pricePerKg: number;
}

interface PlanningWizardProps {
    isOpen: boolean;
    onClose: () => void;
    defaultProvince?: string;
    defaultHectares?: number;
    crops?: Crop[];
    verdictText?: string;
    aiSuggestions?: Record<string, string>;
    onPlanCreated?: (plan: PlanRecord) => void;
    onPlanSaved?: (plan: Plan) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

/* ─── Helper ─────────────────────────────────────────────────── */
const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

function addWeeks(dateStr: string, weeks: number) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + weeks * 7);
    return d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Sub-steps ─────────────────────────────────────────────── */
function StepIndicator({ current }: { current: Step }) {
    const steps = [
        { n: 1, label: 'Cultura' },
        { n: 2, label: 'Área' },
        { n: 4, label: 'Viabilidade' },
        { n: 5, label: 'Cronograma' },
    ];
    // map logical steps to indicator steps (step 3 is loading, hidden)
    const displayStep = current >= 4 ? current - 1 : current;
    return (
        <div className="flex items-center justify-center gap-1 mb-8">
            {steps.map((s, i) => {
                const pos = i + 1;
                const done = displayStep > pos;
                const active = displayStep === pos;
                return (
                    <div key={s.n} className="flex items-center">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300
                            ${done ? 'bg-[#10B981] text-white' : active ? 'bg-[#1A4D2E] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {done ? <CheckCircle2 size={14} /> : pos}
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-12 h-0.5 mx-1 transition-all duration-500 ${done ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Step 1: Crop Selection ─────────────────────────────────── */
function Step1({ crops, onSelect }: { crops: Crop[]; onSelect: (c: Crop) => void }) {
    if (crops.length === 0) return (
        <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 size={20} className="animate-spin text-[#1A4D2E]" />
            <span className="text-sm text-[#6B7280]">A carregar culturas…</span>
        </div>
    );
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-[#111827] font-['Outfit'] mb-1">O que quer plantar?</h2>
            <p className="text-[#6B7280] text-sm mb-8">Selecione a cultura para calcularmos a melhor estratégia para si.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {crops.map(crop => (
                    <button key={crop.id} onClick={() => onSelect(crop)}
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-[#F3F4F6] hover:border-[#1A4D2E] hover:shadow-md transition-all duration-200 group cursor-pointer"
                        style={{ backgroundColor: crop.color }}>
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{crop.icon}</span>
                        <span className="text-sm font-semibold text-[#374151] text-center leading-tight">{crop.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─── Step 2: Area & Date ────────────────────────────────────── */
function Step2({ crop, hectares, setHectares, startDate, setStartDate, province, pricePerKg, setPricePerKg }: {
    crop: Crop; hectares: number; setHectares: (v: number) => void;
    startDate: string; setStartDate: (v: string) => void; province: string;
    pricePerKg: number; setPricePerKg: (v: number) => void;
}) {
    const inputClass = "w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A4D2E] font-semibold text-[#111827] bg-[#F9FAFB] text-sm";
    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{crop.icon}</span>
                <div>
                    <h2 className="text-2xl font-bold text-[#111827] font-['Outfit']">Configurar a safra</h2>
                    <p className="text-[#6B7280] text-sm">Defina os parâmetros para <strong>{crop.name}</strong>.</p>
                </div>
            </div>
            <div className="flex flex-col gap-5">
                <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wide">Área a Plantar (Hectares)</label>
                    <input type="number" min={0.5} step={0.5} value={hectares}
                        onChange={e => setHectares(Number(e.target.value) || 1)}
                        className={inputClass} />
                    <p className="text-xs text-[#9CA3AF] mt-1.5">
                        Para {hectares} ha → Produção estimada: <strong className="text-[#111827]">{(crop.yieldPerHaKg * hectares).toLocaleString('pt-AO')} kg</strong>
                    </p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wide">Preço de Venda Esperado (AOA/kg)</label>
                    <input type="number" min={1} value={pricePerKg}
                        onChange={e => setPricePerKg(Number(e.target.value) || 100)}
                        className={inputClass} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wide">Data de Início Desejada</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                    <MapPin size={18} className="text-[#1A4D2E] shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-[#111827]">{province || 'Angola'}</p>
                        <p className="text-xs text-[#6B7280]">Dados climáticos e de solo serão carregados para esta localização</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Step 3: Loading ────────────────────────────────────────── */
function Step3({ onDone }: { onDone: () => void }) {
    const [currentMsg, setCurrentMsg] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const total = LOADING_STEPS.length;
        let idx = 0;
        const interval = setInterval(() => {
            idx++;
            setCurrentMsg(idx < total ? idx : total - 1);
            setProgress(Math.round((idx / total) * 100));
            if (idx >= total) {
                clearInterval(interval);
                setTimeout(onDone, 600);
            }
        }, 700);
        return () => clearInterval(interval);
    }, [onDone]);

    return (
        <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-[#E9EEE9] absolute"></div>
                <div className="w-24 h-24 rounded-full border-4 border-[#1A4D2E] border-t-transparent absolute animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    {LOADING_STEPS[currentMsg].icon}
                </div>
            </div>
            <h2 className="text-xl font-bold text-[#111827] font-['Outfit'] mb-2 text-center">A calcular a melhor estratégia...</h2>
            <p className="text-[#6B7280] text-sm text-center mb-6 min-h-[40px] transition-all duration-300 key={currentMsg}">
                {LOADING_STEPS[currentMsg].label}
            </p>
            <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1A4D2E] to-[#10B981] rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2">{progress}% concluído</p>
        </div>
    );
}

/* ─── Step 4: Viability Panel ────────────────────────────────── */
function Step4({ plan }: { plan: PlanRecord }) {
    const totalCost = plan.crop.costPerHa * plan.hectares;
    const totalYield = plan.crop.yieldPerHaKg * plan.hectares;
    const revenue = totalYield * plan.pricePerKg;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';
    const plantDate = addWeeks(plan.startDate, 2);

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-[#111827] font-['Outfit'] mb-1">Vale a pena plantar?</h2>
            <p className="text-[#6B7280] text-sm mb-6">Análise gerada para <strong>{plan.hectares} ha de {plan.crop.name}</strong></p>

            <div className="flex flex-col gap-4">
                {/* Climate Card */}
                <div className="flex items-start gap-4 p-4 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE]">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 flex items-center justify-center shrink-0">
                        <CloudRain size={20} className="text-[#3B82F6]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#1E40AF]">Janela de Plantio Detectada ✓</p>
                        <p className="text-sm text-[#3B82F6] mt-0.5">Data ideal sugerida: <strong>{plantDate}</strong></p>
                        <p className="text-xs text-[#6B7280] mt-1">Análise histórica de chuvas de {plan.province} indica boa precipitação neste período.</p>
                    </div>
                </div>

                {/* Soil Card */}
                <div className="flex items-start gap-4 p-4 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0]">
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 flex items-center justify-center shrink-0">
                        <Leaf size={20} className="text-[#10B981]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#065F46]">Solo Compatível com {plan.crop.name} ✓</p>
                        <p className="text-xs text-[#6B7280] mt-1">pH 6.5 (Neutro) · Solo franco-argiloso · Nitrogénio alto</p>
                    </div>
                </div>

                {/* ROI Card */}
                <div className="rounded-2xl overflow-hidden border border-[#E9EEE9]">
                    <div className="bg-[#111827] p-5 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-[#F7C04A]" />
                            <span className="font-bold text-sm text-white/80">Estimativa Financeira</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Custo Total Estimado</span>
                            <span className="font-semibold">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Receita Potencial</span>
                            <span className="font-semibold">{formatCurrency(revenue)}</span>
                        </div>
                        <div className="h-px bg-[#374151] my-3"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg font-['Outfit']">Lucro Potencial</span>
                            <div className="text-right">
                                <p className={`text-2xl font-black font-['Outfit'] ${profit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                    {formatCurrency(profit)}
                                </p>
                                <p className={`text-xs font-semibold ${profit >= 0 ? 'text-[#34D399]' : 'text-[#FCA5A5]'}`}>
                                    Margem: {margin}%
                                </p>
                            </div>
                        </div>
                    </div>
                    {profit < 0 && (
                        <div className="flex items-start gap-2 p-3 bg-[#FFF7ED] border-t border-[#FED7AA]">
                            <AlertTriangle size={14} className="text-[#D48806] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#B45309]">Prejuízo estimado. Considere aumentar o preço de venda ou reduzir a área.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Step 5: Timeline Result ────────────────────────────────── */
function Step5({ plan, savedPlan }: { plan: PlanRecord; savedPlan: Plan | null }) {
    const startDate = new Date(plan.startDate);

    // Use API timeline if available, else compute locally
    const apiTimeline = savedPlan?.timeline ?? null;
    const localTimeline = [
        { week: 1, phase: 'Preparação', label: 'Preparação do solo, compra e organização de insumos.', date: addWeeks(plan.startDate, 0) },
        { week: 2, phase: 'Plantio', label: `Data ideal para o plantio de ${plan.crop.name}.`, date: addWeeks(plan.startDate, 2) },
        { week: 6, phase: '1ª Adubação', label: 'Primeira cobertura com NPK. Monitorar humidade.', date: addWeeks(plan.startDate, 6) },
        { week: 10, phase: 'Monitorização', label: 'Inspecionar pragas e doenças. 2ª adubação se necessário.', date: addWeeks(plan.startDate, 10) },
        { week: plan.crop.growWeeks, phase: 'Colheita', label: `Janela de colheita. Produção esperada: ${(plan.crop.yieldPerHaKg * plan.hectares).toLocaleString('pt-AO')} kg.`, date: addWeeks(plan.startDate, plan.crop.growWeeks) },
    ];
    const timeline = apiTimeline
        ? apiTimeline.map(t => ({ ...t, label: '', date: new Date(t.date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }) }))
        : localTimeline;

    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#1A4D2E'];

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={24} className="text-[#10B981]" />
                <h2 className="text-2xl font-bold text-[#111827] font-['Outfit']">Plano gerado com sucesso!</h2>
            </div>
            <p className="text-[#6B7280] text-sm mb-6">
                Cronograma para <strong>{plan.hectares} ha de {plan.crop.name}</strong> · Início: {startDate.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long' })}
            </p>

            <div className="relative pl-6 border-l-2 border-[#E5E7EB] flex flex-col gap-6 mb-8">
                {timeline.map((t, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm text-xs"
                            style={{ backgroundColor: colors[Math.min(i, colors.length - 1)] }}>
                            {i === timeline.length - 1 ? <Combine size={12} className="text-white" /> :
                                i === 1 ? <Sprout size={12} className="text-white" /> :
                                    <Droplets size={12} className="text-white" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white text-[10px]"
                                    style={{ backgroundColor: colors[Math.min(i, colors.length - 1)] }}>
                                    {t.phase}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-[#9CA3AF]"><Calendar size={10} /> {t.date}</span>
                            </div>
                            {t.label && <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">{t.label}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#E5E7EB] hover:bg-gray-50 transition-colors text-sm font-semibold text-[#374151]">
                    <Download size={16} /> Exportar PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5A] transition-colors text-sm font-semibold text-white">
                    <Share2 size={16} /> Partilhar WhatsApp
                </button>
            </div>
        </div>
    );
}

/* ─── Main Wizard ────────────────────────────────────────────── */
export default function PlanningWizard({
    isOpen, onClose, defaultProvince = 'Angola', defaultHectares = 10,
    crops, verdictText, aiSuggestions = {}, onPlanCreated, onPlanSaved
}: PlanningWizardProps) {
    const activeCrops = crops && crops.length > 0 ? crops : FALLBACK_CROPS;
    const [step, setStep] = useState<Step>(1);
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [hectares, setHectares] = useState(defaultHectares);
    const [pricePerKg, setPricePerKg] = useState(150);
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [savedPlan, setSavedPlan] = useState<Plan | null>(null);

    // Reset when reopened
    useEffect(() => {
        if (isOpen) { setStep(1); setSelectedCrop(null); setHectares(defaultHectares); setStartDate(today); setSavedPlan(null); setCreateError(''); }
    }, [isOpen, defaultHectares, today]);

    if (!isOpen) return null;

    const plan: PlanRecord | null = selectedCrop ? {
        crop: selectedCrop, hectares, startDate, province: defaultProvince, pricePerKg
    } : null;

    const handleCropSelect = (crop: Crop) => {
        setSelectedCrop(crop);
        // Pre-fill start date from AI suggestion if available
        if (aiSuggestions[crop.id]) setStartDate(aiSuggestions[crop.id]);
        setStep(2);
    };

    const handleNext = async () => {
        if (step === 2) {
            setStep(3); // trigger loading animation
        } else if (step === 4) {
            if (!plan || !selectedCrop) return;
            setCreating(true);
            setCreateError('');
            try {
                const created = await createPlan({
                    cropId: selectedCrop.id,
                    hectares,
                    startDate,
                    pricePerKgAoa: pricePerKg,
                    province: defaultProvince ?? 'Angola',
                    aiVerdictUsed: verdictText,
                });
                setSavedPlan(created);
                onPlanCreated?.(plan);
                onPlanSaved?.(created);
                setStep(5);
            } catch (e) {
                setCreateError(e instanceof Error ? e.message : 'Erro ao guardar o plano. Tente novamente.');
            } finally {
                setCreating(false);
            }
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        else if (step === 4) setStep(2);
    };

    const showBack = step === 2 || step === 4;
    const showNext = step === 2 || step === 4;
    const isStep5 = step === 5;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in" onClick={isStep5 ? onClose : undefined} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-['Inter'] animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-0">
                        {step !== 3 && step !== 1 && (
                            <div className="text-xs font-bold uppercase tracking-widest text-[#1A4D2E]">
                                {step === 2 ? `Passo 2 — Área & Datas` : step === 4 ? 'Passo 3 — Análise' : 'Resultado'}
                            </div>
                        )}
                        {(step === 1 || step === 3) && <div />}
                        <button onClick={onClose}
                            className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-[#6B7280] shrink-0">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 pt-4">
                        {step !== 3 && <StepIndicator current={step} />}

                        {/* Steps */}
                        {step === 1 && <Step1 crops={activeCrops} onSelect={handleCropSelect} />}
                        {step === 2 && selectedCrop && (
                            <Step2 crop={selectedCrop} hectares={hectares} setHectares={setHectares}
                                startDate={startDate} setStartDate={setStartDate} province={defaultProvince}
                                pricePerKg={pricePerKg} setPricePerKg={setPricePerKg} />
                        )}
                        {step === 3 && <Step3 onDone={() => setStep(4)} />}
                        {step === 4 && plan && (
                            <>
                                <Step4 plan={plan} />
                                {createError && (
                                    <p className="text-sm font-medium text-[#DC2626] mt-3 text-center">{createError}</p>
                                )}
                            </>
                        )}
                        {step === 5 && plan && <Step5 plan={plan} savedPlan={savedPlan} />}
                    </div>

                    {/* Footer nav */}
                    {(showBack || showNext || isStep5) && (
                        <div className="flex gap-3 px-6 pb-6 pt-2">
                            {showBack && (
                                <button onClick={handleBack}
                                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#E5E7EB] hover:bg-gray-50 transition-colors font-semibold text-[#374151] text-sm">
                                    <ChevronLeft size={16} /> Voltar
                                </button>
                            )}
                            {showNext && (
                                <button onClick={handleNext} disabled={creating}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1A4D2E] hover:bg-[#123520] text-white font-bold transition-colors text-sm shadow-md disabled:opacity-60">
                                    {creating
                                        ? <><Loader2 size={16} className="animate-spin" /> A guardar…</>
                                        : <>{step === 4 ? 'Confirmar e Gerar Cronograma' : 'Analisar Viabilidade'}<ChevronRight size={16} /></>}
                                </button>
                            )}
                            {isStep5 && (
                                <button onClick={onClose}
                                    className="flex-1 py-3.5 rounded-xl bg-[#F7C04A] hover:bg-[#F5B027] text-[#123520] font-bold transition-colors text-sm">
                                    Ver no Dashboard
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
                .animate-fade-in { animation: fade-in 0.2s ease }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16,1,0.3,1) }
            `}</style>
        </>
    );
}
