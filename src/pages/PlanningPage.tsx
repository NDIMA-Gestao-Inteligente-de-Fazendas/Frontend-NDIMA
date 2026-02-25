import { useState, useEffect } from 'react';
import {
    MapPin, Sun, Leaf, Sprout, Combine,
    AlertTriangle, CheckCircle2, Calculator,
    Download, Droplets, FlaskConical
} from 'lucide-react';
import { getOnboardingStatus } from '../services/authService';
import PlanningWizard from '../components/PlanningWizard';

const CROPS = [
    { id: 'milho', name: 'Milho', icon: '🌽', costPerHa: 450000, yieldPerHaKg: 5000 },
    { id: 'soja', name: 'Soja', icon: '🌱', costPerHa: 600000, yieldPerHaKg: 3500 },
    { id: 'cafe', name: 'Café (Arábica)', icon: '☕', costPerHa: 850000, yieldPerHaKg: 2000 },
    { id: 'feijao', name: 'Feijão', icon: '🫘', costPerHa: 350000, yieldPerHaKg: 1500 },
];

export default function PlanningPage() {
    const [farm, setFarm] = useState<{ name?: string; province?: string; cultivableArea?: number }>({});
    const [wizardOpen, setWizardOpen] = useState(false);

    // Simulator state
    const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);
    const [hectares, setHectares] = useState<number>(0);
    const [pricePerKg, setPricePerKg] = useState<number>(150);

    useEffect(() => {
        getOnboardingStatus().then(s => {
            if (s.farm) {
                setFarm(s.farm);
                setHectares(s.farm.cultivableArea || 10);
            }
        }).catch(() => { });
    }, []);

    // Derived Financials
    const totalCost = selectedCrop.costPerHa * hectares;
    const expectedYield = selectedCrop.yieldPerHaKg * hectares;
    const grossRevenue = expectedYield * pricePerKg;
    const profit = grossRevenue - totalCost;
    const profitMargin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;

    const formatCurrency = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8 font-['Inter']">

            {/* ── A. Header Dinâmico ── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#E9EEE9] shadow-sm">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#111827] font-['Outfit']">
                        {farm.name || 'A Minha Fazenda'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#1A4D2E]" /> {farm.province || 'Angola'}</span>
                        <div className="w-px h-4 bg-[#E5E7EB]" />
                        <span className="flex items-center gap-1.5 font-medium"><Sun size={16} className="text-[#D48806]" /> 25°C · Encoberto</span>
                    </div>
                </div>
                <button onClick={() => setWizardOpen(true)}
                    className="bg-[#1A4D2E] hover:bg-[#123520] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Sprout size={18} /> Novo Planeamento de Safra
                </button>
            </header>

            {/* ── B. Diagnóstico de Solo ── */}
            <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <FlaskConical size={20} className="text-[#1A4D2E]" />
                    <h2 className="text-xl font-bold text-[#111827] font-['Outfit']">Diagnóstico do Solo</h2>
                    <span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">Dados: SoilGrids</span>
                </div>
                <br />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* pH */}
                    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                        <span className="text-sm font-semibold text-[#6B7280]">pH do Solo</span>
                        <div className="relative w-32 h-16 overflow-hidden flex items-end justify-center mb-2">
                            {/* Semi-circle gauge background */}
                            <div className="w-32 h-32 rounded-full border-[12px] border-gradient-to-r from-red-400 via-green-500 to-blue-400 absolute top-0 
                                opacity-30" style={{ backgroundImage: 'conic-gradient(from 270deg at 50% 50%, #EF4444 0deg, #10B981 90deg, #3B82F6 180deg)', borderRadius: '50%' }}></div>
                            {/* Gauge cover */}
                            <div className="w-[104px] h-[52px] bg-[#F9FAFB] rounded-t-full absolute bottom-0 z-10 flex items-end justify-center pb-1">
                                <span className="text-2xl font-bold font-['Outfit'] text-[#111827]">6.5</span>
                            </div>
                            {/* Needle (simulated at 90deg/Neutral) */}
                            <div className="absolute bottom-0 w-1 h-14 bg-gray-800 origin-bottom transform rotate-0 z-20 rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold text-[#10B981] mt-1">Neutro (Ideal)</span>
                    </div>

                    {/* Composição */}
                    <div className="flex flex-col justify-center p-6 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                        <span className="text-sm font-semibold text-[#6B7280] mb-5 text-center block">Textura (Argila / Areia / Silte)</span>
                        <div className="flex items-center justify-center gap-6 flex-1">
                            {/* Simple Pie Chart using conic-gradient */}
                            <div className="w-20 h-20 rounded-full shrink-0"
                                style={{ background: 'conic-gradient(#8B4513 0% 40%, #E6C280 40% 75%, #A0522D 75% 100%)' }}></div>
                            <div className="flex flex-col justify-center gap-2 text-xs font-medium text-[#4B5563]">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8B4513]"></span> Argila (40%)</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#E6C280]"></span> Areia (35%)</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#A0522D]"></span> Silte (25%)</div>
                            </div>
                        </div>
                    </div>

                    {/* Nutrientes */}
                    <div className="flex flex-col justify-center gap-6 p-6 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1.5"><span className="text-[#4B5563]">Nitrogénio (N)</span><span className="text-[#10B981]">Alto</span></div>
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"><div className="w-[80%] h-full bg-[#10B981] rounded-full"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1.5"><span className="text-[#4B5563]">Matéria Orgânica</span><span className="text-[#F59E0B]">Médio</span></div>
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"><div className="w-[55%] h-full bg-[#F59E0B] rounded-full"></div></div>
                        </div>
                    </div>
                </div>
                <br />
                {/* AI Insight */}
                <div className="mt-6 flex items-start gap-3 p-4 bg-gradient-to-r from-[#1A4D2E]/10 to-transparent rounded-xl border border-[#1A4D2E]/20">
                    <span className="text-xl">🤖</span>
                    <div>
                        <p className="text-sm font-semibold text-[#111827]">Veredito MNDIMA IA</p>
                        <p className="text-sm text-[#4B5563] mt-0.5">O seu solo franco-argiloso com pH 6.5 é <strong>excelente para Cereais (Milho, Sorgo)</strong>. Recomendamos ligeira aplicação de composto orgânico antes do plantio para elevar os níveis de Matéria Orgânica.</p>
                    </div>
                </div>
            </section>

            {/* ── C. Simulador de Culturas & D. Gestão de Operações ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Simulador de Culturas */}
                <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Calculator size={20} className="text-[#1A4D2E]" />
                            <h2 className="text-xl font-bold text-[#111827] font-['Outfit']">Simulador de Safra</h2>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {CROPS.map(crop => (
                            <button key={crop.id} onClick={() => setSelectedCrop(crop)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all font-semibold text-sm
                                    ${selectedCrop.id === crop.id ? 'border-[#1A4D2E] bg-[#1A4D2E] text-white shadow-md' : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#1A4D2E]/50'}`}>
                                <span className="text-base">{crop.icon}</span> {crop.name}
                            </button>
                        ))}
                    </div>
                    <br />
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Área a Plantar (Hectares)</label>
                            <input type="number" min="1" value={hectares} onChange={(e) => setHectares(Number(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A4D2E] font-bold text-[#111827] bg-[#F9FAFB]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Preço Venda (AOA/Kg)</label>
                            <input type="number" min="1" value={pricePerKg} onChange={(e) => setPricePerKg(Number(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A4D2E] font-bold text-[#111827] bg-[#F9FAFB]" />
                        </div>
                    </div>
                    <br />
                    <div className="bg-[#111827] rounded-2xl p-5 text-white mt-auto">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[#9CA3AF] text-sm">Custo Estimado</span>
                            <span className="font-semibold text-white">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[#9CA3AF] text-sm">Receita Bruta Esperada</span>
                            <span className="font-semibold text-white">{formatCurrency(grossRevenue)}</span>
                        </div>
                        <div className="h-px w-full bg-[#374151] my-3"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold font-['Outfit'] text-lg">Lucro Previsto</span>
                            <div className="text-right">
                                <span className={`font-black font-['Outfit'] text-2xl ${profit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                    {formatCurrency(profit)}
                                </span>
                                <p className={`text-xs font-semibold mt-1 ${profit >= 0 ? 'text-[#34D399]' : 'text-[#FCA5A5]'}`}>
                                    Margem: {profitMargin.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                    <br />
                    <button className="w-full mt-4 bg-[#F7C04A] hover:bg-[#F5B027] text-[#123520] font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                        Confirmar este Plano
                    </button>
                </section>

                {/* Timeline & Checklist */}
                <div className="flex flex-col gap-6">
                    {/* Linha do tempo */}
                    <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[#111827] font-['Outfit']">Cronograma da Safra</h2>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#F3F4F6] text-[#6B7280]">Meteorologia Integrada</span>
                        </div>

                        <div className="relative pl-6 border-l-2 border-[#E5E7EB] flex flex-col gap-8">
                            {/* Phase 1 */}
                            <div className="relative">
                                <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-4 border-white bg-[#10B981] flex items-center justify-center shadow-sm">
                                    <CheckCircle2 size={12} className="text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-[#111827]">Preparação & Plantio</h3>
                                <p className="text-xs text-[#6B7280] mt-1">10 de Out — 25 de Out</p>
                                {/* Climate Alert */}
                                <div className="mt-3 flex items-start gap-2 p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg">
                                    <AlertTriangle size={14} className="text-[#D48806] shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-[#B45309]">Alerta de Seca (Previsão): Atrasar o plantio em 3 dias para apanhar a janela de chuva de 14 de Out.</p>
                                </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="relative">
                                <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-4 border-white bg-[#3B82F6] shadow-sm"></div>
                                <h3 className="text-sm font-bold text-[#111827]">Desenvolvimento & Nutrição</h3>
                                <p className="text-xs text-[#6B7280] mt-1">Nov — Fev</p>
                                <p className="text-xs text-[#4B5563] mt-2 flex items-center gap-1.5"><Droplets size={12} /> 1ª Cobertura NPK (Estimada: 15 Nov)</p>
                            </div>

                            {/* Phase 3 */}
                            <div className="relative">
                                <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-4 border-white bg-[#E5E7EB] shadow-sm"></div>
                                <h3 className="text-sm font-bold text-[#4B5563]">Colheita Estimada</h3>
                                <p className="text-xs text-[#9CA3AF] mt-1">Mar — Abr</p>
                                <p className="text-xs text-[#9CA3AF] mt-2 flex items-center gap-1.5"><Combine size={12} /> Rendimento esperado: {expectedYield.toLocaleString('pt-AO')} kg</p>
                            </div>
                        </div>
                    </section>

                    {/* Checklist Logística */}
                    <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-bold text-[#111827] font-['Outfit']">Necessidades Logísticas</h2>
                            <button className="text-[#1A4D2E] hover:bg-[#F3F4F6] p-1.5 rounded-lg transition-colors" title="Exportar PDF">
                                <Download size={18} />
                            </button>
                        </div>
                        <ul className="flex flex-col gap-4">
                            <li className="flex justify-between items-center text-sm border-b border-[#F3F4F6] pb-2">
                                <span className="text-[#4B5563] flex items-center gap-2"><Leaf size={14} className="text-[#10B981]" /> Sementes ({selectedCrop.name})</span>
                                <span className="font-semibold text-[#111827]">{hectares * 20} kg</span>
                            </li>
                            <li className="flex justify-between items-center text-sm border-b border-[#F3F4F6] pb-2">
                                <span className="text-[#4B5563] flex items-center gap-2"><FlaskConical size={14} className="text-[#F59E0B]" /> Fertilizante (NPK)</span>
                                <span className="font-semibold text-[#111827]">{hectares * 150} kg</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-[#4B5563] flex items-center gap-2"><Droplets size={14} className="text-[#3B82F6]" /> Combustível Trator</span>
                                <span className="font-semibold text-[#111827]">{hectares * 45} L</span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>

            <PlanningWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                defaultProvince={farm.province}
                defaultHectares={farm.cultivableArea}
            />
        </div>
    );
}
