"use client";

import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!user?.isSuperAdmin) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#05070a]">
                <div className="flex flex-col items-center gap-6">
                    <div className="size-16 rounded-2xl border-4 border-indigo-600 border-t-transparent animate-spin shadow-2xl shadow-indigo-500/20"></div>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-white font-black tracking-widest uppercase text-xs">Acessando HQ</p>
                        <p className="text-slate-500 text-[10px] font-bold">Verificando Credenciais de Segurança...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user?.isSuperAdmin) {
        return null;
    }

    return (
        <div className="flex h-screen w-full bg-[#05070a] text-slate-200 overflow-hidden font-display">
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Admin Top Bar */}
                <header className="h-20 flex-shrink-0 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-10 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Terminal de Controle</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full border border-success/20">
                            <div className="size-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-[10px] font-black text-success uppercase tracking-widest">Sistemas Operacionais</span>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400">
                            <button className="material-symbols-outlined hover:text-white transition-colors cursor-pointer">notifications</button>
                            <button className="material-symbols-outlined hover:text-white transition-colors cursor-pointer">chat_bubble</button>
                            <div className="w-px h-6 bg-white/10 mx-2"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-white">Versão 2.4.0</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Stability Build</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full animate-reveal">
                        {children}
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="absolute bottom-0 right-0 p-8 pointer-events-none opacity-5">
                    <span className="material-symbols-outlined text-[300px] select-none">verified_user</span>
                </div>
            </main>
        </div>
    );
}
