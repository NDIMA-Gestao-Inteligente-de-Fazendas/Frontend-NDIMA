import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, CalendarDays, Tractor, Activity, User, LogOut,
    Satellite, BarChart2, ChevronDown
} from 'lucide-react';
import { removeToken } from '../utils/auth';

/* ─── Navigation config ─────────────────────────────────────────────────── */

interface SubItem { to: string; label: string; icon: React.ElementType; }

interface NavItem {
    to?: string;
    label: string;
    icon: React.ElementType;
    children?: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/dashboard/planeamento', label: 'Planeamento', icon: CalendarDays },
    { to: '/dashboard/operacoes', label: 'Operações', icon: Tractor },
    {
        label: 'Monitoramento', icon: Activity,
        children: [
            { to: '/dashboard/monitoramento/satelite', label: 'Satélite', icon: Satellite },
            { to: '/dashboard/monitoramento/producao', label: 'Produção', icon: BarChart2 },
        ],
    },
    { to: '/dashboard/perfil', label: 'Perfil', icon: User },
];

/* ─── Active link helpers ───────────────────────────────────────────────── */

const ACTIVE_STYLE = { backgroundColor: '#F7C04A', color: '#123520' };
const activeClass = 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200';

/* ─── Sidebar ───────────────────────────────────────────────────────────── */

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Pre-open submenu if we are on a monitoring sub-route
    const inMonitoring = location.pathname.startsWith('/dashboard/monitoramento');
    const [openGroup, setOpenGroup] = useState<string | null>(inMonitoring ? 'Monitoramento' : null);

    const handleLogout = () => { removeToken(); navigate('/login'); };

    const toggleGroup = (label: string) =>
        setOpenGroup(prev => (prev === label ? null : label));

    return (
        <aside
            className="flex flex-col h-screen w-56 flex-shrink-0 font-['Inter']"
            style={{ background: 'linear-gradient(180deg, #1A4D2E 0%, #0d2a18 100%)' }}
        >
            {/* Logo */}
            <div className="px-5 pt-7 pb-6 border-b border-white/10">
                <img
                    src="/img/logotipofinal-04.png"
                    alt="NDIMA"
                    className="h-16 w-auto object-contain"
                    style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(247,192,74,0.4))' }}
                />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    /* ── Group with children (Monitoramento) ── */
                    if (item.children) {
                        const isGroupActive = item.children.some(c => location.pathname.startsWith(c.to));
                        const isOpen = openGroup === item.label;

                        return (
                            <div key={item.label}>
                                {/* Group header button */}
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                                        ${isGroupActive ? 'text-[#F7C04A]' : 'text-white/60 hover:text-white hover:bg-white/8'}`}
                                >
                                    <item.icon size={18} />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Sub-items */}
                                {isOpen && (
                                    <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                                        {item.children.map(sub => (
                                            <NavLink
                                                key={sub.to}
                                                to={sub.to}
                                                className={({ isActive }) =>
                                                    `${activeClass} ${isActive ? 'text-[#123520]' : 'text-white/55 hover:text-white hover:bg-white/8'}`
                                                }
                                                style={({ isActive }) => isActive ? ACTIVE_STYLE : {}}
                                            >
                                                <sub.icon size={16} />
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    /* ── Simple flat link ── */
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to!}
                            end={item.to === '/dashboard'}
                            className={({ isActive }) =>
                                `${activeClass} ${isActive ? 'text-[#123520]' : 'text-white/60 hover:text-white hover:bg-white/8'}`
                            }
                            style={({ isActive }) => isActive ? ACTIVE_STYLE : {}}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Sair */}
            <div className="px-3 pb-6 border-t border-white/10 pt-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/8"
                    style={{ color: '#FF6B6B' }}
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
