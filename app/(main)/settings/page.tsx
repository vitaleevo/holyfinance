"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function SettingsPage() {
    const { settings, updateSettings } = useTransactions();
    const { user, token } = useAuth();
    const router = useRouter();

    // Fetch full profile to get avatarUrl
    const userProfile = useQuery(api.users.getProfile, { token: token ?? undefined });

    const generateUploadUrl = useMutation(api.users.generateUploadUrl);
    const updateProfile = useMutation(api.users.updateProfile);
    const updateAvatar = useMutation(api.users.updateAvatar);
    const saveEmailSettings = useMutation(api.emailConfigs.saveSettings);

    // Fetch existing settings
    const emailSettings = useQuery(api.emailConfigs.getSettings, { token: token ?? undefined });

    // Local state
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [currency, setCurrency] = useState("Kwanza (AOA)");
    const [familyRelationship, setFamilyRelationship] = useState("");

    // Email Config State
    const [emailHost, setEmailHost] = useState("");
    const [emailPort, setEmailPort] = useState(587); // Default SMTP
    const [emailUser, setEmailUser] = useState("");
    const [emailPass, setEmailPass] = useState("");
    const [emailFrom, setEmailFrom] = useState("");
    const [emailSecure, setEmailSecure] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state with user data when loaded
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || "");
            setEmail(userProfile.email || "");
            setPhone(userProfile.phone || "");
            setCurrency(userProfile.currency || "Kwanza (AOA)");
            setFamilyRelationship(userProfile.familyRelationship || "");
        } else if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [userProfile, user]);

    useEffect(() => {
        if (emailSettings) {
            setEmailHost(emailSettings.host || "");
            setEmailPort(emailSettings.port || 587);
            setEmailUser(emailSettings.user || "");
            setEmailPass(emailSettings.pass || "");
            setEmailFrom(emailSettings.fromEmail || "");
            setEmailSecure(emailSettings.secure || false);
        }
    }, [emailSettings]);

    const toggleTheme = () => {
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
    };

    const togglePrivacy = () => {
        updateSettings({ privacyMode: !settings.privacyMode });
    };

    const toggleNotifications = () => {
        updateSettings({ emailNotifications: !settings.emailNotifications });
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            // 1. Upload new avatar if selected
            if (selectedFile) {
                // Get upload URL
                const postUrl = await generateUploadUrl();

                // Upload file
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });

                if (!result.ok) throw new Error("Falha no upload da imagem");

                const { storageId } = await result.json();

                // Save storageId to user
                await updateAvatar({
                    storageId: storageId as Id<"_storage">,
                    token: token ?? undefined
                });
            }

            // Save profile details
            await updateProfile({
                token: token ?? undefined,
                name,
                phone,
                currency,
                familyRelationship
            });

            // Save email settings
            if (emailHost) {
                await saveEmailSettings({
                    token: token ?? undefined,
                    host: emailHost,
                    port: Number(emailPort),
                    user: emailUser,
                    pass: emailPass,
                    fromEmail: emailFrom,
                    secure: emailSecure
                });
            }

            // Cleanup and feedback
            setSelectedFile(null);
            alert("Configurações salvas com sucesso!"); // Simple feedback for now
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    // Determine which image to show
    const displayImage = previewUrl || userProfile?.avatarUrl || "https://i.pravatar.cc/150?img=11";

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tight">Configurações</h1>
                <p className="text-text-secondary">Gerencie sua conta e preferências do aplicativo.</p>
            </header>

            <div className="flex flex-col gap-6">
                {/* Profile Section */}
                <section className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Perfil
                    </h2>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="size-24 rounded-full bg-surface-border relative overflow-hidden group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white">edit</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <button
                                className="text-xs font-bold text-primary hover:text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Alterar Foto
                            </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white/50 cursor-not-allowed focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Telefone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+244 923 456 789"
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Moeda Principal</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                                >
                                    <option>Kwanza (AOA)</option>
                                    <option>Dólar (USD)</option>
                                    <option>Euro (EUR)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Parentesco Familiar</label>
                                <select
                                    value={familyRelationship}
                                    onChange={(e) => setFamilyRelationship(e.target.value)}
                                    className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Filho">Filho(a)</option>
                                    <option value="Cônjuge">Cônjuge</option>
                                    <option value="Irmão">Irmão/Irmã</option>
                                    <option value="Primo">Primo(a)</option>
                                    <option value="Avô">Avô/Avó</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 pt-6 border-t border-surface-border">
                        <button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <span className="size-4 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                                    Salvando...
                                </>
                            ) : "Salvar Alterações"}
                        </button>
                    </div>
                </section>

                {/* Family Plan Section */}
                <section className="bg-surface-dark border border-surface-border rounded-2xl p-6 cursor-pointer hover:border-primary transition-colors group" onClick={() => router.push('/settings/family')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">diversity_3</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Plano Familiar</h2>
                                <p className="text-sm text-text-secondary">Gerencie membros, convites e compartilhe suas finanças.</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">arrow_forward</span>
                    </div>
                </section>

                {/* App Settings */}
                <section className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        Preferências
                    </h2>
                    <div className="flex flex-col gap-4">
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-background-dark transition-colors cursor-pointer" onClick={toggleTheme}>
                            <div>
                                <p className="font-bold text-white">Modo Escuro</p>
                                <p className="text-xs text-text-secondary">O tema escuro é padrão do HolyFinanças</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.theme === 'dark' ? 'bg-primary' : 'bg-surface-border'}`}>
                                <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${settings.theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>

                        {/* Email Notifications Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-background-dark transition-colors cursor-pointer" onClick={toggleNotifications}>
                            <div>
                                <p className="font-bold text-white">Notificações por Email</p>
                                <p className="text-xs text-text-secondary">Receba resumos semanais e alertas de segurança</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.emailNotifications ? 'bg-primary' : 'bg-surface-border'}`}>
                                <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${settings.emailNotifications ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>

                        {/* Privacy Mode Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-background-dark transition-colors cursor-pointer" onClick={togglePrivacy}>
                            <div>
                                <p className="font-bold text-white">Ocultar valores sensíveis</p>
                                <p className="text-xs text-text-secondary">Borrar saldos na tela inicial e listagens</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.privacyMode ? 'bg-primary' : 'bg-surface-border'}`}>
                                <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${settings.privacyMode ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Email Settings */}
                <section className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">mail</span>
                        Configuração de Email (SMTP)
                    </h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Configure seu provedor para receber notificações reais.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase">Host (Server)</label>
                            <input type="text" value={emailHost} onChange={(e) => setEmailHost(e.target.value)} placeholder="smtp.gmail.com" className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase">Porta</label>
                            <input type="number" value={emailPort} onChange={(e) => setEmailPort(Number(e.target.value))} placeholder="587" className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase">Usuário</label>
                            <input type="text" value={emailUser} onChange={(e) => setEmailUser(e.target.value)} placeholder="seu@email.com" className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase">Senha (App Password)</label>
                            <input type="password" value={emailPass} onChange={(e) => setEmailPass(e.target.value)} placeholder="********" className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-text-secondary uppercase">Remetente (From)</label>
                            <input type="email" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} placeholder="no-reply@seuapp.com" className="bg-background-dark border border-surface-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                            <input type="checkbox" checked={emailSecure} onChange={(e) => setEmailSecure(e.target.checked)} className="size-4 rounded border-surface-border bg-background-dark text-primary focus:ring-primary" id="secureCheck" />
                            <label htmlFor="secureCheck" className="text-sm text-text-secondary">Usar conexão segura (SSL/TLS - Geralmente para porta 465)</label>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

