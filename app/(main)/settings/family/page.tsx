"use client";

import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api"; // Adjust import path
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function FamilySettingsPage() {
    const { user, token } = useAuth();
    const router = useRouter();

    // Fetch family data
    const familyData = useQuery(api.families.get, { token: token ?? undefined });

    // Mutations
    const createFamily = useMutation(api.families.create);
    const joinFamily = useMutation(api.families.join);
    const updateMemberRole = useMutation(api.families.updateMemberRole);

    // Local State
    const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
    const [familyName, setFamilyName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // --- Handlers ---

    const handleCreateFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await createFamily({
                name: familyName,
                token: token ?? undefined
            });
            // Convex automatically updates the query
            setView('menu');
        } catch (err: any) {
            setError(err.message || "Erro ao criar família");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await joinFamily({
                code: inviteCode,
                token: token ?? undefined
            });
            setView('menu');
        } catch (err: any) {
            setError(err.message || "Erro ao entrar na família. Verifique o código.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---

    // 1. Loading State
    if (familyData === undefined) {
        return <div className="p-10 flex justify-center text-text-secondary">Carregando informações da família...</div>;
    }

    // 2. User HAS a Family -> Show Dashboard
    if (familyData) {
        return (
            <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 md:p-0">
                <header>
                    <button onClick={() => router.back()} className="text-sm text-text-secondary hover:text-white mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary">diversity_3</span>
                        {familyData?.family?.name}
                    </h1>
                    <p className="text-text-secondary">Gerencie os membros da sua família financeira.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Invite Card */}
                    <div className="md:col-span-1 bg-surface-dark border border-surface-border rounded-2xl p-6 flex flex-col gap-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <span className="material-symbols-outlined">qr_code_2</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Código de Convite</h3>
                            <p className="text-text-secondary text-sm">Compartilhe com quem vai entrar na família.</p>
                        </div>
                        <div className="bg-background-dark p-4 rounded-lg border border-dashed border-surface-border flex items-center justify-between group cursor-pointer" onClick={() => navigator.clipboard.writeText(familyData?.family?.code || "")}>
                            <span className="text-2xl font-mono font-bold text-primary tracking-widest">{familyData?.family?.code}</span>
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">content_copy</span>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="md:col-span-2 bg-surface-dark border border-surface-border rounded-2xl p-6">
                        <h3 className="text-white font-bold text-lg mb-2">Membros ({familyData?.members?.length})</h3>
                        <p className="text-xs text-text-secondary mb-4">
                            <span className="text-primary">Parceiro:</span> Acesso total (cônjuge) | <span className="text-blue-400">Membro:</span> Acesso limitado (filhos)
                        </p>
                        <div className="flex flex-col gap-3">
                            {familyData?.members?.map((member: any) => {
                                const isCurrentUser = member.email === user?.email;
                                const currentUserIsAdmin = familyData?.members?.find((m: any) => m.email === user?.email)?.role === 'admin';

                                return (
                                    <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-background-dark/50 border border-surface-border/50">
                                        <div className="size-10 rounded-full bg-surface-border overflow-hidden">
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {member.name}
                                                {isCurrentUser && <span className="text-xs text-text-secondary ml-1">(Você)</span>}
                                            </p>
                                            <p className={`text-xs capitalize ${member.role === 'admin' ? 'text-yellow-500' : member.role === 'partner' ? 'text-primary' : 'text-blue-400'}`}>
                                                {member.role === 'admin' ? '👑 Administrador' : member.role === 'partner' ? '💚 Parceiro (Acesso Total)' : '👤 Membro (Acesso Limitado)'}
                                            </p>
                                        </div>

                                        {/* Role changer - only for admin, not for self */}
                                        {currentUserIsAdmin && !isCurrentUser && member.role !== 'admin' && (
                                            <select
                                                value={member.role || 'member'}
                                                onChange={async (e) => {
                                                    try {
                                                        await updateMemberRole({
                                                            memberId: member.id,
                                                            newRole: e.target.value,
                                                            token: token ?? undefined
                                                        });
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }}
                                                className="bg-background-dark border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:border-primary outline-none"
                                            >
                                                <option value="partner">Parceiro</option>
                                                <option value="member">Membro</option>
                                            </select>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. User HAS NO Family -> Show Create/Join Options
    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 md:p-0">
            <header>
                <button onClick={() => router.back()} className="text-sm text-text-secondary hover:text-white mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar
                </button>
                <h1 className="text-3xl font-black text-white tracking-tight">Plano Familiar</h1>
                <p className="text-text-secondary">Junte suas finanças com quem você ama. Compartilhe contas, metas e sonhos.</p>
            </header>

            {view === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <button onClick={() => setView('create')} className="bg-surface-dark border border-surface-border hover:border-primary p-8 rounded-2xl text-left transition-all group">
                        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">add_home</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Criar nova Família</h3>
                        <p className="text-text-secondary">Comece um novo grupo. Você será o administrador e poderá convidar outros membros.</p>
                    </button>

                    <button onClick={() => setView('join')} className="bg-surface-dark border border-surface-border hover:border-primary p-8 rounded-2xl text-left transition-all group">
                        <div className="size-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">meeting_room</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Entrar em uma Família</h3>
                        <p className="text-text-secondary">Já tem um código de convite? Digite-o aqui para sincronizar seus dados.</p>
                    </button>
                </div>
            )}

            {view === 'create' && (
                <div className="max-w-md mx-auto w-full bg-surface-dark border border-surface-border rounded-2xl p-8 mt-8">
                    <h2 className="text-xl font-bold text-white mb-4">Criar Família</h2>
                    <form onSubmit={handleCreateFamily} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase">Nome da Família</label>
                            <input
                                type="text"
                                value={familyName}
                                onChange={e => setFamilyName(e.target.value)}
                                placeholder="Ex: Família Silva"
                                className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => setView('menu')} className="flex-1 px-4 py-2 rounded-lg border border-surface-border text-text-secondary hover:text-white transition-colors">Cancelar</button>
                            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
                                {loading ? 'Criando...' : 'Criar Família'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'join' && (
                <div className="max-w-md mx-auto w-full bg-surface-dark border border-surface-border rounded-2xl p-8 mt-8">
                    <h2 className="text-xl font-bold text-white mb-4">Entrar na Família</h2>
                    <form onSubmit={handleJoinFamily} className="flex flex-col gap-4">

                        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-sm text-blue-200 mb-2">
                            <p>⚠️ Atenção: Ao entrar, todos os seus dados atuais (contas, gastos, metas) serão transferidos para esta família.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase">Código de Convite</label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="Ex: ABCD-1234"
                                className="bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors font-mono tracking-widest uppercase"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => setView('menu')} className="flex-1 px-4 py-2 rounded-lg border border-surface-border text-text-secondary hover:text-white transition-colors">Cancelar</button>
                            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
                                {loading ? 'Entrando...' : 'Entrar Agora'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
