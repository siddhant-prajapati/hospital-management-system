import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BedDouble, Pill, Receipt, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Wards & Beds', path: '/wards', icon: BedDouble },
  { name: 'Pharmacy', path: '/pharmacy', icon: Pill },
  { name: 'Billing', path: '/billing', icon: Receipt },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <>
            {isOpen && (
                <div
                className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                onClick={onClose}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
                    <span className="text-xl font-bold tracking-tight text-sky-400">
                        MedCore HMS
                    </span>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map(({ name, path, icon: Icon }) => (
                    <NavLink
                    key={path}
                    to={path}
                    end={path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                    }
                    >
                    <Icon className="w-5 h-5" />
                    {name}
                    </NavLink>
                ))}
                </nav>
            </aside>

        </>
    );
}