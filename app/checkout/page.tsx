"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '../context/ToastContext';
import { formatError } from '../utils/error';

function CheckoutForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const payAndRegister = useMutation(api.subscriptions.payAndRegister);

    const planId = searchParams.get('plan') || 'basic';
    const cycle = (searchParams.get('cycle') || 'monthly') as any;

    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mcx' | 'stripe'>('mcx');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '', // For Multicaixa Express
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === 'mcx' && !formData.phone) {
            showToast("Por favor, insira o número de telemóvel associado ao MCX.", "error");
            return;
        }

        setIsLoading(true);

        try {
            const { token } = await payAndRegister({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                planType: planId as any,
                billingCycle: cycle,
                paymentMethod: paymentMethod,
                paymentPhone: paymentMethod === 'mcx' ? formData.phone : undefined,
            });

            localStorage.setItem('holyfinancas_token', token);

            if (paymentMethod === 'mcx') {
                const amount = prices[planId]?.[cycle] || 0;
                const message = encodeURIComponent(
                    `*NOVA ASSINATURA MCX*\n\n` +
                    `Olá! Acabei de realizar o pagamento para o HolyFinanças.\n\n` +
                    `👤 *Nome:* ${formData.name}\n` +
                    `📧 *Email:* ${formData.email}\n` +
                    `📱 *MCX:* ${formData.phone}\n` +
                    `💳 *Plano:* ${planNames[planId]} (${cycle === 'monthly' ? 'Mensal' : cycle === 'yearly' ? 'Anual' : '2 Anos'})\n` +
                    `💰 *Valor:* ${formatCurrency(amount)}\n\n` +
                    `Por favor, confirmem o meu acesso.`
                );

                showToast("Pedido criado! Redirecionando para informar via WhatsApp...", "success");

                // Small delay to let the toast be seen
                setTimeout(() => {
                    window.location.href = `https://wa.me/244935348327?text=${message}`;
                }, 2000);
            } else {
                showToast("Pagamento confirmado! Bem-vindo.", "success");
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            showToast(formatError(err), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const planNames: Record<string, string> = {
        basic: 'Básico',
        intermediate: 'Intermediário',
        advanced: 'Avançado'
    };

    const prices: Record<string, Record<string, number>> = {
        basic: { monthly: 5000, yearly: 51000, biyearly: 90000 },
        intermediate: { monthly: 12000, yearly: 122400, biyearly: 216000 },
        advanced: { monthly: 25000, yearly: 255000, biyearly: 450000 },
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* Left side: Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
                <div className="max-w-md w-full">
                    <div className="mb-10">
                        <img src="/logo-full-light-bg.png" alt="HolyFinanças" className="h-10 mb-8" />
                        <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-2">Finalizar Assinatura</h1>
                        <p className="text-zinc-500 font-medium font-outfit">Crie sua conta para começar a usar o sistema agora mesmo.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('mcx')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${paymentMethod === 'mcx' ? 'border-primary-dark bg-primary/5 text-primary-dark shadow-md' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">smartphone</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">MCX Express</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('stripe')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${paymentMethod === 'stripe' ? 'border-primary-dark bg-primary/5 text-primary-dark shadow-md' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">credit_card</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Cartão / Stripe</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Nome Completo</label>
                            <input
                                required
                                type="text"
                                placeholder="Seu nome"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:border-primary-dark focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Email Profissional</label>
                            <input
                                required
                                type="email"
                                placeholder="email@exemplo.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:border-primary-dark focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
                            />
                        </div>

                        {paymentMethod === 'mcx' && (
                            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black uppercase text-primary-dark tracking-widest px-1">Telemóvel MCX Express</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="923 000 000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-14 px-5 rounded-2xl bg-primary/5 border border-primary/20 text-zinc-900 focus:outline-none focus:border-primary-dark focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold"
                                />
                                <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1 px-1">Enviaremos um pedido de confirmação ao seu telemóvel.</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Defina sua Senha</label>
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:border-primary-dark focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
                            />
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                            <button
                                disabled={isLoading}
                                className="w-full h-16 bg-primary-dark text-white rounded-2xl font-black text-lg uppercase tracking-tight hover:bg-black transition-all shadow-xl shadow-primary/10 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="size-6 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                                ) : (
                                    <>
                                        <span>CONFIRMAR E PAGAR {formatCurrency(prices[planId]?.[cycle] || 0)}</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-zinc-400 text-center font-bold px-4 uppercase leading-relaxed">
                                Ao clicar em confirmar, você aceita nossos termos de uso e política de privacidade. O pagamento é processado de forma segura.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right side: Resume */}
            <div className="hidden lg:flex w-1/3 bg-zinc-50 border-l border-zinc-100 p-20 flex-col justify-center">
                <div className="mb-8">
                    <span className="bg-primary/10 text-primary-dark text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest">Resumo do Pedido</span>
                </div>

                <h2 className="text-5xl font-black text-zinc-900 tracking-tight leading-none mb-12">Plano {planNames[planId]}</h2>

                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-zinc-200">
                        <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Ciclo</span>
                        <span className="text-zinc-900 font-black uppercase text-sm tracking-widest">{cycle === 'monthly' ? 'Mensal' : cycle === 'yearly' ? 'Anual' : '2 Anos'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-zinc-200">
                        <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Valor do Plano</span>
                        <span className="text-zinc-900 font-black text-xl tracking-tight">{formatCurrency(prices[planId]?.[cycle] || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-zinc-900 font-black uppercase text-sm tracking-wider">Total a Pagar</span>
                        <span className="text-primary-dark font-black text-4xl tracking-tighter">
                            {formatCurrency(prices[planId]?.[cycle] || 0)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CheckoutForm />
        </Suspense>
    );
}
