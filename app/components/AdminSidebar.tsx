"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();

    const menuItems = [
        { icon: 'dashboard', label: 'Painel Geral', href: '/admin/dashboard' },
        { icon: 'group', label: 'Usuários e Assinaturas', href: '/admin/users' },
        { icon: 'inventory_2', label: 'Planos e Preços', href: '/admin/plans' },
        { icon: 'payments', label: 'Faturamento', href: '/admin/billing' },
        { icon: 'settings', label: 'Configurações do Sistema', href: '/admin/settings' },
    ];

    return (
        <aside className="w-72 h-full flex-shrink-0 bg-[#0a0e14] border-r border-white/5 flex flex-col p-6 overflow-hidden">
            {/* Admin Brand */}
            <div className="flex items-center gap-3 py-6 mb-8 px-2 border-b border-white/5">
                <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <span className="material-symbols-outlined text-2xl font-black">shield_person</span>
                </div>
                <div>
                    <h2 className="text-white font-black text-lg tracking-tighter leading-tight">Admin Console</h2>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">HolyFinance HQ</p>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                {menuItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${active
                                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-white shadow-xl'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[24px] ${active ? 'text-indigo-400' : 'group-hover:scale-110 transition-transform'}`}>
                                {item.icon}
                            </span>
                            <span className={`text-sm font-bold tracking-tight ${active ? 'font-black' : ''}`}>
                                {item.label}
                            </span>
                            {active && (
                                <div className="ml-auto size-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl mb-4">
                    <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-black">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-tight">Super Admin</p>
                    </div>
                </div>

                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                >
                    <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
                    Voltar para o App
                </Link>

                <button
                    onClick={async () => { await logout(); router.push('/login'); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-danger/70 hover:text-danger transition-colors text-sm font-bold mt-1"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sair da Console
                </button>
            </div>
        </aside>
    );
};
