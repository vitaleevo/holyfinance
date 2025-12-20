"use client";

import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { hasFeature } from '../../utils/plans';
import { Investment } from '../../types';
import { formatKwanza, maskValue } from '../../utils/currency';

export default function InvestmentsPage() {
    const { user } = useAuth();
    const { investments, accounts, settings, addInvestment, updateInvestment, deleteInvestment } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Added debitAccount to form
    const [formData, setFormData] = useState({ ticker: '', name: '', type: 'Ações', quantity: '', price: '', debitAccount: '' });

    const totalBalance = investments.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);

    const formatMoney = (val: number) => {
        return maskValue(formatKwanza(val), settings.privacyMode);
    };

    // Chart Data
    const typeMap = investments.reduce((acc, curr) => {
        const val = curr.quantity * curr.price;
        // @ts-ignore
        acc[curr.type] = (acc[curr.type] || 0) + val;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(typeMap).map((key, index) => ({
        name: key,
        value: typeMap[key],
        color: ['#13ec6d', '#0ea5e9', '#f59e0b', '#a855f7', '#ec4899'][index % 5]
    }));

    const handleOpen = (inv?: Investment) => {
        if (inv) {
            setEditingId(inv.id);
            setFormData({
                ticker: inv.ticker,
                name: inv.name,
                // @ts-ignore
                type: inv.type,
                quantity: inv.quantity.toString(),
                price: inv.price.toString(),
                debitAccount: '' // Not relevant when editing usually
            });
        } else {
            setEditingId(null);
            // Default to first account
            setFormData({
                ticker: '',
                name: '',
                type: 'Ações',
                quantity: '',
                price: '',
                debitAccount: accounts.length > 0 ? accounts[0].id : ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: any = {
            ticker: formData.ticker,
            name: formData.name,
            type: formData.type,
            quantity: parseFloat(formData.quantity),
            price: parseFloat(formData.price)
        };

        if (editingId) {
            updateInvestment(editingId, data);
        } else {
            addInvestment(data, formData.debitAccount);
        }
        setIsModalOpen(false);
    };

    const canAccess = hasFeature(user?.planType, 'investments');

    if (!canAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-surface-dark border border-surface-border rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                <div className="size-20 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span className="material-symbols-outlined text-4xl text-primary">lock</span>
                </div>

                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Recurso Premium</h2>
                <p className="text-text-secondary max-w-md mb-8 text-lg font-medium">
                    O módulo de Investimentos é exclusivo para membros dos planos <span className="text-white font-bold">Intermediário</span> e <span className="text-white font-bold">Avançado</span>.
                </p>

                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <div className="flex items-center gap-3 text-sm text-text-secondary bg-background-dark/50 p-3 rounded-lg border border-surface-border">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        <span>Acompanhamento de Ações e FIIs</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary bg-background-dark/50 p-3 rounded-lg border border-surface-border">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        <span>Gráficos de alocação de ativos</span>
                    </div>
                </div>

                <a
                    href="/subscription"
                    className="mt-8 bg-primary hover:bg-primary-dark text-background-dark font-black py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(19,236,109,0.2)] hover:shadow-[0_0_30px_rgba(19,236,109,0.4)] hover:scale-105"
                >
                    Fazer Upgrade Agora
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Carteira de Investimentos</h2>
                    <p className="text-text-secondary">Gerencie seus ativos e diversifique seu patrimônio.</p>
                </div>
                <button onClick={() => handleOpen()} className="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">add</span>
                    <span>Adicionar Investimento</span>
                </button>
            </div>

            <div className="bg-surface-dark border border-surface-border p-5 rounded-xl flex flex-col gap-3 max-w-sm">
                <span className="text-text-secondary text-sm font-medium">Patrimônio Investido</span>
                <span className="text-3xl font-bold text-white tracking-tight">{formatMoney(totalBalance)}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-surface-dark border border-surface-border rounded-xl p-6 lg:col-span-1">
                    <h3 className="text-lg font-bold text-white mb-6">Alocação</h3>
                    <div className="h-64 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center text-text-secondary pt-20">Sem dados</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {chartData.map(d => (
                            <div key={d.name} className="flex items-center gap-1 text-xs text-text-secondary">
                                <div className="size-3 rounded-full" style={{ background: d.color }}></div> {d.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface-dark border border-surface-border rounded-xl overflow-hidden shadow-sm lg:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background-dark border-b border-surface-border">
                                    <th className="py-4 px-6 text-xs text-text-secondary uppercase">Ativo</th>
                                    <th className="py-4 px-6 text-xs text-text-secondary uppercase text-right">Qtd.</th>
                                    <th className="py-4 px-6 text-xs text-text-secondary uppercase text-right">Preço</th>
                                    <th className="py-4 px-6 text-xs text-text-secondary uppercase text-right">Total</th>
                                    <th className="py-4 px-6 text-xs text-text-secondary uppercase text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {investments.map((row) => (
                                    <tr key={row.id} className="hover:bg-surface-border/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-bold">{row.ticker}</span>
                                                <span className="text-xs text-text-secondary">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-white text-right font-medium">{row.quantity}</td>
                                        <td className="py-4 px-6 text-sm text-white text-right font-bold">{formatMoney(row.price)}</td>
                                        <td className="py-4 px-6 text-sm text-white text-right font-bold">{formatMoney(row.quantity * row.price)}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleOpen(row)} className="text-text-secondary hover:text-white"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                <button onClick={() => deleteInvestment(row.id)} className="text-text-secondary hover:text-danger"><span className="material-symbols-outlined text-sm">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Ativo' : 'Novo Ativo'}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input type="text" placeholder="Código (Ex: AAPL)" value={formData.ticker} onChange={e => setFormData({ ...formData, ticker: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <input type="text" placeholder="Nome (Ex: Apple Inc.)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none">
                                <option>Ações</option>
                                <option>FIIs</option>
                                <option>Renda Fixa</option>
                                <option>Cripto</option>
                                <option>Outros</option>
                            </select>
                            <input type="number" placeholder="Quantidade" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <input type="number" placeholder="Preço Unitário (KZ)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />

                            {!editingId && (
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Debitar da Conta</label>
                                    <select
                                        value={formData.debitAccount}
                                        onChange={e => setFormData({ ...formData, debitAccount: e.target.value })}
                                        className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none"
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({formatKwanza(acc.balance)})</option>
                                        ))}
                                        <option value="">Não debitar (apenas registro)</option>
                                    </select>
                                </div>
                            )}

                            <button type="submit" className="bg-primary text-background-dark font-bold py-2 rounded-lg mt-2">Salvar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

