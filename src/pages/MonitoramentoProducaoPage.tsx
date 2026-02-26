import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip as ChartTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    AlertTriangle, TrendingUp, TrendingDown, Minus,
    PackageCheck, Coins, BarChart2, CircleDollarSign, ShieldAlert
} from 'lucide-react';

/* ─── Mock data ─────────────────────────────────────────────────────────── */

const PRODUCTION_HISTORY = [
    { month: 'Out', produced: 0, target: 0, loss: 0 },
    { month: 'Nov', produced: 480, target: 500, loss: 20 },
    { month: 'Dez', produced: 1100, target: 1200, loss: 100 },
    { month: 'Jan', produced: 2300, target: 2500, loss: 200 },
    { month: 'Fev', produced: 3100, target: 3500, loss: 400 },
    { month: 'Mar', produced: 4800, target: 5000, loss: 200 },
];

const LOSS_CAUSES = [
    { cause: 'Pragas (Lagarta do Funil)', kg: 320, pct: 38, color: '#ef4444', icon: '🐛' },
    { cause: 'Stress Hídrico', kg: 215, pct: 26, color: '#f97316', icon: '💧' },
    { cause: 'Doenças Fúngicas', kg: 180, pct: 22, color: '#eab308', icon: '🍄' },
    { cause: 'Perdas na Colheita', kg: 115, pct: 14, color: '#9ca3af', icon: '⚙️' },
];

const COSTS = [
    { category: 'Sementes', planned: 1200000, actual: 1150000, icon: '🌱', color: '#10b981' },
    { category: 'Fertilizantes', planned: 2800000, actual: 3100000, icon: '🧪', color: '#f59e0b' },
    { category: 'Pesticidas', planned: 800000, actual: 950000, icon: '💦', color: '#f97316' },
    { category: 'Mão-de-obra', planned: 3500000, actual: 3500000, icon: '👨‍🌾', color: '#6366f1' },
    { category: 'Combustível', planned: 600000, actual: 680000, icon: '⛽', color: '#8b5cf6' },
    { category: 'Irrigação', planned: 400000, actual: 320000, icon: '💧', color: '#3b82f6' },
];

const TOTAL_PLANNED = COSTS.reduce((s, c) => s + c.planned, 0);
const TOTAL_ACTUAL = COSTS.reduce((s, c) => s + c.actual, 0);
const OVER_BUDGET = TOTAL_ACTUAL > TOTAL_PLANNED;
const TOTAL_LOSS_KG = LOSS_CAUSES.reduce((s, l) => s + l.kg, 0);
const TOTAL_PROD_KG = PRODUCTION_HISTORY.reduce((s, m) => s + m.produced, 0);

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

/* ─── KPI Card component ─────────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, sub, color, trend }: {
    icon: React.ElementType; label: string; value: string; sub?: string;
    color: string; trend?: 'up' | 'down' | 'flat';
}) {
    return (
        <div className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={20} style={{ color }} />
                </div>
                {trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                {trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                {trend === 'flat' && <Minus size={16} className="text-gray-400" />}
            </div>
            <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">{label}</p>
                <p className="text-2xl font-black font-['Outfit'] text-[#111827]">{value}</p>
                {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function MonitoramentoProducaoPage() {
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8 font-['Inter']">

            {/* Header */}
            <header className="flex items-center justify-between bg-white rounded-2xl p-6 border border-[#E9EEE9] shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 size={20} className="text-[#1A4D2E]" />
                        <h1 className="text-2xl font-bold text-[#111827] font-['Outfit']">Produção, Perdas e Custos</h1>
                    </div>
                    <p className="text-sm text-[#6B7280]">Safra 2025/26 · Dados actualizados em tempo real</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#1A4D2E] transition-all">
                    ↓ Exportar Relatório
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard icon={PackageCheck} label="Produção Actual" color="#10b981"
                    value={`${(TOTAL_PROD_KG / 1000).toFixed(1)} t`}
                    sub="Acumulada esta safra" trend="up" />
                <KpiCard icon={AlertTriangle} label="Perdas Totais" color="#ef4444"
                    value={`${TOTAL_LOSS_KG} kg`}
                    sub={`${((TOTAL_LOSS_KG / TOTAL_PROD_KG) * 100).toFixed(1)}% da colheita`} trend="down" />
                <KpiCard icon={CircleDollarSign} label="Custo Total Real" color={OVER_BUDGET ? '#ef4444' : '#10b981'}
                    value={`${(TOTAL_ACTUAL / 1000000).toFixed(1)}M Kz`}
                    sub={OVER_BUDGET ? `+${(((TOTAL_ACTUAL - TOTAL_PLANNED) / TOTAL_PLANNED) * 100).toFixed(0)}% acima do orçado` : 'Dentro do orçamento'}
                    trend={OVER_BUDGET ? 'down' : 'up'} />
                <KpiCard icon={TrendingUp} label="Margem Prevista" color="#6366f1"
                    value="38%"
                    sub="Receita estimada: 14.5M Kz" trend="up" />
            </div>

            {/* Production Chart + Loss Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Bar Chart */}
                <section className="lg:col-span-3 bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <PackageCheck size={18} className="text-[#10b981]" />
                                <h2 className="text-base font-bold text-[#111827] font-['Outfit']">Produção Mensal vs. Meta</h2>
                            </div>
                            <p className="text-xs text-[#9CA3AF]">Acumulado da safra · kg colhidos por mês</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#10b981] border border-[#D1FAE5]">
                            Meta: 5 000 kg/mês
                        </span>
                    </div>

                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={PRODUCTION_HISTORY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <ChartTooltip
                                formatter={(val: number | undefined, name: string | undefined) => [
                                    `${(val ?? 0).toLocaleString('pt-AO')} kg`,
                                    name === 'produced' ? 'Colhido' : name === 'target' ? 'Meta' : 'Perdas'
                                ]}
                                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB' }}
                            />
                            <Legend formatter={v => v === 'produced' ? 'Colhido' : v === 'target' ? 'Meta' : 'Perdas'}
                                wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Bar dataKey="target" name="target" fill="#E5E7EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            <Bar dataKey="produced" name="produced" radius={[4, 4, 0, 0]} maxBarSize={28}>
                                {PRODUCTION_HISTORY.map((m, i) => (
                                    <Cell key={i} fill={m.produced >= m.target * 0.95 ? '#10b981' : m.produced > 0 ? '#f59e0b' : '#E5E7EB'} />
                                ))}
                            </Bar>
                            <Bar dataKey="loss" name="loss" fill="#fca5a5" radius={[4, 4, 0, 0]} maxBarSize={14} />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-4 flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            Em Fev a produção ficou <strong>11% abaixo da meta</strong>. Principal causa: stress hídrico no Setor Sul. Corrija a irrigação para recuperar em Março.
                        </p>
                    </div>
                </section>

                {/* Loss Causes */}
                <section className="lg:col-span-2 bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <ShieldAlert size={18} className="text-[#ef4444]" />
                        <h2 className="text-base font-bold text-[#111827] font-['Outfit']">Causas de Perdas</h2>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mb-5">
                        Total identificado: <strong className="text-[#111827]">{TOTAL_LOSS_KG} kg</strong>
                    </p>

                    <div className="flex flex-col gap-4">
                        {LOSS_CAUSES.map(loss => (
                            <div key={loss.cause}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-[#374151] flex items-center gap-1.5">
                                        <span>{loss.icon}</span> {loss.cause}
                                    </span>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-[#111827]">{loss.kg} kg</span>
                                        <span className="text-[10px] text-[#9CA3AF] ml-1">({loss.pct}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${loss.pct}%`, backgroundColor: loss.color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-800">
                        🐛 <strong>Pragas</strong> e <strong>stress hídrico</strong> juntos representam 64% das perdas — prioridade máxima de intervenção.
                    </div>
                </section>
            </div>

            {/* Cost Control */}
            <section className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Coins size={18} className="text-[#f59e0b]" />
                        <h2 className="text-lg font-bold text-[#111827] font-['Outfit']">Controlo de Custos</h2>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold
                        ${OVER_BUDGET ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        {OVER_BUDGET ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        Orçamento: {(TOTAL_PLANNED / 1_000_000).toFixed(1)}M Kz &nbsp;·&nbsp;
                        Real: {(TOTAL_ACTUAL / 1_000_000).toFixed(1)}M Kz &nbsp;·&nbsp;
                        {OVER_BUDGET
                            ? `+${(((TOTAL_ACTUAL - TOTAL_PLANNED) / TOTAL_PLANNED) * 100).toFixed(0)}% acima`
                            : `${(((TOTAL_PLANNED - TOTAL_ACTUAL) / TOTAL_PLANNED) * 100).toFixed(0)}% abaixo`}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {COSTS.map(cost => {
                        const diff = cost.actual - cost.planned;
                        const pct = ((cost.actual / cost.planned) * 100).toFixed(0);
                        const over = diff > 0;
                        return (
                            <div key={cost.category} className="p-4 rounded-2xl border border-[#F3F4F6] bg-[#FAFAFA] flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{cost.icon}</span>
                                        <span className="text-sm font-bold text-[#111827]">{cost.category}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${over ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {over ? `+${pct}%` : `${pct}%`}
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(Number(pct), 130)}%`, backgroundColor: over ? '#ef4444' : cost.color }} />
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <div>
                                        <p className="text-[#9CA3AF]">Orçado</p>
                                        <p className="font-semibold text-[#374151]">{fmt(cost.planned)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#9CA3AF]">Real</p>
                                        <p className={`font-bold ${over ? 'text-red-600' : 'text-green-600'}`}>{fmt(cost.actual)}</p>
                                    </div>
                                </div>
                                {diff !== 0 && (
                                    <p className={`text-[10px] font-semibold ${over ? 'text-red-500' : 'text-green-500'}`}>
                                        {over ? `▲ ${fmt(diff)} acima do orçamento` : `▼ ${fmt(Math.abs(diff))} poupado`}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Margin summary */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 flex items-start gap-3 p-4 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            <strong>Fertilizantes e Pesticidas</strong> estão acima do orçamento. Custo extraordinário com pragas no Setor Sul. Monitorar pulverização preventiva nas próximas semanas.
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #1A4D2E, #2d6a47)' }}>
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Lucro Previsto</p>
                        <p className="text-3xl font-black text-[#F7C04A] font-['Outfit']">5.1M Kz</p>
                        <p className="text-xs text-white/70">Margem: <strong className="text-white">38%</strong></p>
                    </div>
                </div>
            </section>
        </div>
    );
}
