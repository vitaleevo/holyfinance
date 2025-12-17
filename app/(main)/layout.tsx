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
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

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

    return (
        <>
            <TransactionModal />
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <MobileNav />
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-24 md:pb-8 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto w-full h-full">
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
}
