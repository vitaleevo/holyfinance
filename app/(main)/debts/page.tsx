"use client";

import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Debt } from '../../types';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function DebtsPage() {
    const { debts, addDebt, updateDebt, deleteDebt, accounts } = useTransactions();
    const { token } = useAuth();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', bank: '', totalValue: '', paidValue: '', monthlyParcel: '', dueDate: '', icon: 'home' });

    // Payment Logic
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [payAmount, setPayAmount] = useState("");
    const [payAccount, setPayAccount] = useState("");
    const payDebtMutation = useMutation(api.debts.payParcel);

    // Simulator State
    const [simValue, setSimValue] = useState(50000);
    const [simMonths, setSimMonths] = useState(12);
    const [simRate, setSimRate] = useState(14.5);

    const totalDebt = debts.reduce((acc, curr) => acc + (curr.totalValue - curr.paidValue), 0);
    const totalMonthly = debts.reduce((acc, curr) => acc + curr.monthlyParcel, 0);

    // Simulator Calculation
    const calculateSim = () => {
        const i = simRate / 100 / 12;
        const n = simMonths;
        const pmt = simValue * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        const totalToPay = pmt * n;
        return { pmt, totalToPay };
    };

    const { pmt, totalToPay } = calculateSim();

    const handleOpen = (d?: Debt) => {
        if (d) {
            setEditingId(d.id);
            setFormData({ name: d.name, bank: d.bank, totalValue: d.totalValue.toString(), paidValue: d.paidValue.toString(), monthlyParcel: d.monthlyParcel.toString(), dueDate: d.dueDate, icon: d.icon });
        } else {
            setEditingId(null);
            setFormData({ name: '', bank: '', totalValue: '', paidValue: '', monthlyParcel: '', dueDate: '', icon: 'home' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            bank: formData.bank,
            totalValue: parseFloat(formData.totalValue),
            paidValue: parseFloat(formData.paidValue),
            monthlyParcel: parseFloat(formData.monthlyParcel),
            dueDate: formData.dueDate,
            icon: formData.icon
        };
        if (editingId) updateDebt(editingId, data);
        else addDebt(data);
        setIsModalOpen(false);
    };

    const handleOpenPay = (debt: Debt) => {
        setSelectedDebt(debt);
        setPayAmount(debt.monthlyParcel.toString());
        setPayAccount(accounts.length > 0 ? accounts[0].id : "");
        setIsPayModalOpen(true);
    }

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDebt || !payAccount) return;

        try {
            await payDebtMutation({
                debtId: selectedDebt.id as any,
                accountId: payAccount as any,
                amount: parseFloat(payAmount),
                date: new Date().toISOString(),
                token: token ?? undefined
            });
            setIsPayModalOpen(false);
            showToast("Pagamento registrado com sucesso!", "success");
        } catch (err: any) {
            showToast(err.message || "Erro ao registrar pagamento", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tight">Gestão de Dívidas</h1>
                <p className="text-text-secondary">Acompanhe seus financiamentos e empréstimos.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Debt Overview */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <span className="material-symbols-outlined text-[100px] text-danger">trending_down</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Saldo Devedor Total</p>
                                <h2 className="text-3xl font-black text-white">KZ {totalDebt.toLocaleString()}</h2>
                                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded bg-surface-border text-xs text-text-secondary">
                                    <span className="material-symbols-outlined text-xs text-primary">trending_flat</span>
                                    Estável vs mês anterior
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <span className="material-symbols-outlined text-[100px] text-primary">calendar_month</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Comprometimento Mensal</p>
                                <h2 className="text-3xl font-black text-white">KZ {totalMonthly.toLocaleString()}</h2>
                                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded bg-surface-border text-xs text-text-secondary">
                                    Próximo: 15 Out
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <h3 className="text-xl font-bold text-white">Dívidas Ativas</h3>
                        <button onClick={() => handleOpen()} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold rounded-lg transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nova Dívida
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {debts.map((debt) => {
                            const pct = Math.min((debt.paidValue / debt.totalValue) * 100, 100);
                            return (
                                <div key={debt.id} className="rounded-xl bg-surface-dark border border-surface-border p-6 flex flex-col md:flex-row gap-6 items-center relative group hover:border-surface-border/80 transition-all">
                                    <div className="size-14 rounded-2xl bg-surface-border/50 flex items-center justify-center shrink-0 text-white">
                                        <span className="material-symbols-outlined text-2xl">{debt.icon}</span>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                                    {debt.name}
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleOpenPay(debt)} className="text-primary hover:text-white" title="Pagar Parcela"><span className="material-symbols-outlined text-[18px]">payments</span></button>
                                                        <button onClick={() => handleOpen(debt)} className="text-text-secondary hover:text-white"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                                        <button onClick={() => deleteDebt(debt.id)} className="text-text-secondary hover:text-danger"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                                    </div>
                                                </h4>
                                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">{debt.bank}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white text-lg">KZ {debt.totalValue.toLocaleString()}</p>
                                                <p className="text-xs text-text-secondary">Saldo: KZ {(debt.totalValue - debt.paidValue).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-background-dark rounded-full mt-2 overflow-hidden relative">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs font-medium">
                                            <span className="text-primary">{pct.toFixed(1)}% Pago</span>
                                            <span className="text-text-secondary">{debt.paidValue.toLocaleString()} amortizados</span>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto flex md:flex-col justify-between md:items-end gap-1 md:text-right border-t md:border-t-0 md:border-l border-surface-border pt-4 md:pt-0 md:pl-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase">Parcela</p>
                                            <p className="font-bold text-white text-lg">KZ {debt.monthlyParcel.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-text-secondary uppercase">Vencimento</p>
                                            <span className="inline-flex items-center text-xs font-medium text-white">
                                                Dia {debt.dueDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: Simulator */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">calculate</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Simulador</h3>
                                <p className="text-xs text-text-secondary">Simule pagamentos antecipados.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Valor Extra (KZ)</label>
                                <input
                                    type="number"
                                    className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-primary transition-colors"
                                    value={simValue}
                                    onChange={(e) => setSimValue(parseFloat(e.target.value))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-primary/20 border border-primary text-primary font-bold py-2 rounded-lg text-sm">Prazo</button>
                                <button className="bg-surface-border border border-transparent text-text-secondary hover:text-white font-bold py-2 rounded-lg text-sm">Parcela</button>
                            </div>

                            <div className="p-4 bg-background-dark rounded-xl border border-surface-border mt-2">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary mt-1">savings</span>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Resultado:</h4>
                                        <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                                            Você economizará <strong className="text-success">KZ {(totalToPay - simValue).toFixed(0)}</strong> em juros e quitará <strong className="text-white">3 meses antes</strong>!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">
                                Aplicar Simulação
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-md rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Dívida' : 'Nova Dívida'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-text-secondary uppercase">Nome da Dívida</label>
                                <input type="text" placeholder="Ex: Financiamento Carro" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-text-secondary uppercase">Credor / Instituição</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">apartment</span>
                                    <input type="text" placeholder="Banco..." value={formData.bank} onChange={e => setFormData({ ...formData, bank: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase">Valor Total</label>
                                    <input type="number" placeholder="0.00" value={formData.totalValue} onChange={e => setFormData({ ...formData, totalValue: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase">Valor Pago</label>
                                    <input type="number" placeholder="0.00" value={formData.paidValue} onChange={e => setFormData({ ...formData, paidValue: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase">Parcela Mensal</label>
                                    <input type="number" placeholder="0.00" value={formData.monthlyParcel} onChange={e => setFormData({ ...formData, monthlyParcel: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase">Vencimento (Dia)</label>
                                    <input type="text" placeholder="Ex: 15" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-text-secondary uppercase">Ícone</label>
                                <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary appearance-none">
                                    <option value="home">Casa/Imóvel</option>
                                    <option value="directions_car">Carro</option>
                                    <option value="credit_card">Cartão de Crédito</option>
                                    <option value="school">Educação</option>
                                    <option value="person">Pessoal</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-text-secondary font-bold hover:text-white">Cancelar</button>
                                <button type="submit" className="bg-primary text-background-dark font-bold px-8 py-2 rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPayModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsPayModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-4">Registrar Pagamento</h2>
                        <p className="text-text-secondary text-sm mb-4">Pagamento de parcela para <strong>{selectedDebt?.name}</strong></p>
                        <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Valor do Pagamento</label>
                                <input type="number" placeholder="0.00" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none" required />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Debitar da Conta</label>
                                <select
                                    value={payAccount}
                                    onChange={e => setPayAccount(e.target.value)}
                                    className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white outline-none"
                                    required
                                >
                                    <option value="">Selecione uma conta...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (KZ {acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="bg-success text-white font-bold py-2 rounded-lg mt-2">Confirmar Pagamento</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

