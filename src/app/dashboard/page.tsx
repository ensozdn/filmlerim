'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import ThemeToggle from '@/components/ThemeToggle';
import HeroSlider from '@/components/HeroSlider';
import FilmCarousel from '@/components/FilmCarousel';
import FilmCard from '@/components/FilmCard';
import SkeletonCard from '@/components/SkeletonCard';
import { useLanguage } from '@/context/LanguageContext';

interface Film {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genres?: string[];
}

const FILMS_PER_PAGE = 12;

export default function DashboardPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<'title' | 'newest'>('title');
  const router = useRouter();

  // Arama ve filtreleme
  const filteredFilms = films.filter((film) => {
    const matchesSearch = film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      film.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || (film.genres && film.genres.includes(selectedGenre));
    return matchesSearch && matchesGenre;
  });

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
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        // Handle auth errors
        if (authError) {
          console.error('Auth error:', authError);
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Admin kontrolü
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          setIsAdmin(profileData?.role === 'admin');
        } catch (err) {
          console.error('Profile fetch error:', err);
        }

        // Fetch all films
        const { data: filmsData } = await supabase
          .from('films')
          .select('*')
          .order('title');

        // Fetch all comments separately to avoid duplicates
        const { data: commentsData } = await supabase
          .from('comments')
          .select('film_id, rating');

        // Remove duplicate films by ID (just in case)
        const uniqueFilms = Array.from(
          new Map((filmsData || []).map((film: any) => [film.id, film])).values()
        );

        // Calculate average ratings per film
        const filmsWithRatings = uniqueFilms.map((film: any) => {
          const filmComments = (commentsData || []).filter((c: any) => c.film_id === film.id);
          const ratings = filmComments.map((c: any) => c.rating);
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
            : 0;

          return {
            ...film,
            average_rating: avgRating,
            comment_count: ratings.length
          };
        });

        setFilms(filmsWithRatings);
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/login');
      }
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <div className="h-20 border-b border-white/5 bg-[#0a0e27]/80 backdrop-blur-xl"></div>
        {/* Hero Slider Skeleton */}
        <div className="h-[50vh] md:h-[60vh] lg:h-[70vh] bg-gradient-to-br from-gray-800/30 to-gray-900/30 animate-pulse"></div>
        
        <main className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 animate-pulse">
                <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-700/50 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Trending Carousel Skeleton */}
          <div className="mb-8 md:mb-12">
            <div className="h-6 bg-gray-700/50 rounded w-32 mb-4 animate-pulse"></div>
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-w-[200px] aspect-[2/3] bg-gray-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Films Grid Skeleton */}
          <div className="h-6 bg-gray-700/50 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Mock trending films (just shuffling for now)
  const trendingFilms = [...films].sort(() => 0.5 - Math.random()).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-blue-500/30">
      <DashboardHeader
        userEmail={user?.email}
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        films={films}
        onGenreSelect={(genre) => {
          setSelectedGenre(genre);
          setCurrentPage(1);
        }}
      />

      {/* Hero Slider Section */}
      {films.length > 0 && <HeroSlider films={films.slice(0, 5)} />}

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 md:space-y-12">

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-[#1a1f35] p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl md:text-6xl">🎬</span>
            </div>
            <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-1">{t('dashboard.totalFilms')}</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">{films.length}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs text-green-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {t('dashboard.active')}
              </span>
            </div>
          </div>

          <div className="bg-[#1a1f35] p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl md:text-6xl">💬</span>
            </div>
            <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-1">{t('dashboard.totalComments')}</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {films.reduce((acc, film: any) => acc + (film.comment_count || 0), 0)}
            </p>
            <div className="mt-2 md:mt-4 flex items-center text-xs text-blue-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {t('dashboard.interaction')}
              </span>
            </div>
          </div>

          <div className="bg-[#1a1f35] p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl md:text-6xl">⭐</span>
            </div>
            <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-1">{t('dashboard.avgRating')}</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {(films.reduce((acc, film: any) => acc + (film.average_rating || 0), 0) / (films.length || 1)).toFixed(1)}
            </p>
            <div className="mt-2 md:mt-4 flex items-center text-xs text-yellow-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {t('dashboard.satisfaction')}
              </span>
            </div>
          </div>

          <div className="bg-[#1a1f35] p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl md:text-6xl">🎭</span>
            </div>
            <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-1">{t('dashboard.topGenre')}</h3>
            <p className="text-2xl md:text-3xl font-bold text-white truncate">
              {(() => {
                const genreCounts: Record<string, number> = {};
                films.forEach((film: any) => {
                  film.genres?.forEach((g: string) => {
                    genreCounts[g] = (genreCounts[g] || 0) + 1;
                  });
                });
                const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
                return topGenre ? topGenre[0] : '-';
              })()}
            </p>
            <div className="mt-2 md:mt-4 flex items-center text-xs text-purple-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                {t('dashboard.trending')}
              </span>
            </div>
          </div>
        </div>

        {/* Trending Carousel */}
        {trendingFilms.length > 0 && (
          <section>
            <FilmCarousel title={t('dashboard.trendingFilms')} films={trendingFilms} />
          </section>
        )}

        {/* All Films Section */}
        <section>
          <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                {t('dashboard.allFilms')}
              </h2>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {/* Genre Filter */}
              <div className="relative">
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-2.5 pr-8 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-[#1f2937]"
                >
                  <option value="">{t('dashboard.allGenres')}</option>
                  {['action', 'adventure', 'animation', 'comedy', 'crime', 'documentary', 'drama', 'family', 'fantasy', 'history', 'horror', 'music', 'mystery', 'romance', 'scifi', 'thriller', 'war', 'western'].map((genreKey) => (
                    <option key={genreKey} value={t(`genre.${genreKey}`)}>
                      {t(`genre.${genreKey}`)}
                    </option>
                  ))}
                </select>
                <svg className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'title' | 'newest');
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-2.5 pr-8 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-[#1f2937]"
                >
                  <option value="title">{t('dashboard.sortAZ')}</option>
                  <option value="newest">{t('dashboard.sortNewest')}</option>
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
              <h3 className="text-lg font-semibold text-white mb-1">{t('dashboard.noFilmsYet')}</h3>
              <p className="text-gray-400 text-sm">{t('dashboard.noFilmsDesc')}</p>
            </div>
          ) : sortedFilms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/5">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{t('dashboard.noResults')}</h3>
              <p className="text-gray-400 text-sm">{t('dashboard.noResultsDesc', { query: searchQuery })}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
                {paginatedFilms.map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 md:gap-3 border-t border-white/5 pt-6 md:pt-8">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 md:p-2.5 rounded-lg bg-[#1a1f35] border border-white/5 text-white hover:bg-blue-600 hover:border-blue-500 disabled:opacity-50 disabled:hover:bg-[#1a1f35] disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex gap-1 md:gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium text-sm md:text-base transition-all ${currentPage === i + 1
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
                    className="p-2 md:p-2.5 rounded-lg bg-[#1a1f35] border border-white/5 text-white hover:bg-blue-600 hover:border-blue-500 disabled:opacity-50 disabled:hover:bg-[#1a1f35] disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div >
  );
}
