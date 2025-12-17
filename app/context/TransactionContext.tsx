"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Transaction, Goal, Account, BudgetLimit, Investment, Debt, AppSettings } from '../types';
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
    const { userId } = useAuth();

    // --- UI STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // --- CONVEX DATA (filtered by userId) ---
    const convexTransactions = useQuery(api.transactions.get, { userId: userId ?? undefined });
    const convexGoals = useQuery(api.goals.get, { userId: userId ?? undefined });
    const convexAccounts = useQuery(api.accounts.get, { userId: userId ?? undefined });
    const convexBudgets = useQuery(api.budgets.get, { userId: userId ?? undefined });
    const convexInvestments = useQuery(api.investments.get, { userId: userId ?? undefined });
    const convexDebts = useQuery(api.debts.get, { userId: userId ?? undefined });
    const convexSettings = useQuery(api.settings.get, { userId: userId ?? undefined });

    // --- MAPPED DATA ---
    const transactions: Transaction[] = (convexTransactions || []).map((t: any) => ({ ...t, id: t._id }));
    const goals: Goal[] = (convexGoals || []).map((t: any) => ({ ...t, id: t._id }));
    const accounts: Account[] = (convexAccounts || []).map((t: any) => ({ ...t, id: t._id }));
    const budgetLimits: BudgetLimit[] = (convexBudgets || []).map((t: any) => ({ ...t, id: t._id }));
    const investments: Investment[] = (convexInvestments || []).map((t: any) => ({ ...t, id: t._id }));
    const debts: Debt[] = (convexDebts || []).map((t: any) => ({ ...t, id: t._id }));

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
        if (!userId) return;
        createTransaction({ userId, ...data });
    };
    const updateTransaction = (id: string, data: Omit<Transaction, 'id'>) => {
        if (!userId) return;
        updateTransactionMutation({ id: id as Id<"transactions">, userId, ...data });
    };
    const deleteTransaction = (id: string) => {
        if (!userId) return;
        deleteTransactionMutation({ id: id as Id<"transactions">, userId });
    };

    const openModal = (t?: Transaction) => { setEditingTransaction(t || null); setIsModalOpen(true); };
    const closeModal = () => { setEditingTransaction(null); setIsModalOpen(false); };

    // Goals
    const addGoal = (data: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => {
        if (!userId) return;
        createGoal({ userId, ...data });
    };
    const updateGoal = (id: string, data: Partial<Goal>) => {
        if (!userId) return;
        updateGoalMutation({ id: id as Id<"goals">, userId, ...data });
    };
    const deleteGoal = (id: string) => {
        if (!userId) return;
        deleteGoalMutation({ id: id as Id<"goals">, userId });
    };
    const addFundsToGoal = (id: string, amount: number, accountId?: string) => {
        if (!userId) return;
        const accId = accountId ? accountId as Id<"accounts"> : undefined;
        addFundsGoalMutation({ goalId: id as Id<"goals">, userId, amount, accountId: accId });
    };

    // Accounts
    const addAccount = (data: Omit<Account, 'id'>) => {
        if (!userId) return;
        createAccount({ userId, ...data });
    };
    const updateAccount = (id: string, data: Partial<Account>) => {
        if (!userId) return;
        updateAccountMutation({ id: id as Id<"accounts">, userId, ...data });
    };
    const deleteAccount = (id: string) => {
        if (!userId) return;
        deleteAccountMutation({ id: id as Id<"accounts">, userId });
    };

    // Budgets
    const addBudgetLimit = (data: Omit<BudgetLimit, 'id'>) => {
        if (!userId) return;
        createBudget({ userId, ...data });
    };
    const updateBudgetLimit = (id: string, data: Partial<BudgetLimit>) => {
        if (!userId) return;
        updateBudgetMutation({ id: id as Id<"budgetLimits">, userId, ...data });
    };
    const deleteBudgetLimit = (id: string) => {
        if (!userId) return;
        deleteBudgetMutation({ id: id as Id<"budgetLimits">, userId });
    };

    // Investments
    const addInvestment = (data: Omit<Investment, 'id'>, accountId?: string) => {
        if (!userId) return;
        const accId = accountId ? accountId as Id<"accounts"> : undefined;
        createInvestment({ userId, ...data, accountId: accId });
    };
    const updateInvestment = (id: string, data: Partial<Investment>) => {
        if (!userId) return;
        updateInvestmentMutation({ id: id as Id<"investments">, userId, ...data });
    };
    const deleteInvestment = (id: string) => {
        if (!userId) return;
        deleteInvestmentMutation({ id: id as Id<"investments">, userId });
    };

    // Debts
    const addDebt = (data: Omit<Debt, 'id'>) => {
        if (!userId) return;
        createDebt({ userId, ...data });
    };
    const updateDebt = (id: string, data: Partial<Debt>) => {
        if (!userId) return;
        updateDebtMutation({ id: id as Id<"debts">, userId, ...data });
    };
    const deleteDebt = (id: string) => {
        if (!userId) return;
        deleteDebtMutation({ id: id as Id<"debts">, userId });
    };

    // Settings
    const updateSettings = (newSettings: Partial<AppSettings>) => {
        if (!userId) return;
        updateSettingsMutation({ userId, ...newSettings });
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
