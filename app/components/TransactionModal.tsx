"use client";

import React, { useState, useEffect } from 'react';
import { TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';

export const TransactionModal = () => {
    const { isModalOpen, closeModal, addTransaction, updateTransaction, editingTransaction } = useTransactions();

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense' as TransactionType,
        category: 'Alimentação',
        date: new Date().toISOString().split('T')[0],
        account: 'Banco BAI',
        status: 'paid' as 'paid' | 'pending' | 'completed'
    });

    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                description: editingTransaction.description,
                amount: editingTransaction.amount.toString(),
                type: editingTransaction.type,
                category: editingTransaction.category,
                date: editingTransaction.date,
                account: editingTransaction.account,
                // Map 'completed' (default from DB) to 'paid' for the UI
                status: editingTransaction.status === 'completed' ? 'paid' : editingTransaction.status
            });
        } else {
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: 'Alimentação',
                date: new Date().toISOString().split('T')[0],
                account: 'Banco BAI',
                status: 'paid'
            });
        }
    }, [editingTransaction, isModalOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionData = {
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            date: formData.date,
            account: formData.account,
            status: formData.status
        };

        if (editingTransaction) {
            updateTransaction(editingTransaction.id, transactionData);
        } else {
            addTransaction(transactionData);
        }
        closeModal();
    };

    if (!isModalOpen) return null;

    const isExpense = formData.type === 'expense';
    const themeColor = isExpense ? 'text-danger' : 'text-primary';
    const borderColor = isExpense ? 'focus:border-danger' : 'focus:border-primary';

    return (
        <div className="fixed inset-0 z-[100] bg-background-dark/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
            <div className="bg-surface-dark border border-surface-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                <div className="px-8 py-6 border-b border-surface-border flex justify-between items-center bg-background-dark/50">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {editingTransaction ? 'Editar Transação' : (isExpense ? 'Nova Despesa' : 'Nova Receita')}
                        </h2>
                        <p className="text-text-secondary text-sm">Preencha os detalhes da movimentação.</p>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-surface-border rounded-full transition-colors text-text-secondary hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
                    <div className="p-8 flex flex-col gap-8">

                        {!editingTransaction && (
                            <div className="flex p-1 bg-background-dark rounded-xl border border-surface-border self-center">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isExpense ? 'bg-surface-border text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
                                >
                                    Despesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'income' })}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isExpense ? 'bg-surface-border text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
                                >
                                    Receita
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Valor da Transação</label>
                            <div className="relative group">
                                <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-black ${themeColor} opacity-50`}>KZ</span>
                                <input
                                    autoFocus
                                    type="number"
                                    placeholder="0,00"
                                    required
                                    className={`w-full bg-transparent border-b-2 border-surface-border py-4 pl-16 text-5xl font-black text-white focus:outline-none transition-colors placeholder:text-surface-border ${isExpense ? 'focus:border-danger' : 'focus:border-primary'}`}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white">Data</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={`w-full bg-background-dark border border-surface-border rounded-xl px-4 py-3 text-white outline-none transition-colors ${borderColor}`}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">calendar_today</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white">Categoria</label>
                                <div className="relative">
                                    <select
                                        className={`w-full bg-background-dark border border-surface-border rounded-xl px-4 py-3 text-white outline-none appearance-none transition-colors ${borderColor}`}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {isExpense ? (
                                            <>
                                                <option>Alimentação</option>
                                                <option>Transporte</option>
                                                <option>Moradia</option>
                                                <option>Lazer</option>
                                                <option>Saúde</option>
                                                <option>Educação</option>
                                                <option>Outros</option>
                                            </>
                                        ) : (
                                            <>
                                                <option>Salário</option>
                                                <option>Investimento</option>
                                                <option>Extra</option>
                                                <option>Presente</option>
                                            </>
                                        )}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white">Conta {isExpense ? 'de Origem' : 'de Destino'}</label>
                                <div className="relative">
                                    <select
                                        className={`w-full bg-background-dark border border-surface-border rounded-xl px-4 py-3 text-white outline-none appearance-none transition-colors ${borderColor}`}
                                        value={formData.account}
                                        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    >
                                        <option>Banco BAI</option>
                                        <option>Banco Millennium</option>
                                        <option>Nubank</option>
                                        <option>Carteira</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">account_balance</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white">Status</label>
                                <div className="flex items-center gap-4 h-[50px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            className={`accent-${isExpense ? 'danger' : 'primary'} size-5`}
                                            checked={formData.status === 'paid'}
                                            onChange={() => setFormData({ ...formData, status: 'paid' })}
                                        />
                                        <span className="text-white text-sm">{isExpense ? 'Pago' : 'Recebido'}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            className={`accent-${isExpense ? 'danger' : 'primary'} size-5`}
                                            checked={formData.status === 'pending'}
                                            onChange={() => setFormData({ ...formData, status: 'pending' })}
                                        />
                                        <span className="text-white text-sm">Pendente</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Descrição</label>
                            <input
                                type="text"
                                placeholder="Ex: Jantar de Aniversário"
                                className={`w-full bg-background-dark border border-surface-border rounded-xl px-4 py-3 text-white outline-none transition-colors ${borderColor}`}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-surface-border bg-background-dark/50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 rounded-xl font-bold text-text-secondary hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-8 py-3 rounded-xl font-bold text-background-dark shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${isExpense ? 'bg-danger hover:bg-red-400 shadow-danger/20' : 'bg-primary hover:bg-primary-dark shadow-primary/20'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">check</span>
                            Salvar {isExpense ? 'Despesa' : 'Receita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
