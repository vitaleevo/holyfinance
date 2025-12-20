"use client";

import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from 'next/navigation';
import { Id } from "../../../convex/_generated/dataModel";
import { checkLimit, getPlanLimits } from '../../utils/plans';

// Types
interface FamilyMember {
    id: Id<"users">;
    name: string;
    email: string;
    role: string;
    avatarStorageId?: Id<"_storage">;
    familyRelationship?: string;
}

interface FamilyData {
    family: {
        _id: Id<"families">;
        name: string;
        code: string;
        createdAt: string;
    } | null;
    members: FamilyMember[];
}

export default function FamilyPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    // Fetch family data
    const familyData = useQuery(api.families.get, { token: token ?? undefined }) as FamilyData | null | undefined;

    // Mutations
    const createFamily = useMutation(api.families.create);
    const joinFamily = useMutation(api.families.join);
    const updateMemberRole = useMutation(api.families.updateMemberRole);
    const removeMember = useMutation(api.families.removeMember);
    const leaveFamily = useMutation(api.families.leave);
    const transferAdmin = useMutation(api.families.transferAdmin);

    // Local State
    const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
    const [familyName, setFamilyName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState<Id<"users"> | null>(null);

    // --- Handlers ---

    const handleCreateFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createFamily({
                name: familyName,
                token: token ?? undefined
            });
            showToast("Família criada com sucesso!", "success");
            setView('menu');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao criar família";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await joinFamily({
                code: inviteCode,
                token: token ?? undefined
            });
            showToast("Você entrou na família!", "success");
            setView('menu');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao entrar na família. Verifique o código.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(familyData?.family?.code || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveMember = async (memberId: Id<"users">) => {
        setLoading(true);
        try {
            await removeMember({ memberId, token: token ?? undefined });
            showToast("Membro removido com sucesso!", "success");
            setConfirmRemove(null);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao remover membro";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveFamily = async () => {
        setLoading(true);
        try {
            await leaveFamily({ token: token ?? undefined });
            showToast("Você saiu da família.", "success");
            setConfirmLeave(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao sair da família";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTransferAdmin = async (newAdminId: Id<"users">) => {
        setLoading(true);
        try {
            await transferAdmin({ newAdminId, token: token ?? undefined });
            showToast("Administração transferida!", "success");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao transferir administração";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: Id<"users">, newRole: string) => {
        try {
            await updateMemberRole({
                memberId,
                newRole,
                token: token ?? undefined
            });
            showToast("Função do membro atualizada!", "success");
        } catch (err: any) {
            showToast(err.message || "Erro ao atualizar função", "error");
        }
    };

    const currentUserMember = familyData?.members?.find((m: FamilyMember) => m.email === user?.email);
    const isAdmin = currentUserMember?.role === 'admin';

    // --- Render Logic ---

    // 1. Loading State
    if (familyData === undefined) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-text-secondary">Carregando informações da família...</p>
                </div>
            </div>
        );
    }


    // 2. User HAS a Family -> Show Dashboard
    if (familyData) {
        return (
            <div className="flex flex-col gap-8">

                {/* Header */}
                <header className="relative">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-600/10 border border-primary/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-primary">diversity_3</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                    {familyData?.family?.name}
                                </h1>
                                <p className="text-text-secondary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">group</span>
                                    {familyData?.members?.length} {familyData?.members?.length === 1 ? 'membro' : 'membros'}
                                </p>
                            </div>
                        </div>

                        {/* Leave Family Button */}
                        <button
                            onClick={() => setConfirmLeave(true)}
                            className="self-start md:self-center px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sair da Família
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invite Card - Only for Admin/Partner */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {(() => {
                            // Logic to determine limits
                            // Assuming current user view, we need to know who is admin to check limits
                            // But usually, limits are attached to the family creator/admin. 
                            // For simplicity, we can trust the backend error, BUT for UI we want to show it proactively.
                            // We will use the dashboard logic: find admin in members list.
                            const adminMember = familyData?.members?.find(m => m.role === 'admin');
                            // We can't know the plan of the admin easily without fetching it, 
                            // BUT 'familyData' members list doesn't have plan info.
                            // We can rely on the fact that if we are the admin, we know our plan.
                            // If we are not admin, maybe we shouldn't show the limit bar or use a generic one?
                            // Let's assume for now we just show a generic "Full" state if 5 members, 
                            // OR if we are admin check our own plan.

                            const isAdmin = user?.role === 'admin';
                            const maxMembers = isAdmin
                                ? getPlanLimits(user?.planType).maxFamilyMembers
                                : 5; // Fallback visual limit for non-admins (or fetch real limit if needed)

                            const isFull = (familyData?.members?.length || 0) >= maxMembers;

                            return (
                                <>
                                    {familyData?.family?.code !== "******" ? (
                                        <div className="bg-gradient-to-br from-surface-dark to-background-dark border border-surface-border rounded-2xl p-6 flex flex-col gap-5 h-full">

                                            {isFull ? (
                                                <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 mb-2">
                                                    <span className="material-symbols-outlined text-danger">group_add</span>
                                                    <div className="flex-1">
                                                        <p className="text-danger font-bold text-sm">Família Cheia</p>
                                                        <p className="text-danger/70 text-xs">Limite do plano atingido.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <span className="material-symbols-outlined">qr_code_2</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white font-bold text-lg">Código de Convite</h3>
                                                            <p className="text-text-secondary text-sm">Compartilhe para adicionar membros</p>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="relative bg-background-dark p-5 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 cursor-pointer transition-all group"
                                                        onClick={handleCopyCode}
                                                    >
                                                        <div className="flex items-center justify-center gap-3">
                                                            <span className="text-3xl font-mono font-black text-primary tracking-[0.3em]">
                                                                {familyData?.family?.code}
                                                            </span>
                                                            <span className={`material-symbols-outlined transition-all ${copied ? 'text-emerald-400 scale-110' : 'text-text-secondary group-hover:text-white'}`}>
                                                                {copied ? 'check_circle' : 'content_copy'}
                                                            </span>
                                                        </div>
                                                        <p className="text-center text-xs text-text-secondary mt-3">
                                                            {copied ? '✓ Copiado!' : 'Clique para copiar'}
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Plan Info */}
                                            <div className="mt-auto pt-4 border-t border-surface-border/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Membros</p>
                                                    <span className={`text-xs font-bold ${isFull ? 'text-danger' : 'text-primary'}`}>{familyData?.members?.length} / {maxMembers}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-background-dark rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-danger' : 'bg-primary'}`}
                                                        style={{ width: `${Math.min(100, (familyData?.members?.length / maxMembers) * 100)}%` }}
                                                    />
                                                </div>
                                                {isFull && isAdmin && (
                                                    <a href="/subscription" className="block mt-4 text-center text-xs font-bold text-primary hover:underline">
                                                        Aumentar Limite →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-surface-dark/50 border border-surface-border/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 h-full border-dashed">
                                            <div className="size-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                                <span className="material-symbols-outlined">lock</span>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Acesso Limitado</h4>
                                                <p className="text-text-secondary text-xs mt-1">
                                                    Apenas Administradores e Parceiros podem ver e compartilhar o código de convite.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* Role Legend Card */}
                        <div className="bg-surface-dark/30 border border-surface-border/30 rounded-2xl p-6">
                            <p className="text-xs text-text-secondary mb-4 font-medium uppercase tracking-wider">Níveis de Acesso</p>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                                    <div>
                                        <p className="text-yellow-400 font-bold leading-none">Admin</p>
                                        <p className="text-text-secondary text-[10px] mt-1">Gestão total da família</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                    <div>
                                        <p className="text-primary font-bold leading-none">Parceiro</p>
                                        <p className="text-text-secondary text-[10px] mt-1">Acesso e convite</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
                                    <div>
                                        <p className="text-blue-400 font-bold leading-none">Membro</p>
                                        <p className="text-text-secondary text-[10px] mt-1">Apenas visualização</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="lg:col-span-2 bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-surface-border/50">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">groups</span>
                                Membros da Família
                            </h3>
                        </div>

                        <div className="divide-y divide-surface-border/30">
                            {familyData?.members?.map((member: FamilyMember) => {
                                const isCurrentUser = member.email === user?.email;
                                const memberRoleColor = member.role === 'admin' ? 'yellow' : member.role === 'partner' ? 'emerald' : 'blue';

                                return (
                                    <div
                                        key={member.id}
                                        className={`flex items-center gap-4 p-5 transition-colors ${isCurrentUser ? 'bg-primary/5' : 'hover:bg-surface-border/10'}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`size-12 rounded-xl bg-gradient-to-br from-${memberRoleColor}-500/20 to-${memberRoleColor}-600/10 border border-${memberRoleColor}-500/30 flex items-center justify-center`}>
                                            <span className={`text-lg font-bold text-${memberRoleColor}-400`}>
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold flex items-center gap-2 truncate">
                                                {member.name}
                                                {isCurrentUser && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                                        Você
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-text-secondary truncate">{member.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-2 h-2 rounded-full ${member.role === 'admin' ? 'bg-yellow-500' : member.role === 'partner' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                                                <span className={`text-xs font-medium capitalize ${member.role === 'admin' ? 'text-yellow-400' : member.role === 'partner' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                    {member.role === 'admin' ? '👑 Administrador' : member.role === 'partner' ? '💚 Parceiro' : '👤 Membro'}
                                                </span>
                                                {member.familyRelationship && (
                                                    <span className="text-xs text-text-secondary">
                                                        • {member.familyRelationship}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions for Admin */}
                                        {isAdmin && !isCurrentUser && member.role !== 'admin' && (
                                            <div className="flex items-center gap-2">
                                                {/* Role Selector */}
                                                <select
                                                    value={member.role || 'member'}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className="bg-background-dark border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none cursor-pointer hover:border-surface-border/80 transition-colors"
                                                >
                                                    <option value="partner">Parceiro</option>
                                                    <option value="member">Membro</option>
                                                </select>

                                                {/* Transfer Admin */}
                                                <button
                                                    onClick={() => handleTransferAdmin(member.id)}
                                                    title="Transferir Admin"
                                                    className="p-2 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                                </button>

                                                {/* Remove */}
                                                <button
                                                    onClick={() => setConfirmRemove(member.id)}
                                                    title="Remover Membro"
                                                    className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">person_remove</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Confirm Leave Modal */}
                {confirmLeave && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-red-400">warning</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Sair da Família?</h3>
                                    <p className="text-text-secondary text-sm">Esta ação não pode ser desfeita.</p>
                                </div>
                            </div>

                            <p className="text-text-secondary mb-6">
                                Ao sair, você perderá acesso aos dados compartilhados da família.
                                {isAdmin && " Como administrador, a função será transferida para outro membro se possível."}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmLeave(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-surface-border text-text-secondary hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleLeaveFamily}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saindo...' : 'Sim, Sair'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Remove Modal */}
                {confirmRemove && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-red-400">person_remove</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Remover Membro?</h3>
                                    <p className="text-text-secondary text-sm">O membro perderá acesso à família.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmRemove(null)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-surface-border text-text-secondary hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => confirmRemove && handleRemoveMember(confirmRemove)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Removendo...' : 'Sim, Remover'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. User HAS NO Family -> Show Create/Join Options
    return (
        <div className="flex flex-col gap-8">

            <header>
                <div className="flex items-center gap-4 mb-2">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-600/10 border border-primary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">family_restroom</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Plano Familiar</h1>
                        <p className="text-text-secondary">Junte suas finanças com quem você ama</p>
                    </div>
                </div>
            </header>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: 'sync', title: 'Dados Sincronizados', desc: 'Todos veem as mesmas informações em tempo real' },
                    { icon: 'savings', title: 'Metas Compartilhadas', desc: 'Criem e acompanhem objetivos juntos' },
                    { icon: 'shield', title: 'Controle de Acesso', desc: 'Defina quem pode ver e editar' }
                ].map((benefit, i) => (
                    <div key={i} className="bg-surface-dark/50 border border-surface-border/50 rounded-xl p-4 flex items-start gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined">{benefit.icon}</span>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm">{benefit.title}</h4>
                            <p className="text-text-secondary text-xs">{benefit.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {view === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <button
                        onClick={() => setView('create')}
                        className="bg-gradient-to-br from-surface-dark to-background-dark border border-surface-border hover:border-primary/50 p-8 rounded-2xl text-left transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-600/10 border border-primary/30 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">add_home</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Criar nova Família</h3>
                            <p className="text-text-secondary">
                                Comece um novo grupo financeiro. Você será o administrador e poderá convidar outras pessoas.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                                <span>Começar agora</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setView('join')}
                        className="bg-gradient-to-br from-surface-dark to-background-dark border border-surface-border hover:border-blue-500/50 p-8 rounded-2xl text-left transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">meeting_room</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Entrar em uma Família</h3>
                            <p className="text-text-secondary">
                                Já tem um código de convite? Digite-o para sincronizar suas finanças com o grupo.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium">
                                <span>Usar código</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {view === 'create' && (
                <div className="max-w-md mx-auto w-full bg-gradient-to-br from-surface-dark to-background-dark border border-surface-border rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">add_home</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Criar Família</h2>
                            <p className="text-text-secondary text-sm">Dê um nome para seu grupo</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateFamily} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Nome da Família
                            </label>
                            <input
                                type="text"
                                value={familyName}
                                onChange={e => setFamilyName(e.target.value)}
                                placeholder="Ex: Família Silva"
                                className="bg-background-dark border border-surface-border rounded-xl px-4 py-3.5 text-white placeholder-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setView('menu')}
                                className="flex-1 px-4 py-3 rounded-xl border border-surface-border text-text-secondary hover:text-white hover:border-surface-border/80 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !familyName.trim()}
                                className="flex-1 px-4 py-3 rounded-xl bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="size-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    'Criar Família'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'join' && (
                <div className="max-w-md mx-auto w-full bg-gradient-to-br from-surface-dark to-background-dark border border-surface-border rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <span className="material-symbols-outlined">meeting_room</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Entrar na Família</h2>
                            <p className="text-text-secondary text-sm">Use o código de convite</p>
                        </div>
                    </div>

                    <form onSubmit={handleJoinFamily} className="flex flex-col gap-5">
                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-sm text-amber-200 flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-400 shrink-0">info</span>
                            <p>
                                Ao entrar, seus dados financeiros atuais serão transferidos para esta família e ficarão visíveis para todos os membros.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Código de Convite
                            </label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="Ex: ABC123"
                                className="bg-background-dark border border-surface-border rounded-xl px-4 py-3.5 text-white placeholder-text-secondary/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono tracking-[0.3em] uppercase text-center text-lg"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setView('menu')}
                                className="flex-1 px-4 py-3 rounded-xl border border-surface-border text-text-secondary hover:text-white hover:border-surface-border/80 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !inviteCode.trim()}
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar Agora'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
