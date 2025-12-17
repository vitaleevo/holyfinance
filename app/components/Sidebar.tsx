"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Page, NavItem } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';

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
    [Page.SETTINGS]: '/settings',
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
        <aside className="w-64 h-full flex-shrink-0 bg-background-dark border-r border-surface-border flex flex-col justify-between p-4 hidden md:flex">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-center px-2 py-6">
                    <img
                        src="/logo-full-dark-bg.png"
                        alt="HolyFinanças"
                        className="h-20 w-auto object-contain drop-shadow-[0_0_12px_rgba(19,236,109,0.35)]"
                    />
                </div>

                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const active = isActive(item.page);
                        return (
                            <Link
                                key={item.page}
                                href={routeMap[item.page]}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all w-full text-left ${active
                                    ? 'bg-surface-dark border border-surface-border text-white shadow-sm'
                                    : 'text-text-secondary hover:bg-surface-dark/50 hover:text-white'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${active ? 'text-primary' : ''}`}>
                                    {item.icon}
                                </span>
                                <p className={`text-sm font-medium leading-normal ${active ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </p>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={() => openModal()}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-4 bg-primary hover:bg-primary-dark transition-colors text-background-dark text-sm font-bold leading-normal tracking-wide shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span className="truncate">Nova Transação</span>
                </button>

                {isAuthenticated && user && (
                    <div className="flex items-center gap-3 px-2 py-2 border-t border-surface-border pt-4">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="size-10 rounded-full object-cover border border-surface-border"
                            />
                        ) : (
                            <div className="bg-primary/20 text-primary rounded-full size-10 flex items-center justify-center font-bold text-sm">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden flex-1">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Sair"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};
