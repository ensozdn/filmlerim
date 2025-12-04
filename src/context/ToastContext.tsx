'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    progress: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, message, type, progress: 100 };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 4 seconds with progress
        const duration = 4000;
        const interval = 50;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            const progress = ((duration - elapsed) / duration) * 100;

            if (progress <= 0) {
                clearInterval(timer);
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            } else {
                setToasts((prev) =>
                    prev.map((toast) =>
                        toast.id === id ? { ...toast, progress } : toast
                    )
                );
            }
        }, interval);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
                    border: 'border-green-400/50',
                    shadow: 'shadow-green-500/50',
                    progress: 'bg-green-300',
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-500 to-rose-600',
                    border: 'border-red-400/50',
                    shadow: 'shadow-red-500/50',
                    progress: 'bg-red-300',
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
                    border: 'border-yellow-400/50',
                    shadow: 'shadow-yellow-500/50',
                    progress: 'bg-yellow-300',
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
                    border: 'border-blue-400/50',
                    shadow: 'shadow-blue-500/50',
                    progress: 'bg-blue-300',
                };
        }
    };

    const getToastIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
                {toasts.map((toast) => {
                    const styles = getToastStyles(toast.type);
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto relative overflow-hidden ${styles.bg} rounded-xl shadow-2xl ${styles.shadow} border ${styles.border} text-white transform transition-all duration-300 hover:scale-105 animate-slide-in`}
                            onClick={() => removeToast(toast.id)}
                        >
                            <div className="flex items-center gap-3 px-5 py-4">
                                <div className="flex-shrink-0">
                                    {getToastIcon(toast.type)}
                                </div>
                                <span className="flex-1 text-sm font-medium leading-relaxed">
                                    {toast.message}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeToast(toast.id);
                                    }}
                                    className="flex-shrink-0 text-white/80 hover:text-white transition-colors hover:rotate-90 transform duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {/* Progress Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                <div
                                    className={`h-full ${styles.progress} transition-all duration-50 ease-linear`}
                                    style={{ width: `${toast.progress}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
