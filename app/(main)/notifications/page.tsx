"use client";

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Helper to format time relative
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Agora mesmo";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} horas atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString();
}

function getIcon(type: string) {
    switch (type) {
        case 'success': return "check_circle";
        case 'warning': return "warning";
        case 'error': return "error";
        default: return "info"; // info
    }
}

function getColor(type: string) {
    switch (type) {
        case 'success': return "text-primary bg-primary/10";
        case 'warning': return "text-orange-400 bg-orange-400/10";
        case 'error': return "text-red-500 bg-red-500/10";
        default: return "text-blue-400 bg-blue-400/10";
    }
}

export default function NotificationsPage() {
    const { user, token } = useAuth();
    const notifications = useQuery(api.notifications.list, { token: token ?? undefined });
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const clearAll = useMutation(api.notifications.clearAll);

    const handleMarkAllRead = async () => {
        if (!token) return;
        await markAllAsRead({ token });
    };

    const handleClearAll = async () => {
        if (!token || !confirm("Tem certeza que deseja apagar todas as notificações?")) return;
        await clearAll({ token });
    };

    const handleRead = async (id: Id<"notifications">) => {
        if (!token) return;
        await markAsRead({ id, token });
    };

    if (!notifications) {
        return (
            <div className="flex flex-col gap-8 max-w-3xl mx-auto p-4 animate-pulse">
                <div className="h-20 bg-surface-dark rounded-xl"></div>
                <div className="h-20 bg-surface-dark rounded-xl"></div>
                <div className="h-20 bg-surface-dark rounded-xl"></div>
            </div>
        );
    }

    const hasUnread = notifications.some(n => !n.read);

    return (
        <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            <header className="flex justify-between items-center border-b border-surface-border pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Notificações</h1>
                    <p className="text-text-secondary">Fique por dentro das atualizações importantes.</p>
                </div>
                <div className="flex gap-4">
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                            Limpar Tudo
                        </button>
                    )}
                    {hasUnread && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm font-bold text-primary hover:text-white transition-colors"
                        >
                            Marcar todas como lidas
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-col gap-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-4 opacity-50">notifications_off</span>
                        <p>Nenhuma notificação no momento.</p>
                    </div>
                ) : (
                    notifications.map((notif: any) => (
                        <div
                            key={notif._id}
                            onClick={() => !notif.read && handleRead(notif._id)}
                            className={`p-4 rounded-xl border flex gap-4 transition-all cursor-pointer ${!notif.read
                                    ? 'bg-surface-dark border-primary/30'
                                    : 'bg-transparent border-surface-border opacity-70 hover:opacity-100'
                                }`}
                        >
                            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${getColor(notif.type)}`}>
                                <span className="material-symbols-outlined text-[20px]">{getIcon(notif.type)}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-sm ${!notif.read ? 'text-white' : 'text-text-secondary'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
                                        {timeAgo(notif.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>
                            {!notif.read && (
                                <div className="size-2 rounded-full bg-primary mt-2" title="Não lida"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
