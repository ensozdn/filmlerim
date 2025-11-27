'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Filmlerim.iO</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tüm Filmler
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Favorites */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-8">Favorilerim</h2>
        {films.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Henüz favori filme eklenmemiş.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <div
                key={film.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {film.poster_url && (
                  <img
                    src={film.poster_url}
                    alt={film.title}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/film/${film.id}`)}
                  />
                )}
                <div className="p-4">
                  <h3
                    className="text-white font-bold truncate cursor-pointer hover:text-blue-400"
                    onClick={() => router.push(`/film/${film.id}`)}
                  >
                    {film.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {film.description}
                  </p>
                  <button
                    onClick={() => removeFavorite(film.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    Favorilerden Çıkar
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
