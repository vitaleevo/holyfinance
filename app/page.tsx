"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';

type BillingCycle = 'monthly' | 'yearly' | 'biyearly';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

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
      ],
      recommended: false
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
      ],
      recommended: true
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
      ],
      recommended: false
    }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-noto overflow-x-hidden w-full selection:bg-primary/30">
      {/* Header / Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-xl font-black tracking-tighter uppercase text-zinc-900">HolyFinanças</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Preços</a>
            <a href="#security" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Segurança</a>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-full transition-all">
                Ir para Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Entrar</Link>
                <Link href="/register" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-[0_10px_20px_rgba(19,236,109,0.2)]">
                  Teste Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] delay-1000 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center font-display animate-reveal">
          <div className="inline-flex items-center gap-2 bg-zinc-100 rounded-full px-4 py-2 text-[10px] font-black tracking-[0.2em] mb-8 text-zinc-900 shadow-sm border border-zinc-200">
            <span className="material-symbols-outlined text-xs animate-pulse">stars</span>
            <span>7 DIAS DE TESTE GRÁTIS EM QUALQUER PLANO</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-zinc-900">
            DOMINE SUAS FINANÇAS COM <span className="text-primary-dark">ELEGÂNCIA</span> E INTELIGÊNCIA.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            O sistema definitivo para quem busca controle total, gestão familiar e investimentos em uma interface luxuosa e intuitiva.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black text-lg px-10 py-5 rounded-2xl transition-all shadow-[0_15px_30px_rgba(19,236,109,0.3)] hover-premium flex items-center justify-center gap-2">
              <span>Começar Teste de 7 Dias</span>
              <span className="material-symbols-outlined text-white">bolt</span>
            </Link>
            <a href="#pricing" className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-lg px-10 py-5 rounded-2xl transition-all border border-zinc-200 hover:bg-zinc-200 active:scale-95">
              Ver Planos
            </a>
          </div>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className="max-w-7xl mx-auto mt-24 relative group px-4 animate-reveal delay-200">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent blur-2xl group-hover:from-primary/20 transition-all"></div>
          <div className="relative bg-zinc-900 rounded-[40px] p-3 shadow-2xl overflow-hidden ring-1 ring-zinc-100 animate-float">
            <img src="/hero-mockup.png" alt="Dashboard Preview" className="w-full rounded-[30px]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-zinc-50 font-display">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 text-zinc-900">
            <h2 className="text-4xl md:text-5xl font-black mb-4">A SOLUÇÃO COMPLETA PARA ANGOLA</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Gerencie seus Kwanzas com as melhores ferramentas do mercado.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'account_balance', title: 'Multibanco Pronto', desc: 'Controle todas as suas contas dos bancos angolanos em um só lugar de forma manual e organizada.' },
              { icon: 'family_restroom', title: 'Gestão Familiar', desc: 'Conecte sua família, compartilhe contas e tome decisões em conjunto com diferentes permissões.' },
              { icon: 'trending_up', title: 'Investimentos', desc: 'Acompanhe suas ações, criptos e fundos com gráficos em tempo real e análise de performance.' },
              { icon: 'target', title: 'Metas e Sonhos', desc: 'Defina objetivos financeiros e veja seu progresso com lembretes e automações por IA.' }
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-zinc-200 hover-premium group shadow-sm delay-100">
                <span className="material-symbols-outlined text-4xl text-primary mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform">{item.icon}</span>
                <h3 className="text-xl font-bold mb-4 text-zinc-900">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-8 text-zinc-900 uppercase">Escolha o seu plano</h2>

            {/* Billing Switcher */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-2xl mb-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                MENSAL
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                ANUAL
                <span className="absolute -top-3 -right-2 bg-success text-white text-[10px] px-2 py-0.5 rounded-full font-black">-15%</span>
              </button>
              <button
                onClick={() => setBillingCycle('biyearly')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${billingCycle === 'biyearly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                2 ANOS
                <span className="absolute -top-3 -right-2 bg-success text-white text-[10px] px-2 py-0.5 rounded-full font-black">-25%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, ridx) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-[40px] bg-white border-2 flex flex-col hover-premium animate-reveal ${plan.recommended ? 'border-primary shadow-2xl shadow-primary/10' : 'border-zinc-100'
                  }`}
                style={{ animationDelay: `${ridx * 100}ms` }}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-12 bg-primary text-white font-black px-4 py-1.5 rounded-b-xl text-[10px] uppercase tracking-widest">
                    RECOMENDADO
                  </div>
                )}

                <h3 className="text-2xl font-black mb-2 text-zinc-900">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-black text-zinc-900">
                    {formatCurrency(plan.price[billingCycle])}
                  </span>
                  <span className="text-zinc-500 font-bold mb-1.5 text-sm uppercase">
                    / {billingCycle === 'monthly' ? 'mês' : billingCycle === 'yearly' ? 'ano' : '2 anos'}
                  </span>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                      <span className="text-zinc-600 text-sm font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/checkout?plan=${plan.id}&cycle=${billingCycle}`}
                    className={`block w-full text-center font-black text-lg py-5 rounded-2xl transition-all shadow-lg hover-premium ${plan.recommended
                      ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                      : 'bg-zinc-900 hover:bg-black text-white'
                      }`}
                  >
                    ASSINAR AGORA
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center font-bold text-xs py-3 text-zinc-400 hover:text-primary transition-colors uppercase tracking-widest hover:translate-x-1"
                  >
                    Ou testar 7 dias grátis →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
              <img src="/logo-icon.png" alt="Logo" className="h-10 w-auto" />
              <span className="text-xl font-black tracking-tighter uppercase text-zinc-900">HolyFinanças</span>
            </div>
            <p className="text-zinc-500 max-w-sm font-medium">Liderando a revolução da educação financeira e gestão de patrimônio em Angola.</p>
          </div>
          <div className="text-zinc-900">
            <h4 className="font-bold mb-6">HolyFinanças</h4>
            <div className="flex flex-col gap-4 text-zinc-500 font-medium">
              <Link href="/login" className="hover:text-primary transition-colors">Entrar</Link>
              <Link href="/register" className="hover:text-primary transition-colors">Criar Conta</Link>
              <a href="#features" className="hover:text-primary transition-colors">Sobre Nós</a>
            </div>
          </div>
          <div className="text-zinc-900">
            <h4 className="font-bold mb-6">Suporte</h4>
            <div className="flex flex-col gap-4 text-zinc-500 font-medium">
              <a href="#" className="hover:text-primary transition-colors">Termos e Condições</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Ajuda</a>
            </div>
          </div>
        </div>
        <div className="text-center mt-20 pt-8 border-t border-zinc-100 text-xs text-zinc-400 font-bold uppercase tracking-widest">
          © 2024 HolyFinanças Angola. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
