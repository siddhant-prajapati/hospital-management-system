import { Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 lg:px-6">
            <button
                onClick={onMenuClick}
                className="p-2 text-slate-600 rounded-md lg:hidden hover:bg-slate-100"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-lg font-semibold text-slate-800">
                Hospital Management System
            </h1>

            <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-500 sm:inline">Admin</span>
                <div className="flex items-center justify-center w-9 h-9 font-semibold text-white rounded-full bg-sky-600">
                A
                </div>
            </div>
        </header>
    );
}