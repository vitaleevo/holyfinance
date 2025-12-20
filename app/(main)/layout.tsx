"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { TransactionModal } from "../components/TransactionModal";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const router = useRouter();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        // Check subscription/trial status
        if (!isLoading && isAuthenticated && user) {
            const trialEndsDate = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
            const isTrialExpired = trialEndsDate ? trialEndsDate < new Date() : true;
            const needsToSubscribe = user.subscriptionStatus === 'expired' || (user.subscriptionStatus === 'trialing' && isTrialExpired);

            if (needsToSubscribe && pathname !== '/subscription') {
                router.push('/subscription');
            }
        }
    }, [isAuthenticated, isLoading, user, router, pathname]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <p className="text-text-secondary">Carregando...</p>
                </div>
            </div>
        );
    }

    // Don't render protected content if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Determine subscription status for lockout UI
    const isExpired = user && (user.subscriptionStatus === 'expired' || (user.subscriptionStatus === 'trialing' && user.trialEndsAt && new Date(user.trialEndsAt) < new Date()));
    const isPending = user && user.subscriptionStatus === 'pending_verification';
    const isAtSubscription = pathname === '/subscription';

    // UI for Pending Verification
    if (isPending && !isAtSubscription) {
        return (
            <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden dark">
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full p-10 bg-surface-dark border border-primary/20 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[160px]">hourglass_empty</span>
                        </div>

                        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 mx-auto shadow-lg shadow-primary/10">
                            <span className="material-symbols-outlined text-4xl font-bold animate-pulse">history</span>
                        </div>

                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Pagamento em Análise</h1>
                        <p className="text-text-secondary font-medium mb-10 leading-relaxed font-outfit">
                            Recebemos o seu pedido de assinatura via **Multicaixa Express**. <br /><br />
                            Nossa equipe está validando a transferência. Seu acesso completo será liberado em até **24 horas**.
                        </p>

                        <div className="flex flex-col gap-4">
                            <a
                                href="https://wa.me/244935348327"
                                target="_blank"
                                className="w-full bg-primary text-background-dark font-black py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined font-bold">chat</span>
                                FALAR COM O SUPORTE
                            </a>
                            <button
                                onClick={async () => { await logout(); router.push('/login'); }}
                                className="text-xs font-bold text-text-secondary hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Strict lockout UI for expired subscriptions
    if (isExpired && !isAtSubscription) {
        return (
            <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden dark">
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full p-10 bg-surface-dark border border-surface-border rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[160px]">lock_clock</span>
                        </div>

                        <div className="size-20 rounded-3xl bg-danger/10 flex items-center justify-center text-danger mb-8 mx-auto shadow-lg shadow-danger/10">
                            <span className="material-symbols-outlined text-4xl font-bold">lock</span>
                        </div>

                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Sessão Bloqueada</h1>
                        <p className="text-text-secondary font-medium mb-10 leading-relaxed">
                            Seu período de teste grátis de 7 dias chegou ao fim. <br /><br /> Seus dados estão **seguros**, mas para continuar evoluindo sua vida financeira, você precisa escolher um plano.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => router.push('/subscription')}
                                className="w-full bg-primary text-background-dark font-black py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                ESCOLHER PLANO AGORA
                            </button>
                            <button
                                onClick={async () => { await logout(); router.push('/login'); }}
                                className="text-xs font-bold text-text-secondary hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden dark">
            <TransactionModal />
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <MobileNav />
                <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 pb-32 md:pb-12 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto w-full h-full pb-10 animate-reveal">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
