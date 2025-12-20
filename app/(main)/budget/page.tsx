"use client";

import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { BudgetLimit } from '../../types';
import { formatKwanza, maskValue } from '../../utils/currency';

export default function BudgetPage() {
    const { transactions, budgetLimits, settings, addBudgetLimit, updateBudgetLimit, deleteBudgetLimit } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ category: '', limit: '' });

    // Calculate spent per category
    const categorySpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            // @ts-ignore
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    const budgetData = budgetLimits.map(b => ({
        ...b,
        spent: categorySpending[b.category] || 0,
    }));

    const totalLimit = budgetData.reduce((a, b) => a + b.limit, 0);
    const totalSpent = budgetData.reduce((a, b) => a + b.spent, 0);
    const remaining = totalLimit - totalSpent;
    const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    const formatMoney = (val: number) => {
        return maskValue(formatKwanza(val), settings.privacyMode);
    };

    const handleOpen = (item?: BudgetLimit) => {
        if (item) {
            setEditingId(item.id);
            setFormData({ category: item.category, limit: item.limit.toString() });
        } else {
            setEditingId(null);
            setFormData({ category: '', limit: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { category: formData.category, limit: parseFloat(formData.limit) };
        if (editingId) updateBudgetLimit(editingId, data);
        else addBudgetLimit(data);
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <h1 className="text-3xl font-black text-white">Orçamento Mensal</h1>
            </div>

            <div className="rounded-2xl bg-surface-dark border border-surface-border p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-primary to-danger"></div>
                <p className="text-text-secondary font-bold uppercase tracking-widest text-sm mb-2">Disponível para Gastar (Baseado em Limites)</p>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">{formatMoney(remaining)}</h2>
                <p className="text-sm text-text-secondary">
                    {totalPct}% do orçamento total ({formatMoney(totalLimit)}) utilizado.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetData.map((item) => {
                    const pct = item.limit > 0 ? Math.min((item.spent / item.limit) * 100, 100) : 0;
                    const colorClass = pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-orange-400' : 'bg-primary';
                    const textClass = pct > 90 ? 'text-danger' : pct > 70 ? 'text-orange-400' : 'text-primary';

                    return (
                        <div key={item.id} className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-dark border border-surface-border relative group">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleOpen(item)} className="text-xs bg-surface-border p-1 rounded text-white"><span className="material-symbols-outlined text-sm">edit</span></button>
                                <button onClick={() => deleteBudgetLimit(item.id)} className="text-xs bg-surface-border p-1 rounded text-danger"><span className="material-symbols-outlined text-sm">delete</span></button>
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white text-lg">{item.category}</h3>
                                <span className="text-xs font-bold bg-surface-border px-2 py-1 rounded text-text-secondary">{pct.toFixed(0)}%</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Gasto: <span className="text-white font-bold">{formatMoney(item.spent)}</span></span>
                                    <span className="text-text-secondary">Limite: {formatMoney(item.limit)}</span>
                                </div>
                                <div className="w-full h-2.5 bg-background-dark rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                <span className={`text-xs ${textClass} font-bold text-right`}>Restam {formatMoney(item.limit - item.spent)}</span>
                            </div>
                        </div>
                    )
                })}

                <button onClick={() => handleOpen()} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-dashed border-surface-border text-text-secondary hover:text-primary hover:border-primary hover:bg-surface-dark transition-all min-h-[160px]">
                    <span className="material-symbols-outlined text-4xl">add_circle</span>
                    <span className="font-bold">Definir Novo Limite</span>
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Limite' : 'Novo Limite'}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input type="text" placeholder="Categoria (ex: Lazer)" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <input type="number" placeholder="Limite Mensal (KZ)" value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <button type="submit" className="bg-primary text-background-dark font-bold py-2 rounded-lg">Salvar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

