"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Page } from '../types';

import { useAuth } from '../context/AuthContext';

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
};

const navItems = [
    { icon: 'dashboard', label: 'Visão Geral', page: Page.DASHBOARD },
    { icon: 'account_balance_wallet', label: 'Contas', page: Page.ACCOUNTS },
    { icon: 'receipt_long', label: 'Transações', page: Page.TRANSACTIONS },
    { icon: 'pie_chart', label: 'Orçamento', page: Page.BUDGET },
    { icon: 'track_changes', label: 'Metas', page: Page.GOALS },
    { icon: 'trending_up', label: 'Investimentos', page: Page.INVESTMENTS },
    { icon: 'credit_card', label: 'Dívidas', page: Page.DEBTS },
    { icon: 'bar_chart', label: 'Relatórios', page: Page.REPORTS },
    { icon: 'diversity_3', label: 'Família', page: Page.FAMILY },
];

export const MobileNav = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (page: Page) => {
        const route = routeMap[page];
        if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true;
        return pathname.startsWith(route);
    };

    // Bottom Bar Items (Limited to key items)
    const bottomItems = [
        { icon: 'dashboard', label: 'Início', page: Page.DASHBOARD },
        { icon: 'account_balance_wallet', label: 'Contas', page: Page.ACCOUNTS },
        { icon: 'add_circle', label: 'Novo', page: null, isAction: true }, // Action Button
        { icon: 'credit_card', label: 'Dívidas', page: Page.DEBTS },
        { icon: 'menu', label: 'Menu', page: null, isMenu: true },
    ];

    return (
        <>
            {/* Mobile Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-surface-border bg-background-dark/95 backdrop-blur-sm shrink-0 md:hidden sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <img
                        src="/logo-icon.png"
                        alt="HolyFinanças"
                        className="size-8 object-contain drop-shadow-[0_0_8px_rgba(19,236,109,0.4)]"
                    />
                    <span className="font-bold text-white tracking-tight">HolyFinanças</span>
                </div>
                <Link href="/notifications" className="text-white relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-0 right-0 size-2 bg-danger rounded-full border border-background-dark"></span>
                </Link>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark border-t border-surface-border h-16 md:hidden z-50 px-2 flex justify-between items-center safe-area-bottom">
                {bottomItems.map((item, index) => {
                    if (item.isAction) {
                        return (
                            <Link href="/transactions" key={index} className="flex flex-col items-center justify-center -mt-6">
                                <div className="size-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 text-background-dark border-4 border-background-dark">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </div>
                                <span className="text-[10px] font-bold text-text-secondary mt-1">{item.label}</span>
                            </Link>
                        );
                    }

                    if (item.isMenu) {
                        return (
                            <button key={index} onClick={() => setIsOpen(true)} className={`flex flex-col items-center justify-center w-full h-full gap-1 text-text-secondary`}>
                                <span className={`material-symbols-outlined ${isOpen ? 'text-white' : ''}`}>{item.icon}</span>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    }

                    // @ts-ignore
                    const active = isActive(item.page);
                    return (
                        <Link
                            key={index}
                            // @ts-ignore
                            href={routeMap[item.page]}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-primary' : 'text-text-secondary'}`}
                        >
                            <span className={`material-symbols-outlined ${active ? 'icon-filled' : ''}`}>{item.icon}</span>
                            <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Menu Drawer (Hamburger implementation re-used) */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 md:hidden" onClick={() => setIsOpen(false)}>
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-background-dark border-l border-surface-border p-4 flex flex-col h-full animate-in slide-in-from-right duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-2">
                                <img src="/logo-icon.png" alt="Logo" className="size-6 object-contain" />
                                <h2 className="text-lg font-bold text-white">Menu</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2 overflow-y-auto flex-1">
                            {navItems.filter(item => {
                                if (user?.role === 'member' && item.page === Page.INVESTMENTS) return false;
                                return true;
                            }).map((item) => {
                                const active = isActive(item.page);
                                return (
                                    <Link
                                        key={item.page}
                                        href={routeMap[item.page]}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-surface-dark border border-surface-border text-white' : 'text-text-secondary hover:text-white'}`}
                                    >
                                        <span className={`material-symbols-outlined ${active ? 'text-primary' : ''}`}>{item.icon}</span>
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-surface-border">
                            <Link href="/login" className="flex items-center gap-3 p-3 text-text-secondary hover:text-danger">
                                <span className="material-symbols-outlined">logout</span>
                                <span>Sair</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
