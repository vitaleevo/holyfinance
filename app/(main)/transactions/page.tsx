"use client";

import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';

export default function TransactionsPage() {
    const { transactions, deleteTransaction, openModal } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Formatting Helper
    const formatMoney = (amount: number, type: string) => {
        return `${type === 'expense' ? '- ' : '+ '}KZ ${amount.toLocaleString()}`;
    };

    const getIcon = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'alimentação': return 'shopping_cart';
            case 'transporte': return 'directions_car';
            case 'lazer': return 'movie';
            case 'moradia': return 'home';
            case 'saúde': return 'medication';
            case 'salário': return 'payments';
            default: return 'receipt_long';
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-white tracking-tight">Transações</h1>
                    <p className="text-text-secondary">Histórico completo de suas movimentações financeiras.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar transação..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface-dark border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-primary w-64 transition-all"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-4 py-2.5 rounded-lg border border-surface-border bg-surface-dark text-white text-sm font-bold hover:bg-surface-border transition-colors outline-none cursor-pointer"
                    >
                        <option value="all">Todas</option>
                        <option value="income">Receitas</option>
                        <option value="expense">Despesas</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 bg-surface-dark border border-surface-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                {filteredTransactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-text-secondary">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">receipt_long</span>
                        <p>Nenhuma transação encontrada.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background-dark border-b border-surface-border">
                                    <th className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider">Data</th>
                                    <th className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider">Descrição</th>
                                    <th className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider">Categoria</th>
                                    <th className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider">Conta</th>
                                    <th className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Valor</th>
                                    <th className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-surface-border/30 transition-colors group">
                                        <td className="py-4 px-6 text-sm text-text-secondary whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-AO')}</td>
                                        <td className="py-4 px-6">
                                            <span className="text-white font-bold text-sm">{t.description}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-surface-border flex items-center justify-center text-text-secondary">
                                                    <span className="material-symbols-outlined text-[14px]">{getIcon(t.category)}</span>
                                                </div>
                                                <span className="text-sm text-text-secondary">{t.category}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-text-secondary">{t.account}</td>
                                        <td className={`py-4 px-6 text-sm font-bold text-right ${t.type === 'income' ? 'text-primary' : 'text-white'}`}>
                                            {formatMoney(t.amount, t.type)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(t)} className="text-text-secondary hover:text-white" title="Editar">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button onClick={() => { if (window.confirm('Tem certeza?')) deleteTransaction(t.id) }} className="text-text-secondary hover:text-danger" title="Excluir">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-auto p-4 border-t border-surface-border flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Mostrando {filteredTransactions.length} transações</span>
                </div>
            </div>
        </div>
    );
};

