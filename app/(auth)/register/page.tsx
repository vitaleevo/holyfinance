"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            await register(name, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-dark border border-surface-border p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center mb-8">
                <img
                    src="/logo-full-dark-bg.png"
                    alt="HolyFinanças"
                    className="h-32 w-auto object-contain mb-6 drop-shadow-[0_0_15px_rgba(19,236,109,0.3)]"
                />
                <h1 className="text-2xl font-black text-white tracking-tight">Crie sua Conta</h1>
                <p className="text-text-secondary text-sm">Comece a controlar sua vida financeira hoje.</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase">Nome Completo</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">person</span>
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-background-dark border border-surface-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase">Email</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">mail</span>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background-dark border border-surface-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase">Senha</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">lock</span>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background-dark border border-surface-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase">Confirmar Senha</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">lock_reset</span>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-background-dark border border-surface-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>
                </div>

                <button disabled={isLoading} className="mt-2 w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? (
                        <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span>Criar Conta</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-text-secondary text-sm mt-8">
                Já tem uma conta? <Link href="/login" className="text-primary font-bold hover:text-white transition-colors">Faça Login</Link>
            </p>
        </div>
    );
}
