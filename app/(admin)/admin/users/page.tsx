"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function AdminUsersPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
    const [search, setSearch] = useState("");

    const users = useQuery(api.admin.listAllUsers, { token: token ?? undefined });
    const approveUser = useMutation(api.subscriptions.approveUser);

    // Filtering
    const pendingUsers = users?.filter(u => u.subscriptionStatus === 'pending_verification') || [];
    const filteredAll = users?.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleApprove = async (userId: any) => {
        if (!token) return;
        try {
            await approveUser({ adminToken: token, targetUserId: userId });
            showToast("Usuário aprovado com sucesso!", "success");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-500';
            case 'trialing': return 'bg-indigo-500/10 text-indigo-500';
            case 'pending_verification': return 'bg-amber-500/10 text-amber-500';
            case 'expired': return 'bg-rose-500/10 text-rose-500';
            default: return 'bg-slate-500/10 text-slate-500';
        }
    };

    const translateStatus = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'trialing': return 'Em Teste';
            case 'pending_verification': return 'Pendente (Express)';
            case 'expired': return 'Expirado';
            default: return status;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Gestão de Usuários</h1>
                    <p className="text-slate-500 font-medium">Controle total sobre registros e permissões.</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0e131b] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-all font-bold"
                    />
                </div>
            </header>

            <div className="flex flex-col bg-[#0e131b] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-[#0a0e14]/50 p-2">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Pendentes de Verificação
                        {pendingUsers.length > 0 && (
                            <span className="bg-amber-500 text-black size-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Todos os Usuários
                    </button>
                </div>

                <div className="p-2 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <th className="px-6 py-4 font-black">Usuário</th>
                                <th className="px-6 py-4 font-black">Status</th>
                                <th className="px-6 py-4 font-black">Plano</th>
                                <th className="px-6 py-4 font-black">Criado em</th>
                                <th className="px-6 py-4 font-black text-right pr-10">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(activeTab === 'pending' ? pendingUsers : filteredAll).map((u) => (
                                <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-black">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{u.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(u.subscriptionStatus)}`}>
                                            {translateStatus(u.subscriptionStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white uppercase tracking-tighter">{u.planType || 'Free'}</span>
                                            {u.isSuperAdmin && <span className="text-[9px] text-indigo-500 font-black uppercase mt-0.5 animate-pulse">Root Access</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-slate-500 text-xs font-bold">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-6 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {u.subscriptionStatus === 'pending_verification' && (
                                                <button
                                                    onClick={() => handleApprove(u.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all"
                                                >
                                                    Aprovar Pagamento
                                                </button>
                                            )}
                                            <button className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            {!u.isSuperAdmin && (
                                                <button className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                                    <span className="material-symbols-outlined text-lg">no_accounts</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {(activeTab === 'pending' ? pendingUsers : filteredAll).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-600">
                                            <span className="material-symbols-outlined text-5xl">person_search</span>
                                            <p className="font-black uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
