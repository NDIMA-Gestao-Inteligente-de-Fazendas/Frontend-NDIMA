import { useState, useEffect } from 'react';
import {
    Bell, Tractor, BarChart3, CalendarCheck,
    TrendingUp, AlertTriangle, Droplets, Leaf, ChevronRight
} from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import { getOnboardingStatus } from '../services/authService';

/* ─────────── Static data ─────────── */
const NOTIFICATIONS = [
    { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', label: 'Alerta de stocks', desc: 'Fertilizante abaixo do mínimo' },
    { icon: Droplets, color: '#3B82F6', bg: '#EFF6FF', label: 'Alerta hídrico', desc: 'Humidade baixa no Bloco 2' },
    { icon: CalendarCheck, color: '#EF4444', bg: '#FEF2F2', label: 'Tarefa em atraso', desc: 'Irrigação do Bloco 3' },
    { icon: Leaf, color: '#10B981', bg: '#ECFDF5', label: 'Dica agronómica', desc: 'Boa semana para plantar milho' },
];

const STATS = [
    { icon: Leaf, label: 'Área Cultivada', key: 'area', color: '#1A4D2E' },
    { icon: Tractor, label: 'Operações Hoje', value: '3', color: '#F59E0B', sub: 'agendadas' },
    { icon: CalendarCheck, label: 'Tarefas Pendentes', value: '5', color: '#EF4444', sub: '2 em atraso' },
    { icon: TrendingUp, label: 'Saúde da Fazenda', value: '78%', color: '#3B82F6', sub: '↑ +4% este mês' },
];

/* ─────────── Sub-components ─────────── */
function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-[#E9EEE9] shadow-sm flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={20} style={{ color }} />
                </span>
                <span className="text-3xl font-extrabold font-['Outfit'] tracking-tight" style={{ color }}>{value}</span>
            </div>
            <div className="mt-4">
                <p className="text-sm font-semibold text-[#111827]">{label}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>
            </div>
        </div>
    );
}

function NotifCard({ icon: Icon, color, bg, label, desc }: { icon: any; color: string; bg: string; label: string; desc: string }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-transparent transition-all hover:border-[#E9EEE9] hover:shadow-sm"
            style={{ background: bg }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                <Icon size={18} style={{ color }} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#111827] truncate">{label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 max-w-full drop-shadow-sm line-clamp-2">{desc}</p>
            </div>
        </div>
    );
}

function QuickAction({ icon: Icon, label, desc, color }: { icon: any; label: string; desc: string; color: string }) {
    return (
        <button className="group flex items-center gap-4 w-full px-5 py-4 bg-white border border-[#E9EEE9] rounded-2xl
            hover:border-transparent hover:shadow-md transition-all text-left"
            style={{ ['--hover-border' as any]: color }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{label}</p>
                <p className="text-xs text-[#9CA3AF]">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#D1D5DB] group-hover:text-[#6B7280] transition-colors flex-shrink-0" />
        </button>
    );
}

/* ─────────── Page ─────────── */
export default function DashboardHomePage() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const dateLabel = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

    const [farm, setFarm] = useState<{ name?: string; province?: string; cultivableArea?: number }>({});

    useEffect(() => {
        getOnboardingStatus().then(s => { if (s.farm) setFarm(s.farm); }).catch(() => { });
    }, []);

    const statsValues = [
        farm.cultivableArea ? `${farm.cultivableArea} ha` : '—',
        '3', '5', '78%',
    ];
    const statsSubs = [
        farm.province ?? 'Angola',
        'agendadas', '2 em atraso', '↑ +4% este mês',
    ];

    /* SVG sparkline path */
    const path = 'M0,72 C80,62 140,45 220,40 C300,35 350,50 430,32 C510,16 570,38 650,24 C720,14 780,30 840,18';

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8 font-['Inter']">
            {/* ── TOP: header ── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] leading-tight">
                        {greeting} 👋
                    </h1>
                    <p className="text-sm text-[#9CA3AF] mt-1 capitalize">
                        {farm.name
                            ? <><span className="text-[#1A4D2E] font-semibold">{farm.name}</span> · </>
                            : null}
                        {dateLabel}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-[#E9EEE9] rounded-2xl px-5 py-3 shadow-sm select-none">
                    <Bell size={18} className="text-[#1A4D2E]" />
                    <span className="text-sm font-semibold text-[#111827]">{NOTIFICATIONS.length} alertas</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                </div>
            </header>

            {/* ── ROW 1: Weather & Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Weather */}
                <div className="lg:col-span-5 h-[340px]">
                    <WeatherCard province={farm.province} />
                </div>

                {/* Stats 2×2 */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {STATS.map((s, i) => (
                        <StatCard
                            key={s.label}
                            icon={s.icon}
                            label={s.label}
                            value={statsValues[i]}
                            sub={statsSubs[i]}
                            color={s.color}
                        />
                    ))}
                </div>
            </div>

            {/* ── ROW 2: Notifications & Quick Actions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Notifications */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-[#1A4D2E]" />
                            <h2 className="font-bold text-[#111827] font-['Outfit'] text-lg">Notificações</h2>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                            style={{ background: '#1A4D2E' }}>{NOTIFICATIONS.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {NOTIFICATIONS.map(n => <NotifCard key={n.label} {...n} />)}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-[#111827] font-['Outfit'] text-lg">Ações Rápidas</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        <QuickAction icon={CalendarCheck} label="Nova Tarefa" desc="Agendar atividade" color="#1A4D2E" />
                        <QuickAction icon={Tractor} label="Ver Operações" desc="Gerir equipamentos" color="#F59E0B" />
                        <QuickAction icon={BarChart3} label="Monitoramento" desc="Análise de culturas" color="#3B82F6" />
                    </div>
                </div>
            </div>

            {/* ── BOTTOM: Chart ── */}
            <div className="bg-white rounded-2xl border border-[#E9EEE9] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#1A4D2E]" />
                        <h2 className="font-bold text-[#111827] font-['Outfit'] text-lg">Saúde da Fazenda</h2>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(26,77,46,0.09)', color: '#1A4D2E' }}>
                        Este mês ↑ +12%
                    </span>
                </div>
                <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div style={{ minWidth: '700px' }}>
                        <svg viewBox="0 0 840 80" className="w-full" style={{ height: 80, display: 'block' }}>
                            <defs>
                                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1A4D2E" stopOpacity=".14" />
                                    <stop offset="100%" stopColor="#1A4D2E" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[20, 50].map(y => <line key={y} x1="0" y1={y} x2="840" y2={y} stroke="#F3F4F6" strokeWidth="1" />)}
                            <path d={path} fill="none" stroke="#1A4D2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={`${path} L840,80 L0,80 Z`} fill="url(#cg)" />
                            {([[220, 40], [430, 32], [650, 24], [840, 18]] as [number, number][]).map(([x, y], i) => (
                                <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#1A4D2E" strokeWidth="2" />
                            ))}
                        </svg>
                        <div className="flex justify-between text-xs text-[#9CA3AF] mt-2 px-1">
                            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'].map(m => <span key={m}>{m}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
