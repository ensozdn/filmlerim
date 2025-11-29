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

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Get profile for admin check
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profileData?.role === 'admin');

      // Favorileri getir
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('film_id, films(*)')
        .eq('user_id', user.id);

      if (favoritesData) {
        const filmsList = favoritesData.map((fav: any) => fav.films).filter(Boolean);
        setFilms(filmsList);
      }

      setLoading(false);
    };

    getUser();
  }, [router]);

  const removeFavorite = async (filmId: number) => {
    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('film_id', filmId)
        .eq('user_id', user.id);

      setFilms(films.filter((f) => f.id !== filmId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

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
            <span className="w-1 h-8 bg-pink-500 rounded-full"></span>
            Favorilerim
          </h1>
          <p className="text-gray-400">
            {films.length} favori filmin var
          </p>
        </section>

        {/* Films Grid */}
        <section>
          {films.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/5">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">💔</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Henüz Favori Film Yok
              </h3>
              <p className="text-gray-400 text-sm">
                Beğendiğin filmleri favorilere ekleyerek buradan kolayca erişebilirsin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {films.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
