'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabase';

interface Film {
    id: number;
    title: string;
    poster_url: string;
}

interface DashboardHeaderProps {
    userEmail?: string;
    isAdmin: boolean;
    onSearch?: (query: string) => void;
    searchQuery?: string;
    films?: Film[];
    onGenreSelect?: (genre: string) => void;
}

export default function DashboardHeader({ userEmail, isAdmin, onSearch, searchQuery = '', films = [], onGenreSelect }: DashboardHeaderProps) {
    const router = useRouter();
    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Filter films for autocomplete
    const searchResults = searchQuery.length > 1 && films.length > 0
        ? films.filter(film => film.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    // Show dropdown when there are results
    const showSearchDropdown = searchDropdownOpen && searchResults.length > 0;

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

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 ml-8 mr-auto">
                    <a href="/dashboard" className="text-white font-medium hover:text-gray-300 transition-colors">Ana Sayfa</a>

                    {/* Genres Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                            className="text-gray-300 font-medium hover:text-white transition-colors flex items-center gap-1"
                        >
                            Türler
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {genreDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1f35] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                {['Aksiyon', 'Macera', 'Animasyon', 'Komedi', 'Suç', 'Belgesel', 'Drama', 'Aile', 'Fantastik', 'Tarih', 'Korku', 'Müzik', 'Gizem', 'Romantik', 'Bilim-Kurgu', 'Gerilim', 'Savaş', 'Western'].map((genre) => (
                                    <button
                                        key={genre}
                                        onClick={() => {
                                            onGenreSelect?.(genre);
                                            setGenreDropdownOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Search Bar */}
                    {onSearch && (
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Film ara..."
                                value={searchQuery}
                                onChange={(e) => {
                                    onSearch(e.target.value);
                                    setSearchDropdownOpen(true);
                                }}
                                onFocus={() => setSearchDropdownOpen(true)}
                                className="w-64 px-4 py-1.5 pl-10 pr-8 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all group-hover:bg-white/10"
                            />
                            <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>

                            {/* Clear Button */}
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        onSearch('');
                                        setSearchDropdownOpen(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Autocomplete Dropdown */}
                            {showSearchDropdown && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1f35] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {searchResults.map((film) => (
                                        <div
                                            key={film.id}
                                            onClick={() => {
                                                router.push(`/film/${film.id}`);
                                                onSearch('');
                                                setSearchDropdownOpen(false);
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                <img src={film.poster_url} alt={film.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate">{film.title}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{userEmail}</span>
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
                                href="/watchlist"
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                                title="İzleme Listem"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </a>

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

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0a0e27] border-t border-white/5 p-4 space-y-4 animate-slide-in">
                    {/* Mobile Search */}
                    {onSearch && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Film ara..."
                                value={searchQuery}
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {/* Mobile Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-[#1a1f35] border border-white/10 rounded-lg overflow-hidden">
                                    {searchResults.map((film) => (
                                        <div
                                            key={film.id}
                                            onClick={() => {
                                                router.push(`/film/${film.id}`);
                                                onSearch('');
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0"
                                        >
                                            <div className="w-8 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                <img src={film.poster_url} alt={film.title} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm text-white truncate">{film.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <a href="/dashboard" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">Ana Sayfa</a>
                        <a href="/watchlist" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">İzleme Listem</a>
                        <a href="/favorites" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">Favorilerim</a>
                        {isAdmin && (
                            <a href="/admin" className="block px-4 py-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors">Admin Paneli</a>
                        )}
                        <a href="/profile" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">Profilim ({userEmail})</a>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            )}
        </header >
    );
}
