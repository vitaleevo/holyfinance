"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function AboutPage() {
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
                        <Link href="/about" className="text-sm font-bold text-primary transition-colors">Sobre Nós</Link>
                        <Link href="/support" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Suporte</Link>
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
                    <h1 className="text-5xl md:text-6xl font-black text-zinc-900 mb-8 tracking-tight">
                        Sobre a <span className="text-primary">HolyFinance</span>
                    </h1>

                    <div className="prose prose-lg prose-zinc text-zinc-500">
                        <p className="text-xl font-medium leading-relaxed mb-8">
                            A <strong>HolyFinance</strong> nasceu com uma missão clara: revolucionar a maneira como os angolanos lidam com o seu dinheiro. Acreditamos que a liberdade financeira não é apenas sobre ter mais dinheiro, mas sobre ter o controle, o conhecimento e as ferramentas certas para tomar as melhores decisões.
                        </p>

                        <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">Nossa Visão</h2>
                        <p className="mb-6">
                            Visualizamos um futuro onde cada família angolana possa planejar seu futuro com segurança, investir com inteligência e alcançar seus sonhos sem o peso das dívidas descontroladas.
                            Combinamos tecnologia de ponta, design intuitivo e educação financeira em uma plataforma única.
                        </p>

                        <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">Por que HolyFinance?</h2>
                        <ul className="space-y-4 mb-8 list-none pl-0">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                                <span><strong>Adaptação Local:</strong> Focados na realidade econômica de Angola.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                                <span><strong>Simplicidade Elegante:</strong> Transformamos a complexidade financeira em uma experiência visual agradável.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                                <span><strong>Educação Contínua:</strong> Não apenas gerimos números, ensinamos sobre eles.</span>
                            </li>
                        </ul>
                        <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">Contactos</h2>
                        <p className="mb-6">
                            Estamos sempre disponíveis para ouvir você.
                        </p>
                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">call</span>
                                    <div>
                                        <p className="font-bold text-zinc-900">Telefones</p>
                                        <p>935348327 / 959822513</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                                    <div>
                                        <p className="font-bold text-zinc-900">Email</p>
                                        <p>info@conexao.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

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
