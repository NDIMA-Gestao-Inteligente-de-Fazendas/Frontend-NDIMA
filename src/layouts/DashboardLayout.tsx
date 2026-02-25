import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

/** Shell layout for all authenticated pages — sidebar left, content right */
export default function DashboardLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F1F5F1] font-['Inter']">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}
