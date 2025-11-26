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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
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

      // Admin kontrolü
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      }

      // Filmleri getir
      const { data: filmsData } = await supabase.from('films').select('*');
      setFilms(filmsData || []);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
            <span className="text-gray-300">{user?.email}</span>
            {isAdmin && (
              <a
                href="/admin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Admin Paneli
              </a>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Films Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-8">Filmler</h2>
        {films.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Henüz film eklenmemiş.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <div
                key={film.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/film/${film.id}`)}
              >
                {film.poster_url && (
                  <img
                    src={film.poster_url}
                    alt={film.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-white font-bold truncate">{film.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {film.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
