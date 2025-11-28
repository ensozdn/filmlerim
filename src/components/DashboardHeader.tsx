'use client';

import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabase';

interface DashboardHeaderProps {
    userEmail?: string;
    isAdmin: boolean;
}

export default function DashboardHeader({ userEmail, isAdmin }: DashboardHeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0e27]/80 border-b border-white/5 shadow-2xl transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent group-hover:text-white transition-colors">
                        Filmlerim
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-400">{userEmail}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <a
                                href="/admin"
                                className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all"
                                title="Admin Paneli"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                        )}

                        <a
                            href="/favorites"
                            className="p-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:text-pink-300 transition-all"
                            title="Favorilerim"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </a>

                        <div className="h-6 w-px bg-white/10 mx-1"></div>

                        <ThemeToggle />

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                            title="Çıkış Yap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
