import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import {
    Activity, Droplets, AlertTriangle, TrendingUp, TrendingDown,
    Leaf, Satellite, ZoomIn, RefreshCw, ChevronRight, Minus
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* ─── Mock data ─────────────────────────────────────────────────────────── */

const FARM_POLYGON: [number, number][] = [
    [-14.935, 13.542], [-14.928, 13.558],
    [-14.940, 13.565], [-14.950, 13.552],
    [-14.935, 13.542],
];

const NDVI_ZONES = [
    { id: 'north', label: 'Setor Norte', ndvi: 0.82, coords: [[-14.928, 13.542], [-14.925, 13.552], [-14.932, 13.558], [-14.935, 13.548]] as [number, number][] },
    { id: 'center', label: 'Setor Central', ndvi: 0.65, coords: [[-14.935, 13.548], [-14.932, 13.558], [-14.940, 13.563], [-14.944, 13.552]] as [number, number][] },
    { id: 'south', label: 'Setor Sul', ndvi: 0.38, coords: [[-14.944, 13.542], [-14.944, 13.552], [-14.940, 13.563], [-14.950, 13.552]] as [number, number][] },
];

const ALERTS = [
    { id: 1, level: 'critical', sector: 'Setor Sul', message: 'Stress hídrico severo detectado. NDWI abaixo do limiar crítico.', time: 'Hoje, 08:15', icon: Droplets },
    { id: 2, level: 'warning', sector: 'Setor Central', message: 'Vigor da planta 12% abaixo da curva ideal para esta fase da safra.', time: 'Ontem, 14:30', icon: TrendingDown },
    { id: 3, level: 'info', sector: 'Todos os setores', message: 'Nuvens detectadas na imagem de hoje. Próxima janela limpa: 27 Fev.', time: 'Hoje, 06:00', icon: Satellite },
    { id: 4, level: 'success', sector: 'Setor Norte', message: 'Crescimento semanal de +8% acima da média regional. Excelente vigor.', time: 'Há 2 dias', icon: Leaf },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function ndviColor(ndvi: number) {
    if (ndvi >= 0.75) return '#16a34a';
    if (ndvi >= 0.55) return '#86efac';
    if (ndvi >= 0.40) return '#fbbf24';
    if (ndvi >= 0.25) return '#f97316';
    return '#dc2626';
}

function ndviLabel(ndvi: number) {
    if (ndvi >= 0.75) return { text: 'Muito Saudável', color: '#16a34a' };
    if (ndvi >= 0.55) return { text: 'Saudável', color: '#22c55e' };
    if (ndvi >= 0.40) return { text: 'Stress Leve', color: '#f59e0b' };
    if (ndvi >= 0.25) return { text: 'Stress Moderado', color: '#f97316' };
    return { text: 'Stress Crítico', color: '#dc2626' };
}

function ndwiToWater(ndwi: number) {
    if (ndwi > 0.3) return { label: 'Baixa', color: '#10b981', pct: 25 };
    if (ndwi > 0.1) return { label: 'Moderada', color: '#f59e0b', pct: 55 };
    return { label: 'Alta', color: '#ef4444', pct: 85 };
}

function alertStyle(level: string) {
    if (level === 'critical') return { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-700' };
    if (level === 'warning') return { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' };
    if (level === 'success') return { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-700' };
    return { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' };
}

function FitBounds() {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(FARM_POLYGON.map(c => [c[0], c[1]]) as [[number, number], [number, number]], { padding: [30, 30] });
    }, [map]);
    return null;
}

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

export default function MonitoramentoSatelitePage() {
    const [activeZone, setActiveZone] = useState<string | null>(null);
    const [timelapse, setTimelapse] = useState(false);

    const avgNdvi = NDVI_ZONES.reduce((s, z) => s + z.ndvi, 0) / NDVI_ZONES.length;
    const avgLabel = ndviLabel(avgNdvi);
    const prevNdvi = 0.79;
    const weekChange = ((avgNdvi - prevNdvi) / prevNdvi * 100);
    const ndwi = avgNdvi - 0.25;
    const water = ndwiToWater(ndwi);
    const yieldEst = (avgNdvi * 8.5).toFixed(1);

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8 font-['Inter']">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#E9EEE9] shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Satellite size={20} className="text-[#1A4D2E]" />
                        <h1 className="text-2xl font-bold text-[#111827] font-['Outfit']">Monitoramento Satélite</h1>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">GEE · Sentinel-2</span>
                    </div>
                    <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                        <RefreshCw size={12} />
                        Última actualização: <strong>25 Fev 2026, 06:12 UTC</strong> · Satélite a cada 5 dias
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setTimelapse(t => !t)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all
                            ${timelapse ? 'bg-[#1A4D2E] text-white border-[#1A4D2E]' : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#1A4D2E]'}`}>
                        ▶ Ver Evolução (3 meses)
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#1A4D2E] transition-all">
                        <ZoomIn size={16} /> Ampliar Mapa
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Activity} label="Índice de Saúde (NDVI)" value={avgNdvi.toFixed(2)} sub={avgLabel.text} color={avgLabel.color} trend={weekChange >= 0 ? 'up' : 'down'} />
                <KpiCard icon={weekChange >= 0 ? TrendingUp : TrendingDown} label="Variação Semanal" value={`${weekChange >= 0 ? '+' : ''}${weekChange.toFixed(1)}%`} sub="vs. semana anterior" color={weekChange >= 0 ? '#10b981' : '#ef4444'} trend={weekChange >= 0 ? 'up' : 'down'} />
                <KpiCard icon={Droplets} label="Necessidade de Água" value={water.label} sub={`NDWI: ${ndwi.toFixed(2)}`} color={water.color} trend="flat" />
                <KpiCard icon={TrendingUp} label="Previsão de Rendimento" value={`${yieldEst} t/ha`} sub="Estimativa GEE Biomassa" color="#6366f1" trend="up" />
            </div>

            {/* Map + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Leaflet Map */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E9EEE9] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h2 className="text-base font-bold text-[#111827] font-['Outfit']">Mapa de Saúde NDVI</h2>
                            {timelapse && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">▶ Time-lapse activo</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-[#6B7280]">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#16a34a' }} /> Saudável</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-400" /> Stress</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> Crítico</span>
                        </div>
                    </div>

                    <div style={{ height: 420 }}>
                        <MapContainer center={[-14.937, 13.552]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
                            <FitBounds />
                            <Polygon positions={FARM_POLYGON} pathOptions={{ color: '#ffffff', weight: 2, fillOpacity: 0, dashArray: '6 4' }} />
                            {NDVI_ZONES.map(zone => {
                                const col = ndviColor(zone.ndvi);
                                const lbl = ndviLabel(zone.ndvi);
                                return (
                                    <Polygon key={zone.id} positions={zone.coords}
                                        pathOptions={{ color: col, weight: activeZone === zone.id ? 3 : 1, fillColor: col, fillOpacity: activeZone === zone.id ? 0.75 : 0.55 }}
                                        eventHandlers={{ click: () => setActiveZone(activeZone === zone.id ? null : zone.id) }}>
                                        <Tooltip sticky>
                                            <div className="text-xs font-semibold">
                                                <strong>{zone.label}</strong><br />
                                                NDVI: {zone.ndvi.toFixed(2)} — <span style={{ color: lbl.color }}>{lbl.text}</span>
                                            </div>
                                        </Tooltip>
                                    </Polygon>
                                );
                            })}
                        </MapContainer>
                    </div>

                    <div className="flex divide-x divide-[#F3F4F6] border-t border-[#F3F4F6]">
                        {NDVI_ZONES.map(zone => {
                            const lbl = ndviLabel(zone.ndvi);
                            return (
                                <button key={zone.id} onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                                    className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors text-xs ${activeZone === zone.id ? 'bg-[#F0FDF4]' : 'hover:bg-[#F9FAFB]'}`}>
                                    <span className="font-bold text-[#111827]">{zone.ndvi.toFixed(2)}</span>
                                    <span className="font-medium" style={{ color: lbl.color }}>{zone.label}</span>
                                    <span className="text-[10px] text-[#9CA3AF]">{lbl.text}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Alerts */}
                <div className="flex flex-col bg-white rounded-2xl border border-[#E9EEE9] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-[#F59E0B]" />
                            <h2 className="text-base font-bold text-[#111827] font-['Outfit']">Alertas Inteligentes</h2>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {ALERTS.filter(a => a.level === 'critical' || a.level === 'warning').length} activos
                        </span>
                    </div>
                    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
                        {ALERTS.map(alert => {
                            const s = alertStyle(alert.level);
                            const Icon = alert.icon;
                            return (
                                <div key={alert.id} className={`rounded-xl border p-3.5 ${s.bg} ${s.border}`}>
                                    <div className="flex items-start gap-2.5">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Icon size={13} className={s.text} />
                                                <span className={`text-[11px] font-bold uppercase tracking-wide ${s.text}`}>{alert.sector}</span>
                                            </div>
                                            <p className="text-xs text-[#374151] leading-relaxed">{alert.message}</p>
                                            <p className="text-[10px] text-[#9CA3AF] mt-1.5">{alert.time}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-[#D1D5DB] shrink-0 mt-0.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-4 py-3 border-t border-[#F3F4F6]">
                        <button className="w-full text-xs font-semibold text-[#1A4D2E] hover:underline">Ver todos os alertas →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
