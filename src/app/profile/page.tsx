'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import FilmCard from '@/components/FilmCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Film {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genres?: string[];
}

interface UserStats {
  totalFavorites: number;
  totalComments: number;
  totalWatchlist: number;
  averageRating: number;
  genreDistribution: { [key: string]: number };
  monthlyActivity: { month: string; count: number }[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Film[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalFavorites: 0,
    totalComments: 0,
    totalWatchlist: 0,
    averageRating: 0,
    genreDistribution: {},
    monthlyActivity: [],
  });
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      setIsAdmin(profileData?.role === 'admin');

      // Get favorites with genres
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('films(*)')
        .eq('user_id', user.id);

      const films = favoritesData?.map((fav: any) => fav.films).filter(Boolean) || [];
      setFavorites(films);

      // Get watchlist count
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id);

      // Get comments with created_at and rating
      const { data: commentsData } = await supabase
        .from('comments')
        .select('rating, created_at')
        .eq('user_id', user.id);

      const totalComments = commentsData?.length || 0;
      const averageRating =
        totalComments > 0
          ? commentsData!.reduce((sum, c) => sum + c.rating, 0) / totalComments
          : 0;

      // Calculate genre distribution
      const genreCount: { [key: string]: number } = {};
      films.forEach((film: Film) => {
        if (film.genres) {
          film.genres.forEach((genre: string) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });

      // Calculate monthly activity (last 6 months)
      const monthlyCount: { [key: string]: number } = {};
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        monthlyCount[monthKey] = 0;
      }

      commentsData?.forEach((comment: any) => {
        const commentDate = new Date(comment.created_at);
        const monthKey = commentDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        if (monthlyCount[monthKey] !== undefined) {
          monthlyCount[monthKey]++;
        }
      });

      const monthlyActivity = Object.entries(monthlyCount).map(([month, count]) => ({
        month,
        count,
      }));

      setStats({
        totalFavorites: films.length,
        totalComments,
        totalWatchlist: watchlistData?.length || 0,
        averageRating: parseFloat(averageRating.toFixed(1)),
        genreDistribution: genreCount,
        monthlyActivity,
      });

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <div className="h-20 border-b border-white/5 bg-[#0a0e27]/80 backdrop-blur-xl"></div>
        <main className="max-w-7xl mx-auto p-6">
          <div className="skeleton w-48 h-8 mb-8 bg-white/5"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-32 bg-white/5 rounded-2xl"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] dark:bg-[#0a0e27] light:bg-white text-white dark:text-white light:text-gray-900">
      <DashboardHeader userEmail={user?.email} isAdmin={isAdmin} />

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-12">
        {/* Profile Header */}
        <section className="bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 from-gray-100 to-gray-200 rounded-2xl p-8 border border-white/10 dark:border-white/10 light:border-gray-300">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg shadow-blue-500/20">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.email?.charAt(0).toUpperCase()
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
                {user?.email}
              </h1>
              {profile?.bio && (
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-700 text-sm">{profile.bio}</p>
              )}
              <div className="flex gap-4 mt-3">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-500 light:text-gray-700">{t('profile.membership')} </span>
                  <span className="text-gray-300 dark:text-gray-300 light:text-gray-600">
                    {new Date(user?.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br dark:from-blue-600/20 dark:to-blue-800/20 from-blue-100 to-blue-200 rounded-2xl p-6 border dark:border-blue-500/30 light:border-blue-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 dark:bg-blue-500/20 light:bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <p className="text-blue-300 dark:text-blue-300 light:text-blue-700 text-sm font-medium">{t('profile.favorites')}</p>
                <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">{stats.totalFavorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br dark:from-purple-600/20 dark:to-purple-800/20 from-purple-100 to-purple-200 rounded-2xl p-6 border dark:border-purple-500/30 light:border-purple-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 dark:bg-purple-500/20 light:bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <p className="text-purple-300 dark:text-purple-300 light:text-purple-700 text-sm font-medium">{t('profile.comments')}</p>
                <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">{stats.totalComments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br dark:from-yellow-600/20 dark:to-yellow-800/20 from-yellow-100 to-yellow-200 rounded-2xl p-6 border dark:border-yellow-500/30 light:border-yellow-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 dark:bg-yellow-500/20 light:bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-yellow-300 dark:text-yellow-300 light:text-yellow-700 text-sm font-medium">{t('profile.avgRating')}</p>
                <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">
                  {stats.averageRating > 0 ? stats.averageRating : '-'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genre Distribution */}
          <div className="bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 from-gray-100 to-gray-200 rounded-2xl p-6 border border-white/10 dark:border-white/10 light:border-gray-300">
            <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-500 rounded-full"></span>
              Favori Türler
            </h3>
            {Object.keys(stats.genreDistribution).length > 0 ? (
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: Object.keys(stats.genreDistribution),
                    datasets: [
                      {
                        data: Object.values(stats.genreDistribution),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(236, 72, 153, 0.8)',
                          'rgba(251, 146, 60, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(248, 113, 113, 0.8)',
                        ],
                        borderColor: [
                          'rgba(59, 130, 246, 1)',
                          'rgba(168, 85, 247, 1)',
                          'rgba(236, 72, 153, 1)',
                          'rgba(251, 146, 60, 1)',
                          'rgba(34, 197, 94, 1)',
                          'rgba(248, 113, 113, 1)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#fff',
                          padding: 15,
                          font: {
                            size: 12,
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Henüz favori film yok
              </div>
            )}
          </div>

          {/* Monthly Activity */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Son 6 Ay Aktivite
            </h3>
            <div className="h-64">
              <Line
                data={{
                  labels: stats.monthlyActivity.map((m) => m.month),
                  datasets: [
                    {
                      label: 'Yorumlar',
                      data: stats.monthlyActivity.map((m) => m.count),
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#9ca3af',
                        stepSize: 1,
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                    x: {
                      ticks: {
                        color: '#9ca3af',
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Favorites Grid */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            {t('profile.myFavorites')}
          </h2>

          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/5">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">💔</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {t('profile.noFavorites')}
              </h3>
              <p className="text-gray-400 text-sm">
                {t('profile.noFavoritesDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favorites.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
