"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { hasFeature } from '../../utils/plans';
import { useToast } from '../../context/ToastContext';

export default function ReportsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { transactions } = useTransactions();

    // Aggregate transactions by month
    const groupedData = transactions.reduce((acc, t) => {
        const date = new Date(t.date);
        // Format: "Jan 2023"
        const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });

        // @ts-ignore
        if (!acc[key]) {
            // @ts-ignore
            acc[key] = { name: key, receita: 0, despesa: 0, order: date.getTime() };
        }

        if (t.type === 'income') {
            // @ts-ignore
            acc[key].receita += t.amount;
        } else {
            // @ts-ignore
            acc[key].despesa += t.amount;
        }
        return acc;
    }, {} as Record<string, { name: string; receita: number; despesa: number; order: number }>);

    // Convert to array and sort by date
    const data = (Object.values(groupedData) as { name: string; receita: number; despesa: number; order: number }[]).sort((a, b) => a.order - b.order);

    // If empty, show a dummy placeholder to avoid ugly empty chart
    const chartData = data.length > 0 ? data : [
        { name: 'Sem Dados', receita: 0, despesa: 0, order: 0 }
    ];

    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Relatórios Detalhados</h1>
                    <p className="text-text-secondary">Análise profunda do seu comportamento financeiro.</p>
                </div>
                <button
                    onClick={() => {
                        if (hasFeature(user?.planType, 'advancedReports')) {
                            showToast("Gerando PDF... (Simulação)", "success");
                        } else {
                            showToast("Exportação PDF disponível apenas nos planos Intermediário e Avançado.", "error");
                        }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all ${hasFeature(user?.planType, 'advancedReports')
                            ? 'bg-surface-dark border-surface-border text-white hover:bg-surface-border'
                            : 'bg-surface-dark/50 border-surface-border/50 text-text-secondary cursor-not-allowed opacity-70'
                        }`}
                >
                    <span className="material-symbols-outlined">download</span>
                    PDF
                    {!hasFeature(user?.planType, 'advancedReports') && <span className="material-symbols-outlined text-[16px]">lock</span>}
                </button>
            </header>

            <div className="flex flex-col h-[500px] w-full bg-surface-dark border border-surface-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-white mb-6">Fluxo de Caixa Mensal</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#28392f" vertical={false} />
                        <XAxis dataKey="name" stroke="#9db9a8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9db9a8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip
                            cursor={{ fill: '#28392f', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#1a2620', borderColor: '#28392f', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="receita" name="Receitas" fill="#13ec6d" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="despesa" name="Despesas" fill="#fa5538" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Insights</h3>
                    <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-background-dark border border-surface-border flex gap-3">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            <div>
                                <p className="text-white font-bold text-sm">Histórico Disponível</p>
                                <p className="text-xs text-text-secondary mt-1">
                                    Você possui {transactions.length} transações registradas ao longo de {chartData.length} meses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <div className="size-24 rounded-full border-4 border-surface-border border-t-primary flex items-center justify-center mb-4">
                        <span className="text-2xl font-black text-white">A</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Saúde dos Dados</h3>
                    <p className="text-sm text-text-secondary mt-2">Continue registrando suas despesas diariamente para obter insights mais precisos.</p>
                </div>
            </div>
        </div>
    );
};

