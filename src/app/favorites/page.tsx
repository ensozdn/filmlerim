'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import FilmCard from '@/components/FilmCard';
import SkeletonCard from '@/components/SkeletonCard';

interface Film {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genres?: string[];
}

export default function FavoritesPage() {
  const { t } = useLanguage();
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
      <div className="min-h-screen bg-[#0a0e27] dark:bg-[#0a0e27] light:bg-white">
        <div className="h-20 border-b border-white/5 dark:border-white/5 light:border-gray-200 bg-[#0a0e27]/80 dark:bg-[#0a0e27]/80 light:bg-white/80 backdrop-blur-xl"></div>
        <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="h-8 bg-gray-700/50 dark:bg-gray-700/50 light:bg-gray-300 rounded w-48 mb-6 md:mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] dark:bg-[#0a0e27] light:bg-white text-white dark:text-white light:text-gray-900">
      <DashboardHeader userEmail={user?.email} isAdmin={isAdmin} />

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-1 h-8 bg-pink-500 rounded-full"></span>
            {t('favorites.title')}
          </h1>
          <p className="text-gray-400">
            {t('favorites.count', { count: films.length })}
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
                {t('favorites.noFavorites')}
              </h3>
              <p className="text-gray-400 text-sm">
                {t('favorites.noFavoritesDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
