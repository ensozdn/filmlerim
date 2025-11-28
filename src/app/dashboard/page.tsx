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

const FILMS_PER_PAGE = 12;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'newest'>('title');
  const router = useRouter();

  // Arama ve filtreleme
  const filteredFilms = films.filter((film) =>
    film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    film.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sıralama
  const sortedFilms = [...filteredFilms].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'tr');
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedFilms.length / FILMS_PER_PAGE);
  const startIndex = (currentPage - 1) * FILMS_PER_PAGE;
  const paginatedFilms = sortedFilms.slice(startIndex, startIndex + FILMS_PER_PAGE);

  // Sayfa değiştiğinde scroll top
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
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
                  <div className="skeleton w-4/6 h-4"></div>
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
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800/50 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Filmlerim
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">{user?.email}</span>
            </button>
            {isAdmin && (
              <a
                href="/admin"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                ⚙️ Admin
              </a>
            )}
            <a
              href="/favorites"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600/80 to-pink-700/80 hover:from-pink-500 hover:to-pink-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-pink-500/50"
            >
              ❤️ Favoriler
            </a>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-red-600/20 text-gray-300 hover:text-red-400 font-medium transition-all duration-300"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Films Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Tüm Filmler</h2>
            <p className="text-gray-400 text-sm">
              {sortedFilms.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + FILMS_PER_PAGE, sortedFilms.length)} / ${sortedFilms.length}` : '0 film'}
            </p>
          </div>

          {/* Search ve Filter */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Filmleri ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'title' | 'newest');
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm font-medium"
            >
              <option value="title">📝 Başlığa Göre</option>
              <option value="newest">🆕 En Yeniler</option>
            </select>
          </div>
        </div>
        {films.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Henüz film eklenmemiş.</p>
        ) : sortedFilms.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Arama sonucu bulunamadı.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {paginatedFilms.map((film) => (
                <div
                  key={film.id}
                  className="group relative bg-gray-800/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20"
                  onClick={() => router.push(`/film/${film.id}`)}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-gray-900">
                    {film.poster_url && (
                      <img
                        src={film.poster_url}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-white font-bold text-lg truncate group-hover:text-blue-400 transition-colors duration-300">
                      {film.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-2 group-hover:text-gray-300 transition-colors duration-300">
                      {film.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Detaylar →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Önceki
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        currentPage === i + 1
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
