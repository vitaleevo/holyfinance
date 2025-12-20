
export enum Page {
    DASHBOARD = 'Dashboard',
    ACCOUNTS = 'Contas',
    TRANSACTIONS = 'Transações',
    BUDGET = 'Orçamento',
    GOALS = 'Metas',
    INVESTMENTS = 'Investimentos',
    DEBTS = 'Dívidas',
    REPORTS = 'Relatórios',
    NOTIFICATIONS = 'Notificações',
    FAMILY = 'Família',
    SETTINGS = 'Configurações',
    SUBSCRIPTION = 'Assinatura'
}

export interface NavItem {
    icon: string;
    label: string;
    page: Page;
}

export type TransactionType = 'income' | 'expense';

export interface AppSettings {
    theme: 'dark' | 'light';
    emailNotifications: boolean;
    privacyMode: boolean;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string; // YYYY-MM-DD
    account: string;
    status: 'paid' | 'pending' | 'completed';
}

export interface Goal {
    id: string;
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // YYYY-MM-DD
    icon: string;
    status: 'active' | 'completed';
}

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    bankName: string; // e.g. "Banco BAI"
}

export interface BudgetLimit {
    id: string;
    category: string;
    limit: number;
}

export interface Investment {
    id: string;
    ticker: string;
    name: string;
    type: 'Ações' | 'FIIs' | 'Renda Fixa' | 'Cripto' | 'Outros';
    quantity: number;
    price: number; // Current or avg price
}

export interface Debt {
    id: string;
    name: string;
    bank: string;
    totalValue: number;
    paidValue: number;
    monthlyParcel: number;
    dueDate: string; // e.g., "Day 15"
    icon: string;
}
