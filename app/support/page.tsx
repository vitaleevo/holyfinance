"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function SupportPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-noto overflow-x-hidden w-full selection:bg-primary/30">
            {/* Header / Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo-icon.png" alt="Logo" className="h-10 w-auto" />
                        <span className="text-xl font-black tracking-tighter uppercase text-zinc-900">HolyFinance</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Início</Link>
                        <Link href="/about" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Sobre Nós</Link>
                        <Link href="/support" className="text-sm font-bold text-primary transition-colors">Suporte</Link>
                        <Link href="/help" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Ajuda</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/dashboard" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-full transition-all">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Entrar</Link>
                                <Link href="/register" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-[0_10px_20px_rgba(19,236,109,0.2)]">
                                    Começar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-primary font-black tracking-widest uppercase text-xs mb-2 block">Precisa de Ajuda?</span>
                        <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tight mb-6">
                            Fale com o nosso <span className="text-primary">Suporte</span>
                        </h1>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                            Nossa equipe especializada está pronta para resolver qualquer questão financeira ou técnica que você possa ter.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-zinc-50 p-10 rounded-[32px] border border-zinc-100 flex flex-col items-center text-center hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 group">
                            <div className="size-20 bg-white rounded-full flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">call</span>
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Ligue para Nós</h3>
                            <p className="text-zinc-500 mb-6">Atendimento direto e personalizado.</p>
                            <div className="bg-white px-6 py-3 rounded-xl border border-zinc-100 font-bold text-lg text-zinc-900">
                                935348327 / 959822513
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-10 rounded-[32px] border border-zinc-100 flex flex-col items-center text-center hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 group">
                            <div className="size-20 bg-white rounded-full flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">mail</span>
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Envie um Email</h3>
                            <p className="text-zinc-500 mb-6">Responderemos em até 24 horas.</p>
                            <a href="mailto:info@conexao.com" className="bg-white px-6 py-3 rounded-xl border border-zinc-100 font-bold text-lg text-primary hover:text-primary-dark transition-colors">
                                info@conexao.com
                            </a>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-[32px] p-12 text-center border border-primary/10">
                        <h3 className="text-2xl font-bold text-zinc-900 mb-4">Horário de Atendimento</h3>
                        <p className="text-zinc-600 font-medium">
                            Segunda a Sexta: 08:00 - 18:00<br />
                            Sábado: 09:00 - 13:00<br />
                            Domingo e Feriados: Fechado
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-20 border-t border-zinc-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                            <img src="/logo-icon.png" alt="Logo" className="h-10 w-auto" />
                            <span className="text-xl font-black tracking-tighter uppercase text-zinc-900">HolyFinance</span>
                        </div>
                        <p className="text-zinc-500 max-w-sm font-medium">Liderando a revolução da educação financeira e gestão de patrimônio em Angola.</p>
                        <div className="mt-6 text-zinc-500 font-medium text-sm">
                            <p>935348327 / 959822513</p>
                            <p>info@conexao.com</p>
                        </div>
                    </div>
                    <div className="text-zinc-900">
                        <h4 className="font-bold mb-6">HolyFinance</h4>
                        <div className="flex flex-col gap-4 text-zinc-500 font-medium">
                            <Link href="/login" className="hover:text-primary transition-colors">Entrar</Link>
                            <Link href="/register" className="hover:text-primary transition-colors">Criar Conta</Link>
                            <Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link>
                        </div>
                    </div>
                    <div className="text-zinc-900">
                        <h4 className="font-bold mb-6">Suporte</h4>
                        <div className="flex flex-col gap-4 text-zinc-500 font-medium">
                            <Link href="/terms" className="hover:text-primary transition-colors">Termos e Condições</Link>
                            <Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
                            <Link href="/help" className="hover:text-primary transition-colors">Ajuda</Link>
                            <Link href="/support" className="hover:text-primary transition-colors">Fale Conosco</Link>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-20 pt-8 border-t border-zinc-100 text-xs text-zinc-400 font-bold uppercase tracking-widest">
                    © 2024 HolyFinance Angola. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
