"use client";

import React from 'react';

export default function AdminDashboard() {
    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Bem-vindo, Comandante</h1>
                <p className="text-slate-400 font-medium">Aqui está o pulso atual da plataforma HolyFinance.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total de Usuários', value: '1.284', trend: '+12%', icon: 'group', color: 'indigo' },
                    { label: 'Assinantes Ativos', value: '432', trend: '+5%', icon: 'workspace_premium', color: 'emerald' },
                    { label: 'Faturamento Mensal', value: 'Kz 5.120.000', trend: '+18%', icon: 'payments', color: 'amber' },
                    { label: 'Tickets de Suporte', value: '14', trend: '-2', icon: 'support_agent', color: 'rose' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0e131b] border border-white/5 p-6 rounded-3xl hover-premium">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`size-12 rounded-2xl bg-${stat.color}-600/10 flex items-center justify-center text-${stat.color}-500 shadow-lg shadow-${stat.color}-500/5`}>
                                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">{stat.label}</h3>
                        <p className="text-3xl font-black text-white mt-1 tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Requests */}
                <div className="lg:col-span-2 bg-[#0e131b] border border-white/5 rounded-[40px] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Pedidos de Registro (Pendentes)</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Valide transferências Multicaixa Express para liberar acessos.</p>
                        </div>
                        <button className="text-indigo-400 font-black text-xs uppercase tracking-widest hover:underline">Ver Todos</button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {[
                            { name: 'Antonio Pedro', email: 'antonio@email.ao', plan: 'Advanced', price: 'Kz 25.000', date: 'Há 2 horas' },
                            { name: 'Maria Silva', email: 'maria@gmail.com', plan: 'Intermediate', price: 'Kz 12.000', date: 'Há 5 horas' },
                            { name: 'Joaquim Lucas', email: 'j.lucas@outlook.com', plan: 'Basic', price: 'Kz 5.000', date: 'Há 1 dia' },
                        ].map((req, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 rounded-3xl border border-white/5 hover:bg-white/5 transition-all group">
                                <div className="size-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-black">
                                    {req.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold truncate">{req.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{req.email}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{req.plan}</p>
                                    <p className="text-sm font-bold text-white">{req.price}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">APROVAR</button>
                                    <button className="size-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / System Health */}
                <div className="flex flex-col gap-8">
                    <div className="bg-[#0e131b] border border-white/5 rounded-[40px] p-8 flex-1">
                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Status do Core</h2>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Banco de Dados (Convex)</span>
                                    <span className="text-emerald-500">Otimizado</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-emerald-500"></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                    <span className="text-slate-400">API Gateway (Edges)</span>
                                    <span className="text-emerald-500">99.9% Uptime</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[99%] bg-emerald-500"></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Armazenamento</span>
                                    <span className="text-amber-500">62% Carga</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[62%] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <span className="material-symbols-outlined text-[160px]">auto_awesome</span>
                        </div>
                        <h3 className="text-xl font-black mb-2 leading-tight uppercase tracking-tight">Apoio à Decisão</h3>
                        <p className="text-sm font-bold text-indigo-100 mb-6 leading-relaxed">
                            O faturamento subiu 18% este mês. Recomendamos criar um plano "Premium Family" com limites customizáveis.
                        </p>
                        <button className="bg-white text-indigo-600 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Analizar Tendências</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
