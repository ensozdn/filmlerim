'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import ThemeToggle from '@/components/ThemeToggle';
import HeroSlider from '@/components/HeroSlider';
import FilmCarousel from '@/components/FilmCarousel';
import FilmCard from '@/components/FilmCard';

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
    // Newest logic would go here if we had a date field, currently just placeholder
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <div className="h-20 border-b border-white/5 bg-[#0a0e27]/80 backdrop-blur-xl"></div>
        <div className="h-[60vh] bg-gray-800/20 animate-pulse"></div>
        <main className="max-w-7xl mx-auto p-6">
          <div className="skeleton w-48 h-8 mb-8 bg-white/5"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl overflow-hidden skeleton bg-white/5"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Pick a random film for Hero Slider (or the first one)
  const heroFilm = films.length > 0 ? films[Math.floor(Math.random() * films.length)] : null;

  // Mock trending films (just shuffling for now)
  const trendingFilms = [...films].sort(() => 0.5 - Math.random()).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-blue-500/30">
      <DashboardHeader userEmail={user?.email} isAdmin={isAdmin} />

      {/* Hero Slider Section */}
      {heroFilm && <HeroSlider film={heroFilm} />}

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-12">

        {/* Trending Carousel */}
        {trendingFilms.length > 0 && (
          <section>
            <FilmCarousel title="Trend Filmler" films={trendingFilms} />
          </section>
        )}

        {/* All Films Section */}
        <section>
          <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Tüm Filmler
              </h2>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <input
                  type="text"
                  placeholder="Film ara..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 pl-10 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all group-hover:bg-[#1f2937]"
                />
                <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'title' | 'newest');
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-2.5 pr-8 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-[#1f2937]"
                >
                  <option value="title">A-Z Sıralı</option>
                  <option value="newest">En Yeniler</option>
                </select>
                <svg className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid */}
          {films.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/5">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🎬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Henüz Film Yok</h3>
              <p className="text-gray-400 text-sm">Sistemde henüz eklenmiş bir film bulunmuyor.</p>
            </div>
          ) : sortedFilms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/5">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Sonuç Bulunamadı</h3>
              <p className="text-gray-400 text-sm">"{searchQuery}" aramasına uygun film bulunamadı.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                {paginatedFilms.map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 border-t border-white/5 pt-8">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-lg bg-[#1a1f35] border border-white/5 text-white hover:bg-blue-600 hover:border-blue-500 disabled:opacity-50 disabled:hover:bg-[#1a1f35] disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-[#1a1f35] border border-white/5 text-gray-400 hover:bg-[#1f2937] hover:text-white'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-lg bg-[#1a1f35] border border-white/5 text-white hover:bg-blue-600 hover:border-blue-500 disabled:opacity-50 disabled:hover:bg-[#1a1f35] disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
