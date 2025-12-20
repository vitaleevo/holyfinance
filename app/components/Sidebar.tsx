/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Page, NavItem } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { hasFeature } from '../utils/plans';

const navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Visão Geral', page: Page.DASHBOARD },
    { icon: 'account_balance_wallet', label: 'Contas', page: Page.ACCOUNTS },
    { icon: 'receipt_long', label: 'Transações', page: Page.TRANSACTIONS },
    { icon: 'pie_chart', label: 'Orçamento', page: Page.BUDGET },
    { icon: 'track_changes', label: 'Metas', page: Page.GOALS },
    { icon: 'trending_up', label: 'Investimentos', page: Page.INVESTMENTS },
    { icon: 'credit_card', label: 'Dívidas', page: Page.DEBTS },
    { icon: 'bar_chart', label: 'Relatórios', page: Page.REPORTS },
    { icon: 'notifications', label: 'Notificações', page: Page.NOTIFICATIONS },
    { icon: 'diversity_3', label: 'Família', page: Page.FAMILY },
    { icon: 'workspace_premium', label: 'Assinatura', page: Page.SUBSCRIPTION },
    { icon: 'settings', label: 'Configurações', page: Page.SETTINGS },
];

const routeMap: Record<Page, string> = {
    [Page.DASHBOARD]: '/dashboard',
    [Page.ACCOUNTS]: '/accounts',
    [Page.TRANSACTIONS]: '/transactions',
    [Page.BUDGET]: '/budget',
    [Page.GOALS]: '/goals',
    [Page.INVESTMENTS]: '/investments',
    [Page.DEBTS]: '/debts',
    [Page.REPORTS]: '/reports',
    [Page.NOTIFICATIONS]: '/notifications',
    [Page.FAMILY]: '/family',
    [Page.SETTINGS]: '/settings',
    [Page.SUBSCRIPTION]: '/subscription',
};

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { openModal } = useTransactions();
    const { user, logout, isAuthenticated } = useAuth();

    const isActive = (page: Page) => {
        const route = routeMap[page];
        if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true;
        return pathname.startsWith(route);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="w-64 h-full flex-shrink-0 bg-background-dark border-r border-surface-border flex flex-col p-4 md:flex hidden overflow-hidden">
            {/* Logo Area - Fixed */}
            <div className="flex items-center justify-center py-4 shrink-0">
                <img
                    src="/logo-full-dark-bg.png"
                    alt="HolyFinance"
                    className="h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(19,236,109,0.35)]"
                />
            </div>

            {/* Navigation Area - Scrollable */}
            <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 custom-scrollbar">
                {navItems.map((item) => {
                    const active = isActive(item.page);

                    // Feature Check
                    let isLocked = false;
                    if (item.page === Page.INVESTMENTS && !hasFeature(user?.planType, 'investments')) {
                        isLocked = true;
                    }

                    return (
                        <Link
                            key={item.page}
                            href={routeMap[item.page]}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 w-full text-left group relative ${active
                                ? 'bg-surface-dark border border-surface-border text-white shadow-lg shadow-black/20'
                                : 'text-text-secondary hover:bg-surface-dark/50 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110 ${active ? 'text-primary' : ''}`}>
                                {item.icon}
                            </span>
                            <p className={`text-sm font-medium leading-normal transition-all duration-300 ${active ? 'font-black' : 'group-hover:font-semibold'}`}>
                                {item.label}
                            </p>
                            {isLocked && (
                                <span className="absolute right-3 material-symbols-outlined text-[16px] text-text-secondary opacity-70">
                                    lock
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Actions Area - Fixed at Bottom */}
            <div className="pt-4 flex flex-col gap-4 border-t border-surface-border mt-auto shrink-0 pb-2">
                <button
                    onClick={() => openModal()}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-4 bg-primary hover:bg-primary-dark transition-all text-background-dark text-sm font-black leading-normal tracking-wide shadow-lg shadow-primary/20 shrink-0 hover-premium group"
                >
                    <span className="material-symbols-outlined text-lg transition-transform duration-500 group-hover:rotate-180">add</span>
                    <span className="truncate">Nova Transação</span>
                </button>

                {isAuthenticated && user && (
                    <div className="flex items-center gap-3 px-1 py-1">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="size-9 rounded-full object-cover border border-surface-border"
                            />
                        ) : (
                            <div className="bg-primary/20 text-primary rounded-full size-9 flex items-center justify-center font-bold text-xs shrink-0">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                {user.subscriptionStatus === 'trialing' && (
                                    <span className="bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Trial</span>
                                )}
                                {user.subscriptionStatus === 'pending_verification' && (
                                    <span className="bg-warning/20 text-warning text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Pendente</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary bg-surface-border px-1.5 rounded">
                                    {user.role || 'User'}
                                </span>
                                <span className="text-[10px] font-bold text-primary/70 uppercase">
                                    • {user.planType || 'Basic'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                            title="Sair"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};
