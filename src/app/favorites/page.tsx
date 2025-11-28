'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface Film {
  id: number;
  title: string;
  description: string;
  poster_url: string;
}

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="skeleton w-48 h-10"></div>
            <div className="flex gap-4">
              <div className="skeleton w-32 h-10"></div>
              <div className="skeleton w-32 h-10"></div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">
          <div className="skeleton w-48 h-8 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700">
                <div className="skeleton w-full h-48"></div>
                <div className="p-4 space-y-3">
                  <div className="skeleton w-full h-5"></div>
                  <div className="skeleton w-5/6 h-4"></div>
                  <div className="skeleton w-full h-10 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Filmlerim.iO
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Tüm Filmler
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Favorites */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-white mb-8">❤️ Favorilerim</h2>
        {films.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Henüz favori filme eklenmemiş.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <div
                key={film.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 transform hover:scale-105 border border-gray-700 hover:border-pink-500"
              >
                {film.poster_url && (
                  <img
                    src={film.poster_url}
                    alt={film.title}
                    className="w-full h-48 object-cover cursor-pointer hover:brightness-110 transition-all duration-300"
                    onClick={() => router.push(`/film/${film.id}`)}
                  />
                )}
                <div className="p-4">
                  <h3
                    className="text-white font-bold truncate cursor-pointer hover:text-pink-400 transition-colors"
                    onClick={() => router.push(`/film/${film.id}`)}
                  >
                    {film.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 mt-2">
                    {film.description}
                  </p>
                  <button
                    onClick={() => removeFavorite(film.id)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ❌ Çıkar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
