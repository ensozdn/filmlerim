'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import FilmCard from '@/components/FilmCard';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_url: string;
    genres?: string[];
}

interface WatchlistItem {
    id: number;
    status: 'to_watch' | 'watched';
    watched_date: string | null;
    created_at: string;
    films: Film;
}

export default function WatchlistPage() {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'to_watch' | 'watched'>('to_watch');
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadWatchlist = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            // Get user profile for admin check
            const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            setIsAdmin(profileData?.role === 'admin');

            // Get watchlist items
            const { data: watchlistData } = await supabase
                .from('watchlist')
                .select('*, films(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setWatchlistItems(watchlistData || []);
            setLoading(false);
        };

        loadWatchlist();
    }, [router]);

    const filteredItems = watchlistItems.filter(item => item.status === activeTab);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27]">
                <div className="h-20 border-b border-white/5 bg-[#0a0e27]/80 backdrop-blur-xl"></div>
                <main className="max-w-7xl mx-auto p-6">
                    <div className="skeleton w-48 h-8 mb-8 bg-white/5"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="skeleton h-80 bg-white/5 rounded-2xl"></div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white">
            <DashboardHeader userEmail={user?.email} isAdmin={isAdmin} />

            <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Header */}
                <section>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                        İzleme Listem
                    </h1>
                    <p className="text-gray-400">İzlediğin ve izleyeceğin filmler</p>
                </section>

                {/* Tabs */}
                <section className="flex gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('to_watch')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'to_watch'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        📌 İzleyeceklerim ({watchlistItems.filter(i => i.status === 'to_watch').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('watched')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'watched'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        ✅ İzlediklerim ({watchlistItems.filter(i => i.status === 'watched').length})
                    </button>
                </section>

                {/* Films Grid */}
                <section>
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">{activeTab === 'to_watch' ? '📌' : '✅'}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                {activeTab === 'to_watch' ? 'Henüz İzleyeceğin Film Yok' : 'Henüz İzlediğin Film Yok'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Film detay sayfasından filmleri listelere ekleyebilirsin.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredItems.map((item) => (
                                <FilmCard key={item.id} film={item.films} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
