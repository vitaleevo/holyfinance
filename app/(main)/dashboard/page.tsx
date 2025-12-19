"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
    const { transactions, accounts, investments, debts, settings } = useTransactions();
    const { user } = useAuth();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'month' | 'all'>('month');

    // Filter transactions based on viewMode
    const filteredTransactions = transactions.filter(t => {
        if (viewMode === 'all') return true;
        const tDate = new Date(t.date);
        const now = new Date();
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });

    // 1. Calculate Cash Flow (Income vs Expenses) based on filter
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Calculate Real Assets (Wealth) - Always current snapshot
    const totalAccountsBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const totalInvested = investments.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    const totalDebtRemaining = debts.reduce((acc, curr) => acc + (curr.totalValue - curr.paidValue), 0);

    // Net Worth = (Cash + Investments) - Debts
    const netWorth = (totalAccountsBalance + totalInvested) - totalDebtRemaining;

    // Helper for Privacy Mode
    const formatMoney = (val: number) => {
        if (settings.privacyMode) return '••••••';
        return 'KZ ' + val.toLocaleString();
    };

    // 3. Calculate Expenses by Category for Chart (using filtered)
    const categories = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            // @ts-ignore
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    const categoryList = Object.entries(categories)
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .slice(0, 5) // Top 5
        .map(([label, amount]: [string, number]) => ({
            label,
            amount,
            pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
            color: 'bg-primary'
        }));

    // 4. Generate Dynamic Chart Data (Group transactions by month)
    // If 'month' view, maybe show daily? For now, keeping logic simple, if 'all' show months, if 'month' show days?
    // Let's keep it simple: chart always shows 'all history' trend or just adapt.
    // Actually, for 'viewMode === month', an AreaChart of just one point (the month) is boring.
    // Let's stick to the previous chart logic (All time trend) BUT maybe highlight valid range?
    // OR: let's leave the Chart as "Historical Overview" regardless of filter, 
    // BUT common expectation is dashboard filters affect charts.
    // Let's make the chart show daily progress if 'month', monthly progress if 'all'.

    let chartData = [];
    if (viewMode === 'month') {
        const dailyMap = filteredTransactions.reduce((acc, t) => {
            const day = new Date(t.date).getDate();
            // @ts-ignore
            if (!acc[day]) acc[day] = 0;
            // @ts-ignore
            acc[day] += (t.type === 'income' ? t.amount : -t.amount);
            return acc;
        }, {} as Record<number, number>);

        // Fill days 1..31
        chartData = Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            // @ts-ignore
            return { name: `${day}`, value: dailyMap[day] || 0 };
        });
    } else {
        const monthlyMap = transactions.reduce((acc, t) => {
            const date = new Date(t.date);
            const key = date.toLocaleString('default', { month: 'short' });
            // @ts-ignore
            if (!acc[key]) acc[key] = 0;
            // @ts-ignore
            acc[key] += (t.type === 'income' ? t.amount : -t.amount);
            return acc;
        }, {} as Record<string, number>);

        chartData = Object.entries(monthlyMap).map(([name, value]) => ({ name, value }));
    }

    if (chartData.length === 0) chartData = [{ name: 'Atual', value: 0 }];

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Dashboard Principal</h1>
                    <p className="text-text-secondary text-base">Visão unificada do seu patrimônio e fluxo de caixa.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 ml-auto">
                    {/* User Profile Info */}
                    <div className="flex items-center gap-3 py-1.5 px-3 rounded-2xl bg-surface-dark border border-surface-border shadow-sm group hover:border-primary/30 transition-all cursor-pointer" onClick={() => router.push('/settings')}>
                        <div className="flex flex-col text-right hidden sm:flex">
                            <span className="text-white font-bold text-sm leading-tight">{user?.name}</span>
                            <span className="text-primary text-[11px] font-bold uppercase tracking-wider">
                                {user?.familyRelationship || 'Membro'}
                            </span>
                        </div>
                        <div className="size-10 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary">person</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-l border-surface-border pl-4 md:pl-6">
                        <button
                            onClick={() => setViewMode(prev => prev === 'month' ? 'all' : 'month')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border bg-surface-dark text-text-secondary text-sm font-semibold hover:text-white transition-all hover:bg-surface-hover hover:border-primary/50"
                        >
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                            <span className="hidden xs:inline">{viewMode === 'month' ? 'Este Mês' : 'Todos'}</span>
                        </button>
                        <button
                            onClick={() => router.push('/notifications')}
                            className="p-2.5 rounded-xl border border-surface-border bg-surface-dark text-text-secondary hover:text-primary transition-all hover:bg-surface-hover hover:border-primary/50 relative"
                        >
                            <span className="material-symbols-outlined text-[20px] icon-filled">notifications</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Net Worth Card - Not affected by filter usually, but consistency? Let's leave absolute */}
                <div className="flex flex-col gap-4 rounded-2xl p-6 bg-surface-dark border border-surface-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[64px] text-primary">account_balance</span>
                    </div>
                    <div className="flex flex-col gap-1 z-10">
                        <p className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Patrimônio Líquido</p>
                        <h2 className={`text-white text-3xl font-bold tracking-tight ${settings.privacyMode ? 'tracking-widest' : ''}`}>{formatMoney(netWorth)}</h2>
                    </div>
                    <div className="flex items-center gap-2 z-10 mt-auto">
                        <span className="text-xs text-text-secondary">Contas + Invest. - Dívidas</span>
                    </div>
                </div>

                {/* Income Card */}
                <div className="flex flex-col gap-4 rounded-2xl p-6 bg-surface-dark border border-surface-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10 text-success">
                            <span className="material-symbols-outlined">arrow_downward</span>
                        </div>
                        <p className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Receitas ({viewMode === 'month' ? 'Mês' : 'Total'})</p>
                    </div>
                    <div>
                        <h2 className={`text-white text-2xl font-bold tracking-tight ${settings.privacyMode ? 'tracking-widest' : ''}`}>{formatMoney(totalIncome)}</h2>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="flex flex-col gap-4 rounded-2xl p-6 bg-surface-dark border border-surface-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-danger/10 text-danger">
                            <span className="material-symbols-outlined">arrow_upward</span>
                        </div>
                        <p className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Despesas ({viewMode === 'month' ? 'Mês' : 'Total'})</p>
                    </div>
                    <div>
                        <h2 className={`text-white text-2xl font-bold tracking-tight ${settings.privacyMode ? 'tracking-widest' : ''}`}>{formatMoney(totalExpense)}</h2>
                    </div>
                </div>

                {/* Investments Card */}
                <div className="flex flex-col gap-4 rounded-2xl p-6 bg-surface-dark border border-surface-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <p className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Investido</p>
                    </div>
                    <div>
                        <h2 className={`text-white text-2xl font-bold tracking-tight ${settings.privacyMode ? 'tracking-widest' : ''}`}>{formatMoney(totalInvested)}</h2>
                        <p className="text-text-secondary text-sm font-medium mt-1">Total acumulado</p>
                    </div>
                </div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl bg-surface-dark border border-surface-border p-6 shadow-sm flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Movimentação Financeira</h3>
                    </div>
                    <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#13ec6d" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#13ec6d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#28392f" vertical={false} />
                                <XAxis dataKey="name" stroke="#9db9a8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9db9a8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a2620', borderColor: '#28392f', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#13ec6d" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 rounded-2xl bg-surface-dark border border-surface-border p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Top Despesas</h3>
                    </div>
                    <div className="flex flex-col gap-6 flex-1 justify-center">
                        {categoryList.length > 0 ? categoryList.map((item) => (
                            <div key={item.label} className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-white">{item.label}</span>
                                    <span className="text-text-secondary">{formatMoney(item.amount)} ({item.pct}%)</span>
                                </div>
                                <div className="w-full bg-background-dark rounded-full h-2">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">bar_chart</span>
                                <p className="text-sm">Sem despesas registradas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Summary Chips */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-surface-dark border border-surface-border p-5 flex items-center gap-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3 h-12 w-12 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-secondary">Saldo em Contas</p>
                        <p className="text-2xl font-bold text-white">{formatMoney(totalAccountsBalance)}</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-surface-dark border border-surface-border p-5 flex items-center gap-4 shadow-sm">
                    <div className="rounded-full bg-orange-500/10 p-3 h-12 w-12 flex items-center justify-center text-orange-500">
                        <span className="material-symbols-outlined">money_off</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-text-secondary">Dívida Restante</p>
                        <p className="text-2xl font-bold text-white">{formatMoney(totalDebtRemaining)}</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-surface-dark border border-surface-border p-5 flex items-center gap-4 shadow-sm">
                    <div className="rounded-full bg-success/10 p-3 h-12 w-12 flex items-center justify-center text-success">
                        <span className="material-symbols-outlined">savings</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-secondary">Liquidez (Contas - Dívidas)</p>
                        <p className="text-2xl font-bold text-white">{formatMoney(totalAccountsBalance - totalDebtRemaining)}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

