"use client";

import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { checkLimit } from '../../utils/plans';
import { formatKwanza, maskValue } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';
import { Account } from '../../types';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function AccountsPage() {
    const { user } = useAuth();
    const { accounts, addAccount, updateAccount, deleteAccount, settings } = useTransactions();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferFrom, setTransferFrom] = useState("");
    const [transferTo, setTransferTo] = useState("");
    const [transferAmount, setTransferAmount] = useState("");

    const transferMutation = useMutation(api.accounts.transfer);

    const [formData, setFormData] = useState({ name: '', bankName: '', type: 'Conta Corrente', balance: '' });

    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const formatMoney = (val: number) => {
        return maskValue(formatKwanza(val), settings.privacyMode);
    };

    const handleOpen = (acc?: Account) => {
        if (acc) {
            setEditingId(acc.id);
            setFormData({ name: acc.name, bankName: acc.bankName, type: acc.type, balance: acc.balance.toString() });
        } else {
            setEditingId(null);
            setFormData({ name: '', bankName: '', type: 'Conta Corrente', balance: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            bankName: formData.bankName,
            type: formData.type,
            balance: parseFloat(formData.balance)
        };

        if (editingId) updateAccount(editingId, data);
        else addAccount(data);

        setIsModalOpen(false);
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await transferMutation({
                fromAccountId: transferFrom as any,
                toAccountId: transferTo as any,
                amount: parseFloat(transferAmount),
                date: new Date().toISOString()
            });
            setIsTransferModalOpen(false);
            setTransferAmount("");
            showToast("Transferência realizada com sucesso!", "success");
        } catch (error: any) {
            showToast(error.message || "Erro na transferência", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Minhas Contas</h1>
                <p className="text-text-secondary text-base">Gerencie seus saldos bancários e cartões.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border shadow-sm flex flex-col gap-4">
                        <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Saldo Total Líquido</p>
                        <h2 className={`text-4xl font-black text-white ${settings.privacyMode ? 'tracking-widest' : ''}`}>{formatMoney(totalBalance)}</h2>
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="mt-4 w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-background-dark transition-all"
                        >
                            Transferir Fundos
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {accounts.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-5 rounded-xl bg-surface-dark border border-surface-border group">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-full bg-background-dark border border-surface-border flex items-center justify-center">
                                    <span className="material-symbols-outlined text-text-secondary">account_balance</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{acc.name}</h3>
                                    <p className="text-text-secondary text-sm">{acc.type} - {acc.bankName}</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <p className={`text-lg font-bold ${acc.balance >= 0 ? 'text-white' : 'text-danger'} ${settings.privacyMode ? 'tracking-widest' : ''}`}>
                                    {formatMoney(acc.balance)}
                                </p>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpen(acc)} className="text-text-secondary hover:text-white"><span className="material-symbols-outlined">edit</span></button>
                                    <button onClick={() => { if (confirm('Apagar conta?')) deleteAccount(acc.id) }} className="text-text-secondary hover:text-danger"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {checkLimit(user?.planType, 'maxAccounts', accounts.length) ? (
                        <button onClick={() => handleOpen()} className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-surface-border text-text-secondary hover:text-white hover:border-primary hover:bg-surface-dark transition-all">
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="font-medium">Adicionar Nova Conta</span>
                        </button>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-surface-border bg-surface-dark/30 text-center">
                            <span className="material-symbols-outlined text-text-secondary text-3xl">lock</span>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-white">Limite de Contas Atingido</span>
                                <p className="text-sm text-text-secondary">Faça upgrade do seu plano para gerenciar mais contas.</p>
                            </div>
                            <a href="/subscription" className="mt-2 text-primary font-bold text-sm hover:underline">Ver Planos</a>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-md rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Conta' : 'Nova Conta'}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input type="text" placeholder="Nome (Ex: Conta Salário)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <input type="text" placeholder="Banco (Ex: BAI)" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none">
                                <option>Conta Corrente</option>
                                <option>Conta Poupança</option>
                                <option>Cartão de Crédito</option>
                                <option>Carteira</option>
                            </select>
                            <input type="number" placeholder="Saldo Atual" value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            <button type="submit" className="bg-primary text-background-dark font-bold py-2 rounded-lg mt-2">Salvar</button>
                        </form>
                    </div>
                </div>
            )}

            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsTransferModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-md rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-4">Transferir Fundos</h2>
                        <form onSubmit={handleTransfer} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-text-secondary">De (Origem)</label>
                                <select
                                    value={transferFrom}
                                    onChange={e => setTransferFrom(e.target.value)}
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none"
                                    required
                                >
                                    <option value="">Selecione a conta de origem</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={acc.id === transferTo}>{acc.name} ({formatMoney(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-text-secondary">Para (Destino)</label>
                                <select
                                    value={transferTo}
                                    onChange={e => setTransferTo(e.target.value)}
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none"
                                    required
                                >
                                    <option value="">Selecione a conta de destino</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={acc.id === transferFrom}>{acc.name} ({formatMoney(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-text-secondary">Valor</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={transferAmount}
                                    onChange={e => setTransferAmount(e.target.value)}
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none"
                                    required
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>

                            <button type="submit" className="bg-primary text-background-dark font-bold py-3 rounded-xl mt-2 hover:brightness-90 transition-all">Confirmar Transferência</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

