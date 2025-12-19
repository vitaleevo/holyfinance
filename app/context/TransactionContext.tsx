"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Transaction, Goal, Account, BudgetLimit, Investment, Debt, AppSettings, TransactionType } from '../types';
import { useAuth } from './AuthContext';

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
    const addTransaction = (data: Omit<Transaction, 'id'>) => {
        if (!token) return;
        createTransaction({ token, ...data });
    };
    const updateTransaction = (id: string, data: Omit<Transaction, 'id'>) => {
        if (!token) return;
        updateTransactionMutation({ id: id as unknown as Id<"transactions">, token, ...data });
    };
    const deleteTransaction = (id: string) => {
        if (!token) return;
        deleteTransactionMutation({ id: id as unknown as Id<"transactions">, token });
    };

    const openModal = (t?: Transaction) => { setEditingTransaction(t || null); setIsModalOpen(true); };
    const closeModal = () => { setEditingTransaction(null); setIsModalOpen(false); };

    // Goals
    const addGoal = (data: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => {
        if (!token) return;
        createGoal({ token, ...data });
    };
    const updateGoal = (id: string, data: Partial<Goal>) => {
        if (!token) return;
        updateGoalMutation({ id: id as unknown as Id<"goals">, token, ...data });
    };
    const deleteGoal = (id: string) => {
        if (!token) return;
        deleteGoalMutation({ id: id as unknown as Id<"goals">, token });
    };
    const addFundsToGoal = (id: string, amount: number, accountId?: string) => {
        if (!token) return;
        const accId = accountId ? accountId as unknown as Id<"accounts"> : undefined;
        addFundsGoalMutation({ goalId: id as unknown as Id<"goals">, token, amount, accountId: accId });
    };

    // Accounts
    const addAccount = (data: Omit<Account, 'id'>) => {
        if (!token) return;
        createAccount({ token, ...data });
    };
    const updateAccount = (id: string, data: Partial<Account>) => {
        if (!token) return;
        updateAccountMutation({ id: id as unknown as Id<"accounts">, token, ...data });
    };
    const deleteAccount = (id: string) => {
        if (!token) return;
        deleteAccountMutation({ id: id as unknown as Id<"accounts">, token });
    };

    // Budgets
    const addBudgetLimit = (data: Omit<BudgetLimit, 'id'>) => {
        if (!token) return;
        createBudget({ token, ...data });
    };
    const updateBudgetLimit = (id: string, data: Partial<BudgetLimit>) => {
        if (!token) return;
        updateBudgetMutation({ id: id as unknown as Id<"budgetLimits">, token, ...data });
    };
    const deleteBudgetLimit = (id: string) => {
        if (!token) return;
        deleteBudgetMutation({ id: id as unknown as Id<"budgetLimits">, token });
    };

    // Investments
    const addInvestment = (data: Omit<Investment, 'id'>, accountId?: string) => {
        if (!token) return;
        const accId = accountId ? accountId as unknown as Id<"accounts"> : undefined;
        createInvestment({ token, ...data, accountId: accId });
    };
    const updateInvestment = (id: string, data: Partial<Investment>) => {
        if (!token) return;
        updateInvestmentMutation({ id: id as unknown as Id<"investments">, token, ...data });
    };
    const deleteInvestment = (id: string) => {
        if (!token) return;
        deleteInvestmentMutation({ id: id as unknown as Id<"investments">, token });
    };

    // Debts
    const addDebt = (data: Omit<Debt, 'id'>) => {
        if (!token) return;
        createDebt({ token, ...data });
    };
    const updateDebt = (id: string, data: Partial<Debt>) => {
        if (!token) return;
        updateDebtMutation({ id: id as unknown as Id<"debts">, token, ...data });
    };
    const deleteDebt = (id: string) => {
        if (!token) return;
        deleteDebtMutation({ id: id as unknown as Id<"debts">, token });
    };

    // Settings
    const updateSettings = (newSettings: Partial<AppSettings>) => {
        if (!token) return;
        updateSettingsMutation({ token, ...newSettings });
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
