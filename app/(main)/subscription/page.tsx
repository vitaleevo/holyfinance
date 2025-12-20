"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type BillingCycle = 'monthly' | 'yearly' | 'biyearly';

export default function SubscriptionPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

    const isTrialing = user?.subscriptionStatus === "trialing";
    const trialEndsDate = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const daysLeft = trialEndsDate ? Math.ceil((trialEndsDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const plans = [
        {
            id: 'basic',
            name: 'Básico',
            price: { monthly: 5000, yearly: 51000, biyearly: 90000 },
            features: [
                'Gestão de 1 Conta Bancária',
                'Transações Ilimitadas (Manual)',
                'Relatórios Mensais Simples',
                'Metas Financeiras Básicas',
                'Suporte via Email'
            ]
        },
        {
            id: 'intermediate',
            name: 'Intermediário',
            price: { monthly: 12000, yearly: 122400, biyearly: 216000 },
            features: [
                'Gestão de Contas Família (3 Membros)',
                'Acompanhamento de Investimentos',
                'Relatórios em PDF Avançados',
                'Metas Compartilhadas',
                'Suporte Prioritário'
            ]
        },
        {
            id: 'advanced',
            name: 'Avançado',
            price: { monthly: 25000, yearly: 255000, biyearly: 450000 },
            features: [
                'Gestão Familiar Ilimitada',
                'Assistente Financeiro IA',
                'Sincronização entre Dispositivos',
                'Dashboard de Net Worth',
                'Gerente de Conta Dedicado'
            ]
        }
    ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val);
    };

    const upgradeSubscription = useMutation(api.subscriptions.upgradeSubscription);
    const { token } = useAuth();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        setIsProcessing(planId);
        showToast(`Processando assinatura do Plano ${planId.toUpperCase()}...`, "info");

        try {
            await upgradeSubscription({
                token: token!,
                planType: planId as any,
                billingCycle: billingCycle
            });
            showToast("Assinatura atualizada com sucesso! Seu acesso foi liberado.", "success");
            // Reload to update status in context
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            showToast(err.message || "Erro ao processar assinatura.", "error");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-4 uppercase tracking-tight text-white">Gerenciar Assinatura</h1>
                <p className="text-text-secondary">Escolha o plano que melhor se adapta às necessidades da sua família.</p>
            </div>

            {/* Current Status Banner */}
            {isTrialing && (
                <div className="mb-12 p-8 rounded-[32px] bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[120px]">verified</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/10">
                            <span className="material-symbols-outlined text-4xl">timer</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Você está no Período de Teste Grátis</h2>
                            <p className="text-text-secondary font-medium">Restam <span className="text-primary font-bold">{daysLeft} dias</span> para explorar todas as funcionalidades do HolyFinanças.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="hidden lg:block text-right">
                            <p className="text-xs font-bold text-text-secondary uppercase">Expira em</p>
                            <p className="font-black text-white">{trialEndsDate?.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <button
                            onClick={() => window.scrollTo({ top: document.getElementById('plans-grid')?.offsetTop! - 100, behavior: 'smooth' })}
                            className="w-full md:w-auto bg-primary text-background-dark font-black px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                            ESCOLHER PLANO AGORA
                        </button>
                    </div>
                </div>
            )}

            {/* Billing Switcher */}
            <div className="flex flex-col items-center mb-12">
                <div className="inline-flex p-1.5 bg-surface-dark rounded-2xl border border-surface-border">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${billingCycle === 'monthly' ? 'bg-primary text-background-dark shadow-lg' : 'text-text-secondary hover:text-white'}`}
                    >
                        MENSAL
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all relative ${billingCycle === 'yearly' ? 'bg-primary text-background-dark shadow-lg' : 'text-text-secondary hover:text-white'}`}
                    >
                        ANUAL
                        <span className="absolute -top-3 -right-2 bg-success text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">-15%</span>
                    </button>
                    <button
                        onClick={() => setBillingCycle('biyearly')}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all relative ${billingCycle === 'biyearly' ? 'bg-primary text-background-dark shadow-lg' : 'text-text-secondary hover:text-white'}`}
                    >
                        2 ANOS
                        <span className="absolute -top-3 -right-2 bg-success text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">-25%</span>
                    </button>
                </div>
                <p className="mt-4 text-xs font-bold text-success uppercase tracking-widest">Economize até 25% com planos de longo prazo</p>
            </div>

            {/* Plans Grid */}
            <div id="plans-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrent = user?.planType === plan.id;
                    return (
                        <div
                            key={plan.id}
                            className={`p-8 rounded-[40px] border-2 flex flex-col transition-all duration-300 ${plan.id === 'intermediate'
                                ? 'bg-surface-dark border-primary shadow-2xl shadow-primary/10 scale-105 z-10'
                                : 'bg-surface-dark border-white/5 opacity-80 hover:opacity-100'
                                }`}
                        >
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{plan.name}</h3>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black text-white">
                                        {formatCurrency(plan.price[billingCycle])}
                                    </span>
                                    <span className="text-text-secondary font-bold mb-1.5 text-xs uppercase">
                                        / {billingCycle === 'monthly' ? 'mês' : billingCycle === 'yearly' ? 'ano' : '2 anos'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                                        <span className="text-white/80 text-sm font-medium leading-snug">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={(isCurrent && user?.subscriptionStatus === 'active') || isProcessing !== null}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${isCurrent && user?.subscriptionStatus === 'active'
                                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                    : plan.id === 'intermediate'
                                        ? 'bg-primary hover:bg-primary-dark text-background-dark shadow-primary/20'
                                        : 'bg-white text-background-dark hover:bg-white/90'
                                    }`}
                            >
                                {isProcessing === plan.id ? (
                                    <div className="size-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                ) : isCurrent && user?.subscriptionStatus === 'active' ? (
                                    'PLANO ATUAL'
                                ) : (
                                    'SELECIONAR PLANO'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-20 pt-12 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="text-center md:text-left">
                        <span className="material-symbols-outlined text-primary text-4xl mb-4">security</span>
                        <h4 className="font-bold text-white mb-2">Segurança Bancária</h4>
                        <p className="text-sm text-text-secondary">Seus dados são criptografados com o mesmo nível de segurança dos maiores bancos.</p>
                    </div>
                    <div className="text-center md:text-left">
                        <span className="material-symbols-outlined text-primary text-4xl mb-4">cancel</span>
                        <h4 className="font-bold text-white mb-2">Cancelamento Fácil</h4>
                        <p className="text-sm text-text-secondary">Cancele sua assinatura a qualquer momento com apenas um clique, sem burocracia.</p>
                    </div>
                    <div className="text-center md:text-left">
                        <span className="material-symbols-outlined text-primary text-4xl mb-4">support_agent</span>
                        <h4 className="font-bold text-white mb-2">Suporte Local</h4>
                        <p className="text-sm text-text-secondary">Atendimento especializado focado no mercado e realidade financeira de Angola.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
