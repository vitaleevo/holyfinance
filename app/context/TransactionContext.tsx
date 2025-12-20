"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Transaction, Goal, Account, BudgetLimit, Investment, Debt, AppSettings, TransactionType } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface TransactionContextType {
    // Transactions
    transactions: Transaction[];
    addTransaction: (data: Omit<Transaction, 'id'>) => void;
    updateTransaction: (id: string, data: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    isModalOpen: boolean;
    openModal: (t?: Transaction) => void;
    closeModal: () => void;
    editingTransaction: Transaction | null;

    // Goals
    goals: Goal[];
    addGoal: (data: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => void;
    updateGoal: (id: string, data: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    addFundsToGoal: (id: string, amount: number, accountId?: string) => void;

    // Accounts
    accounts: Account[];
    addAccount: (data: Omit<Account, 'id'>) => void;
    updateAccount: (id: string, data: Partial<Account>) => void;
    deleteAccount: (id: string) => void;

    // Budgets
    budgetLimits: BudgetLimit[];
    addBudgetLimit: (data: Omit<BudgetLimit, 'id'>) => void;
    updateBudgetLimit: (id: string, data: Partial<BudgetLimit>) => void;
    deleteBudgetLimit: (id: string) => void;

    // Investments
    investments: Investment[];
    addInvestment: (data: Omit<Investment, 'id'>, accountId?: string) => void;
    updateInvestment: (id: string, data: Partial<Investment>) => void;
    deleteInvestment: (id: string) => void;

    // Debts
    debts: Debt[];
    addDebt: (data: Omit<Debt, 'id'>) => void;
    updateDebt: (id: string, data: Partial<Debt>) => void;
    deleteDebt: (id: string) => void;

    // Settings
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const { showToast } = useToast();

    // --- UI STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // --- CONVEX DATA (filtered by token) ---
    const convexTransactions = useQuery(api.transactions.get, { token: token ?? undefined });
    const convexGoals = useQuery(api.goals.get, { token: token ?? undefined });
    const convexAccounts = useQuery(api.accounts.get, { token: token ?? undefined });
    const convexBudgets = useQuery(api.budgets.get, { token: token ?? undefined });
    const convexInvestments = useQuery(api.investments.get, { token: token ?? undefined });
    const convexDebts = useQuery(api.debts.get, { token: token ?? undefined });
    const convexSettings = useQuery(api.settings.get, { token: token ?? undefined });

    // --- MAPPED DATA ---
    const transactions: Transaction[] = (convexTransactions || []).map((t) => ({
        id: t._id,
        description: t.description,
        amount: t.amount,
        type: t.type as TransactionType,
        category: t.category,
        date: t.date,
        account: t.account,
        status: (t.status === 'pending' || t.status === 'completed' ? t.status : 'paid') as Transaction['status']
    }));
    const goals: Goal[] = (convexGoals || []).map((t) => ({ ...t, id: t._id, status: t.status as Goal['status'] }));
    const accounts: Account[] = (convexAccounts || []).map((t) => ({ ...t, id: t._id }));
    const budgetLimits: BudgetLimit[] = (convexBudgets || []).map((t) => ({ ...t, id: t._id }));
    const investments: Investment[] = (convexInvestments || []).map((t) => ({ ...t, id: t._id, type: t.type as Investment['type'] }));
    const debts: Debt[] = (convexDebts || []).map((t) => ({ ...t, id: t._id }));

    const settings: AppSettings = convexSettings ? {
        theme: convexSettings.theme as 'dark' | 'light',
        emailNotifications: convexSettings.emailNotifications,
        privacyMode: convexSettings.privacyMode
    } : {
        theme: 'dark',
        emailNotifications: true,
        privacyMode: false
    };

    // --- MUTATIONS ---
    const createTransaction = useMutation(api.transactions.create);
    const updateTransactionMutation = useMutation(api.transactions.update);
    const deleteTransactionMutation = useMutation(api.transactions.remove);

    const createGoal = useMutation(api.goals.create);
    const updateGoalMutation = useMutation(api.goals.update);
    const deleteGoalMutation = useMutation(api.goals.remove);
    const addFundsGoalMutation = useMutation(api.goals.addFundsCompensating);

    const createAccount = useMutation(api.accounts.create);
    const updateAccountMutation = useMutation(api.accounts.update);
    const deleteAccountMutation = useMutation(api.accounts.remove);

    const createBudget = useMutation(api.budgets.create);
    const updateBudgetMutation = useMutation(api.budgets.update);
    const deleteBudgetMutation = useMutation(api.budgets.remove);

    const createInvestment = useMutation(api.investments.create);
    const updateInvestmentMutation = useMutation(api.investments.update);
    const deleteInvestmentMutation = useMutation(api.investments.remove);

    const createDebt = useMutation(api.debts.create);
    const updateDebtMutation = useMutation(api.debts.update);
    const deleteDebtMutation = useMutation(api.debts.remove);

    const updateSettingsMutation = useMutation(api.settings.update);

    // --- EFFECTS ---
    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    // --- HANDLERS (all require userId) ---

    // Transactions
    const addTransaction = async (data: Omit<Transaction, 'id'>) => {
        if (!token) return;
        try {
            await createTransaction({ token, ...data });
            showToast("Transação registrada com sucesso!", "success");
        } catch (err: any) {
            showToast(err.message || "Erro ao adicionar transação", "error");
        }
    };
    const updateTransaction = async (id: string, data: Omit<Transaction, 'id'>) => {
        if (!token) return;
        try {
            await updateTransactionMutation({ ...data, id: id as any as Id<"transactions">, token });
            showToast("Transação atualizada!", "success");
        } catch (err: any) {
            showToast(err.message || "Erro ao atualizar", "error");
        }
    };
    const deleteTransaction = async (id: string) => {
        if (!token) return;
        try {
            await deleteTransactionMutation({ id: id as any as Id<"transactions">, token });
            showToast("Transação removida", "success");
        } catch (err: any) {
            showToast(err.message || "Erro ao remover", "error");
        }
    };

    const openModal = (t?: Transaction) => { setEditingTransaction(t || null); setIsModalOpen(true); };
    const closeModal = () => { setEditingTransaction(null); setIsModalOpen(false); };

    // Goals
    const addGoal = async (data: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => {
        if (!token) return;
        try {
            await createGoal({ token, ...data });
            showToast("Meta criada!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const updateGoal = async (id: string, data: Partial<Goal>) => {
        if (!token) return;
        try {
            await updateGoalMutation({ ...data, id: id as any as Id<"goals">, token });
            showToast("Meta atualizada!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const deleteGoal = async (id: string) => {
        if (!token) return;
        try {
            await deleteGoalMutation({ id: id as any as Id<"goals">, token });
            showToast("Meta removida", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const addFundsToGoal = async (id: string, amount: number, accountId?: string) => {
        if (!token) return;
        try {
            const accId = accountId ? accountId as any as Id<"accounts"> : undefined;
            await addFundsGoalMutation({ goalId: id as any as Id<"goals">, token, amount, accountId: accId });
            showToast("Fundos adicionados à meta!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    // Accounts
    const addAccount = async (data: Omit<Account, 'id'>) => {
        if (!token) return;
        try {
            await createAccount({ token, ...data });
            showToast("Conta adicionada!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const updateAccount = async (id: string, data: Partial<Account>) => {
        if (!token) return;
        try {
            await updateAccountMutation({ ...data, id: id as any as Id<"accounts">, token });
            showToast("Conta atualizada!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const deleteAccount = async (id: string) => {
        if (!token) return;
        try {
            await deleteAccountMutation({ id: id as any as Id<"accounts">, token });
            showToast("Conta removida", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    // Budgets
    const addBudgetLimit = async (data: Omit<BudgetLimit, 'id'>) => {
        if (!token) return;
        try {
            await createBudget({ token, ...data });
            showToast("Limite de orçamento definido!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const updateBudgetLimit = async (id: string, data: Partial<BudgetLimit>) => {
        if (!token) return;
        try {
            await updateBudgetMutation({ ...data, id: id as any as Id<"budgetLimits">, token });
            showToast("Orçamento atualizado!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const deleteBudgetLimit = async (id: string) => {
        if (!token) return;
        try {
            await deleteBudgetMutation({ id: id as any as Id<"budgetLimits">, token });
            showToast("Orçamento removido", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    // Investments
    const addInvestment = async (data: Omit<Investment, 'id'>, accountId?: string) => {
        if (!token) return;
        try {
            const accId = accountId ? accountId as any as Id<"accounts"> : undefined;
            await createInvestment({ token, ...data, accountId: accId });
            showToast("Investimento registrado!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const updateInvestment = async (id: string, data: Partial<Investment>) => {
        if (!token) return;
        try {
            await updateInvestmentMutation({ ...data, id: id as any as Id<"investments">, token });
            showToast("Investimento atualizado!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const deleteInvestment = async (id: string) => {
        if (!token) return;
        try {
            await deleteInvestmentMutation({ id: id as any as Id<"investments">, token });
            showToast("Investimento removido", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    // Debts
    const addDebt = async (data: Omit<Debt, 'id'>) => {
        if (!token) return;
        try {
            await createDebt({ token, ...data });
            showToast("Dívida cadastrada!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const updateDebt = async (id: string, data: Partial<Debt>) => {
        if (!token) return;
        try {
            await updateDebtMutation({ ...data, id: id as any as Id<"debts">, token });
            showToast("Dívida atualizada!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };
    const deleteDebt = async (id: string) => {
        if (!token) return;
        try {
            await deleteDebtMutation({ id: id as any as Id<"debts">, token });
            showToast("Dívida removida", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    // Settings
    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        if (!token) return;
        try {
            await updateSettingsMutation({ token, ...newSettings });
            showToast("Configurações salvas!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    return (
        <TransactionContext.Provider value={{
            transactions, addTransaction, updateTransaction, deleteTransaction, isModalOpen, openModal, closeModal, editingTransaction,
            goals, addGoal, updateGoal, deleteGoal, addFundsToGoal,
            accounts, addAccount, updateAccount, deleteAccount,
            budgetLimits, addBudgetLimit, updateBudgetLimit, deleteBudgetLimit,
            investments, addInvestment, updateInvestment, deleteInvestment,
            debts, addDebt, updateDebt, deleteDebt,
            settings, updateSettings
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) throw new Error('useTransactions must be used within a TransactionProvider');
    return context;
};
