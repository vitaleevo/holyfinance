"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-20 md:bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }: { toast: Toast, onClose: () => void }) => {
    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    };

    const colors = {
        success: 'border-primary shadow-primary/20 text-primary',
        error: 'border-danger shadow-danger/20 text-danger',
        info: 'border-blue-500 shadow-blue-500/20 text-blue-400',
        warning: 'border-orange-500 shadow-orange-500/20 text-orange-400'
    };

    const bgColors = {
        success: 'bg-primary/5',
        error: 'bg-danger/5',
        info: 'bg-blue-500/5',
        warning: 'bg-orange-500/5'
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slide-in min-w-[320px] max-w-[450px] bg-background-dark/80 ${colors[toast.type]} ${bgColors[toast.type]}`}
        >
            <span className={`material-symbols-outlined text-2xl`}>
                {icons[toast.type]}
            </span>
            <div className="flex-1">
                <p className="text-sm font-bold text-white leading-tight">
                    {toast.type === 'success' ? 'Sucesso' :
                        toast.type === 'error' ? 'Erro' :
                            toast.type === 'warning' ? 'Atenção' : 'Informação'}
                </p>
                <p className="text-text-secondary text-sm mt-0.5 line-clamp-2">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-text-secondary hover:text-white"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
