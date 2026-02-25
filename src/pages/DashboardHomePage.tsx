import { useState, useEffect } from 'react';
import {
    Bell, Tractor, BarChart3, CalendarCheck,
    TrendingUp, AlertTriangle, Droplets, Leaf, ChevronRight
} from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import {
    getMe, getDashboardStats, getFarmHealthHistory, getNotifications, getUnreadCount,
    type UserProfile, type DashboardStats, type FarmHealthHistory, type Notification,
} from '../services/authService';

/* ─────────── Notification icon/color map ─────────── */
const NOTIF_STYLE: Record<string, { icon: any; color: string; bg: string }> = {
    STOCK_ALERT: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB' },
    WATER_ALERT: { icon: Droplets, color: '#3B82F6', bg: '#EFF6FF' },
    TASK_OVERDUE: { icon: CalendarCheck, color: '#EF4444', bg: '#FEF2F2' },
    AGRO_TIP: { icon: Leaf, color: '#10B981', bg: '#ECFDF5' },
    SYSTEM: { icon: Bell, color: '#1A4D2E', bg: '#ECFDF5' },
};

/* ─────────── SVG sparkline helper ─────────── */
function buildSparklinePath(data: { month: string; value: number }[]): {
    path: string; points: [number, number][];
} {
    if (!data.length) return { path: '', points: [] };
    const W = 840, H = 80, padding = 8;
    const vals = data.map(d => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;

    const coords: [number, number][] = data.map((d, i) => [
        Math.round((i / Math.max(data.length - 1, 1)) * W),
        Math.round(H - padding - ((d.value - min) / range) * (H - padding * 2)),
    ]);

    const path = coords
        .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
        .join(' ');

    return { path, points: coords };
}

/* ─────────── Sub-components ─────────── */
function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: any; label: string; value: string; sub: string; color: string;
}) {
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

function NotifCard({ icon: Icon, color, bg, label, desc }: {
    icon: any; color: string; bg: string; label: string; desc: string;
}) {
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

function QuickAction({ icon: Icon, label, desc, color }: {
    icon: any; label: string; desc: string; color: string;
}) {
    return (
        <button className="group flex items-center gap-4 w-full px-5 py-4 bg-white border border-[#E9EEE9] rounded-2xl
            hover:border-transparent hover:shadow-md transition-all text-left">
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

    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [history, setHistory] = useState<FarmHealthHistory | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        getMe().then(setUser).catch(() => { });
        getDashboardStats().then(setStats).catch(() => { });
        getFarmHealthHistory().then(setHistory).catch(() => { });
        getNotifications().then(setNotifications).catch(() => { });
        getUnreadCount().then(r => setUnreadCount(r.unread)).catch(() => { });
    }, []);

    /* Build stat cards from real data */
    const STATS = [
        {
            icon: Leaf, label: 'Área Cultivada', color: '#1A4D2E',
            value: user?.farm?.cultivableArea ? `${user.farm.cultivableArea} ha` : '—',
            sub: user?.farm?.province ?? 'Angola',
        },
        {
            icon: Tractor, label: 'Operações Hoje', color: '#F59E0B',
            value: stats ? String(stats.operacoesHoje) : '—',
            sub: 'agendadas',
        },
        {
            icon: CalendarCheck, label: 'Tarefas Pendentes', color: '#EF4444',
            value: stats ? String(stats.tarefasPendentes.total) : '—',
            sub: stats ? `${stats.tarefasPendentes.emAtraso} em atraso` : '—',
        },
        {
            icon: TrendingUp, label: 'Saúde da Fazenda', color: '#3B82F6',
            value: stats ? `${stats.saudeFazenda.percentual}%` : '—',
            sub: stats
                ? (stats.saudeFazenda.variacaoMensal >= 0
                    ? `↑ +${stats.saudeFazenda.variacaoMensal}% este mês`
                    : `↓ ${stats.saudeFazenda.variacaoMensal}% este mês`)
                : '—',
        },
    ];

    /* Build sparkline from real history */
    const sparkData = history?.data ?? [];
    const { path: sparkPath, points: sparkPoints } = buildSparklinePath(sparkData);
    const sparkMonths = sparkData.map(d => d.month);

    /* Health variation label for chart header */
    const healthVariation = stats?.saudeFazenda.variacaoMensal ?? 0;
    const healthLabel = healthVariation >= 0
        ? `Este mês ↑ +${healthVariation}%`
        : `Este mês ↓ ${healthVariation}%`;

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8 font-['Inter']">
            {/* ── TOP: header ── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] leading-tight">
                        {greeting}{user ? `, ${user.firstName}` : ''} 👋
                    </h1>
                    <p className="text-sm text-[#9CA3AF] mt-1 capitalize">
                        {user?.farm?.name
                            ? <><span className="text-[#1A4D2E] font-semibold">{user.farm.name}</span> · </>
                            : null}
                        {dateLabel}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-[#E9EEE9] rounded-2xl px-5 py-3 shadow-sm select-none">
                    <Bell size={18} className="text-[#1A4D2E]" />
                    <span className="text-sm font-semibold text-[#111827]">{unreadCount} alertas</span>
                    {unreadCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />}
                </div>
            </header>

            {/* ── ROW 1: Weather & Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Weather */}
                <div className="lg:col-span-5 h-[340px]">
                    <WeatherCard province={user?.farm?.province} />
                </div>

                {/* Stats 2×2 */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {STATS.map(s => (
                        <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} color={s.color} />
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
                            style={{ background: '#1A4D2E' }}>{notifications.length}</span>
                    </div>

                    {notifications.length === 0 ? (
                        <p className="text-sm text-[#9CA3AF] text-center py-6">Sem notificações de momento.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {notifications.map(n => {
                                const style = NOTIF_STYLE[n.type] ?? NOTIF_STYLE.SYSTEM;
                                return (
                                    <NotifCard
                                        key={n._id}
                                        icon={style.icon}
                                        color={style.color}
                                        bg={style.bg}
                                        label={n.title}
                                        desc={n.description}
                                    />
                                );
                            })}
                        </div>
                    )}
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
                    {stats && (
                        <span className="text-sm font-semibold px-3 py-1.5 rounded-full"
                            style={{ background: 'rgba(26,77,46,0.09)', color: '#1A4D2E' }}>
                            {healthLabel}
                        </span>
                    )}
                </div>

                {sparkData.length > 0 ? (
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
                                <path d={sparkPath} fill="none" stroke="#1A4D2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d={`${sparkPath} L840,80 L0,80 Z`} fill="url(#cg)" />
                                {sparkPoints.map(([x, y], i) => (
                                    <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#1A4D2E" strokeWidth="2" />
                                ))}
                            </svg>
                            <div className="flex justify-between text-xs text-[#9CA3AF] mt-2 px-1">
                                {sparkMonths.map(m => <span key={m}>{m}</span>)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-[#9CA3AF] text-center py-6">Sem dados históricos disponíveis.</p>
                )}
            </div>
        </div>
    );
}
