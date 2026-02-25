import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, Tractor, Activity, User, LogOut } from 'lucide-react';
import { removeToken } from '../utils/auth';

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/dashboard/planeamento', label: 'Planeamento', icon: CalendarDays },
    { to: '/dashboard/operacoes', label: 'Operações', icon: Tractor },
    { to: '/dashboard/monitoramento', label: 'Monitoramento', icon: Activity },
    { to: '/dashboard/perfil', label: 'Perfil', icon: User },
];

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

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

            {/* Nav items */}
            <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'text-[#123520]'
                                : 'text-white/60 hover:text-white hover:bg-white/8'
                            }`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? { backgroundColor: '#F7C04A' }
                                : {}
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
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
