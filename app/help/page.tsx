"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function HelpPage() {
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
                        <Link href="/support" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">Suporte</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/dashboard" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-full transition-all">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Entrar</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight">Centro de <span className="text-primary">Ajuda</span></h1>
                        <p className="text-xl text-zinc-500">Encontre respostas rápidas para suas dúvidas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { q: 'Como criar uma conta?', a: 'Clique em "Criar Conta" no canto superior direito, preencha seus dados e comece seu teste gratuito de 7 dias.' },
                            { q: 'Quais métodos de pagamento aceitam?', a: 'Aceitamos cartões Multicaixa, transferências bancárias e pagamentos via referência.' },
                            { q: 'Posso cancelar a qualquer momento?', a: 'Sim, você tem total liberdade para cancelar sua assinatura quando quiser nas configurações da conta.' },
                            { q: 'Como adicionar membros da família?', a: 'No plano Intermediário ou Avançado, vá em Configurações > Família e envie o convite por email.' },
                            { q: 'Meus dados estão seguros?', a: 'Sim, utilizamos criptografia de nível bancário para garantir que suas informações financeiras estejam protegidas.' },
                            { q: 'O aplicativo funciona offline?', a: 'Algunas funções podem ser visualizadas offline, mas é necessária conexão para sincronizar dados em tempo real.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-zinc-200 hover:border-primary/50 transition-colors">
                                <h3 className="font-bold text-lg text-zinc-900 mb-3">{item.q}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-zinc-500 mb-4">Não encontrou o que procurava?</p>
                        <Link href="/support" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                            Fale com nossa equipe
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
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
