"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function AdminPlansPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const packages = useQuery(api.admin.listPackages, { token: token ?? undefined });
    const updatePackage = useMutation(api.admin.updatePackage);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);

    const startEdit = (pkg: any) => {
        setEditingId(pkg._id);
        setEditForm({ ...pkg });
    };

    const handleSave = async () => {
        if (!token || !editingId) return;
        try {
            const { _id, _creationTime, ...updates } = editForm;
            await updatePackage({
                token,
                packageId: editingId as any,
                updates
            });
            showToast("Plano atualizado com sucesso!", "success");
            setEditingId(null);
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    const formatAOA = (val: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Planos e Precificação</h1>
                    <p className="text-slate-500 font-medium">Configure as ofertas e limitações do sistema.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {packages?.map((pkg) => (
                    <div key={pkg._id} className={`bg-[#0e131b] border ${editingId === pkg._id ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-white/5'} rounded-[40px] p-8 transition-all flex flex-col`}>
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
                                    <span className="material-symbols-outlined text-2xl">
                                        {pkg.key === 'basic' ? 'eco' : pkg.key === 'intermediate' ? 'family_restroom' : 'offline_bolt'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{pkg.name}</h3>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">KEY: {pkg.key}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => editingId === pkg._id ? setEditingId(null) : startEdit(pkg)}
                                className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">{editingId === pkg._id ? 'close' : 'edit'}</span>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-8">
                            {/* Pricing Section */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Valores de Assinatura</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Mensal</p>
                                        {editingId === pkg._id ? (
                                            <input
                                                type="number"
                                                value={editForm.priceMonthly}
                                                onChange={(e) => setEditForm({ ...editForm, priceMonthly: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm font-black text-white"
                                            />
                                        ) : (
                                            <p className="text-xl font-black text-white">{formatAOA(pkg.priceMonthly)}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Anual</p>
                                        {editingId === pkg._id ? (
                                            <input
                                                type="number"
                                                value={editForm.priceYearly}
                                                onChange={(e) => setEditForm({ ...editForm, priceYearly: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm font-black text-white"
                                            />
                                        ) : (
                                            <p className="text-xl font-black text-white">{formatAOA(pkg.priceYearly)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Limits Section */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Limitações do Core</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">Contas Bancárias</p>
                                        {editingId === pkg._id ? (
                                            <input
                                                type="number"
                                                value={editForm.limits.maxAccounts}
                                                onChange={(e) => setEditForm({ ...editForm, limits: { ...editForm.limits, maxAccounts: Number(e.target.value) } })}
                                                className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm font-black text-white text-center"
                                            />
                                        ) : (
                                            <p className="text-2xl font-black text-center text-white">{pkg.limits.maxAccounts}</p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">Membros Família</p>
                                        {editingId === pkg._id ? (
                                            <input
                                                type="number"
                                                value={editForm.limits.maxFamilyMembers}
                                                onChange={(e) => setEditForm({ ...editForm, limits: { ...editForm.limits, maxFamilyMembers: Number(e.target.value) } })}
                                                className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm font-black text-white text-center"
                                            />
                                        ) : (
                                            <p className="text-2xl font-black text-center text-white">{pkg.limits.maxFamilyMembers}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Features Toggle Section */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Acesso a Funcionalidades</p>

                                <div className="grid grid-cols-2 gap-2">
                                    {Object.keys(pkg.features).map((feat) => {
                                        const featureKey = feat as keyof typeof pkg.features;
                                        const isEnabled = editingId === pkg._id ? editForm.features[featureKey] : pkg.features[featureKey];
                                        return (
                                            <button
                                                key={feat}
                                                disabled={editingId !== pkg._id}
                                                onClick={() => setEditForm({
                                                    ...editForm,
                                                    features: { ...editForm.features, [featureKey]: !editForm.features[featureKey] }
                                                })}
                                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tight ${editingId === pkg._id ? 'cursor-pointer' : ''} ${isEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-transparent text-slate-600'}`}
                                            >
                                                <span className="material-symbols-outlined text-sm">{isEnabled ? 'check_circle' : 'cancel'}</span>
                                                {feat.replace(/([A-Z])/g, ' $1')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {editingId === pkg._id && (
                            <button
                                onClick={handleSave}
                                className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs"
                            >
                                Salvar Alterações
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
