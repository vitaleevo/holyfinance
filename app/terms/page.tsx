"use client";

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-12 tracking-tight">Termos e Condições</h1>

                    <div className="prose prose-zinc prose-lg text-zinc-500 text-justify">
                        <p>
                            Última atualização: 20 de Dezembro de 2025
                        </p>

                        <h3>1. Introdução</h3>
                        <p>
                            Bem-vindo à HolyFinance. Ao acessar nosso site e usar nossos serviços, você concorda em cumprir e estar vinculado aos seguintes termos e condições.
                        </p>

                        <h3>2. Uso do Serviço</h3>
                        <p>
                            A HolyFinance fornece uma plataforma de gestão financeira pessoal e familiar. Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É estritamente proibido o uso indevido da plataforma para atividades fraudulentas ou ilegais.
                        </p>

                        <h3>3. Contas e Assinaturas</h3>
                        <p>
                            Para acessar certos recursos, você pode precisar criar uma conta e adquirir uma assinatura. Você é responsável por manter a confidencialidade de suas credenciais de conta e por todas as atividades que ocorrem sob sua conta.
                        </p>

                        <h3>4. Cancelamento e Reembolso</h3>
                        <p>
                            Você pode cancelar sua assinatura a qualquer momento. Reembolsos podem ser concedidos a critério da HolyFinance, de acordo com nossa política de reembolso vigente. O período de teste gratuito de 7 dias não gera cobranças se cancelado antes do término.
                        </p>

                        <h3>5. Propriedade Intelectual</h3>
                        <p>
                            Todo o conteúdo, marcas registradas e dados presentes na plataforma são propriedade da HolyFinance ou de seus licenciadores e estão protegidos pelas leis de propriedade intelectual de Angola e internacionais.
                        </p>

                        <h3>6. Limitação de Responsabilidade</h3>
                        <p>
                            A HolyFinance não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou da incapacidade de usar nossos serviços.
                        </p>

                        <h3>7. Contactos</h3>
                        <p>
                            Para questões sobre estes termos, por favor contacte-nos através do email <strong>info@conexao.com</strong> ou pelos telefones <strong>935348327 / 959822513</strong>.
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
