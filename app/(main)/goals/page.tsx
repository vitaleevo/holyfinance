"use client";

import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { Goal } from '../../types';

export default function GoalsPage() {
    const { goals, accounts, addGoal, deleteGoal, addFundsToGoal, updateGoal } = useTransactions();

    // States for Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        category: 'Bens Materiais',
        targetAmount: '',
        deadline: '',
        icon: 'savings'
    });

    const [depositAmount, setDepositAmount] = useState('');
    const [depositAccountId, setDepositAccountId] = useState('');

    // Helpers
    const openCreateModal = () => {
        setFormData({ title: '', category: 'Bens Materiais', targetAmount: '', deadline: '', icon: 'savings' });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setFormData({
            title: goal.title,
            category: goal.category,
            targetAmount: goal.targetAmount.toString(),
            deadline: goal.deadline,
            icon: goal.icon
        });
        setIsEditModalOpen(true);
    };

    const openDepositModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setDepositAmount('');
        // Default to first account if available
        setDepositAccountId(accounts.length > 0 ? accounts[0].id : '');
        setIsDepositModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addGoal({
            title: formData.title,
            category: formData.category,
            targetAmount: parseFloat(formData.targetAmount),
            deadline: formData.deadline,
            icon: formData.icon
        });
        setIsCreateModalOpen(false);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGoal) {
            updateGoal(selectedGoal.id, {
                title: formData.title,
                category: formData.category,
                targetAmount: parseFloat(formData.targetAmount),
                deadline: formData.deadline,
                icon: formData.icon
            });
        }
        setIsEditModalOpen(false);
    };

    const handleDepositSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGoal && depositAmount) {
            addFundsToGoal(selectedGoal.id, parseFloat(depositAmount), depositAccountId);
            setIsDepositModalOpen(false);
        }
    };

    // Calculations
    const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
    const activeGoalsCount = goals.filter(g => g.status === 'active').length;

    const getRemainingTime = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        const months = Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
        if (months < 0) return 'Vencido';
        if (months === 0) return 'Este mês';
        return `${months} meses restantes`;
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Meus Objetivos</h1>
                    <p className="text-text-secondary text-base font-normal leading-normal max-w-2xl">
                        Planeje suas conquistas. Guarde dinheiro para comprar um carro, construir sua casa ou realizar um sonho.
                    </p>
                </div>
                <button onClick={openCreateModal} className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark transition-colors text-background-dark text-sm font-bold shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span className="truncate">Nova Meta</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-dark border border-surface-border shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Total Acumulado</p>
                        <span className="bg-[#1f3b2d] text-primary text-xs font-bold px-2 py-1 rounded">Reservado</span>
                    </div>
                    <p className="text-white text-3xl font-bold leading-tight mt-1">KZ {totalSaved.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-dark border border-surface-border shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Metas Ativas</p>
                        <span className="material-symbols-outlined text-text-secondary">target</span>
                    </div>
                    <p className="text-white text-3xl font-bold leading-tight mt-1">{activeGoalsCount} <span className="text-lg text-text-secondary font-medium">em andamento</span></p>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.map((goal) => {
                    const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                    const isCompleted = pct >= 100;

                    return (
                        <div key={goal.id} className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-dark p-6 hover:border-primary/30 transition-all group relative">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary text-background-dark' : 'bg-surface-border text-white'}`}>
                                        <span className="material-symbols-outlined text-3xl">{isCompleted ? 'check_circle' : goal.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-xl font-bold leading-tight">{goal.title}</h3>
                                        <p className="text-text-secondary text-sm mt-1">{goal.category}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(goal)} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-surface-border transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button onClick={() => { if (confirm('Excluir esta meta?')) deleteGoal(goal.id) }} className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-surface-border transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex justify-between items-end">
                                    <span className={`text-4xl font-black tracking-tight ${isCompleted ? 'text-primary' : 'text-white'}`}>{pct}%</span>
                                    <div className="text-right">
                                        <p className="text-xs text-text-secondary uppercase mb-1">Faltam</p>
                                        <p className="text-white font-bold">KZ {(goal.targetAmount - goal.currentAmount).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-surface-border h-4 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-primary' : 'bg-gradient-to-r from-primary/50 to-primary'}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-text-secondary mt-1">
                                    <span>Guardado: KZ {goal.currentAmount.toLocaleString()}</span>
                                    <span>Meta: KZ {goal.targetAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-5 border-t border-surface-border mt-2">
                                <div className="flex items-center gap-2 text-text-secondary text-sm">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                    <span>{isCompleted ? 'Concluído!' : getRemainingTime(goal.deadline)}</span>
                                </div>
                                <button
                                    onClick={() => openDepositModal(goal)}
                                    disabled={isCompleted}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${isCompleted ? 'bg-surface-border text-text-secondary cursor-not-allowed' : 'bg-primary text-background-dark hover:bg-primary-dark shadow-lg shadow-primary/10'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">savings</span>
                                    Investir / Guardar
                                </button>
                            </div>
                        </div>
                    )
                })}

                {goals.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-surface-border rounded-xl text-text-secondary">
                        <span className="material-symbols-outlined text-6xl opacity-20 mb-4">flag</span>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum objetivo ainda</h3>
                        <p className="max-w-md text-center mb-6">Comece a planejar seus sonhos. Crie uma meta para comprar um carro, uma casa ou fazer uma viagem.</p>
                        <button onClick={openCreateModal} className="text-primary font-bold hover:underline">Criar minha primeira meta</button>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-md rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-6">Criar Nova Meta</h2>
                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Nome da Meta</label>
                                <input type="text" required placeholder="Ex: Comprar Terreno" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Valor do Objetivo (KZ)</label>
                                <input type="number" required placeholder="0,00" value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase">Categoria</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none">
                                        <option>Bens Materiais</option>
                                        <option>Construção</option>
                                        <option>Viagem</option>
                                        <option>Reserva</option>
                                        <option>Educação</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase">Ícone</label>
                                    <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none">
                                        <option value="savings">Cofrinho</option>
                                        <option value="directions_car">Carro</option>
                                        <option value="home">Casa/Terreno</option>
                                        <option value="flight">Viagem</option>
                                        <option value="school">Estudos</option>
                                        <option value="construction">Construção</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Data Alvo</label>
                                <input type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none" />
                            </div>
                            <button type="submit" className="mt-2 bg-primary text-background-dark font-bold py-3 rounded-lg hover:bg-primary-dark">Criar Meta</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-md rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-6">Editar Meta</h2>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Nome da Meta</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Valor do Objetivo (KZ)</label>
                                <input type="number" required value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase">Categoria</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none">
                                        <option>Bens Materiais</option>
                                        <option>Construção</option>
                                        <option>Viagem</option>
                                        <option>Reserva</option>
                                        <option>Educação</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase">Ícone</label>
                                    <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none">
                                        <option value="savings">Cofrinho</option>
                                        <option value="directions_car">Carro</option>
                                        <option value="home">Casa/Terreno</option>
                                        <option value="flight">Viagem</option>
                                        <option value="school">Estudos</option>
                                        <option value="construction">Construção</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Data Alvo</label>
                                <input type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none" />
                            </div>
                            <button type="submit" className="mt-2 bg-primary text-background-dark font-bold py-3 rounded-lg hover:bg-primary-dark">Salvar Alterações</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {isDepositModalOpen && selectedGoal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsDepositModalOpen(false)}>
                    <div className="bg-surface-dark border border-surface-border w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Investir na Meta</h2>
                                <p className="text-xs text-text-secondary">{selectedGoal.title}</p>
                            </div>
                        </div>

                        <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Quanto quer guardar hoje?</label>
                                <div className="relative mt-2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">KZ</span>
                                    <input
                                        autoFocus
                                        type="number"
                                        required
                                        placeholder="0,00"
                                        value={depositAmount}
                                        onChange={e => setDepositAmount(e.target.value)}
                                        className="w-full bg-background-dark border border-surface-border rounded-xl pl-12 pr-4 py-4 text-2xl text-white font-bold focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase">Retirar da Conta</label>
                                <select
                                    value={depositAccountId}
                                    onChange={e => setDepositAccountId(e.target.value)}
                                    className="w-full bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white mt-1 focus:border-primary outline-none"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (KZ {acc.balance.toLocaleString()})</option>
                                    ))}
                                    <option value="">Não debitar de conta</option>
                                </select>
                                <p className="text-[10px] text-text-secondary mt-1">Ao selecionar uma conta, o valor será descontado do saldo automaticamente.</p>
                            </div>

                            <button type="submit" className="mt-2 w-full bg-primary text-background-dark font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                                Confirmar Investimento
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

