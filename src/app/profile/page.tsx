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
}

interface UserStats {
  totalFavorites: number;
  totalComments: number;
  averageRating: number;
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
    averageRating: 0,
  });
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

      // Get favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('films(*)')
        .eq('user_id', user.id);

      const films = favoritesData?.map((fav: any) => fav.films) || [];
      setFavorites(films);

      // Get comments count and average rating
      const { data: commentsData } = await supabase
        .from('comments')
        .select('rating')
        .eq('user_id', user.id);

      const totalComments = commentsData?.length || 0;
      const averageRating =
        totalComments > 0
          ? commentsData!.reduce((sum, c) => sum + c.rating, 0) / totalComments
          : 0;

      setStats({
        totalFavorites: films.length,
        totalComments,
        averageRating: parseFloat(averageRating.toFixed(1)),
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
    <div className="min-h-screen bg-[#0a0e27] text-white">
      <DashboardHeader userEmail={user?.email} isAdmin={isAdmin} />

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-12">
        {/* Profile Header */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-white/10">
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
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.email}
              </h1>
              {profile?.bio && (
                <p className="text-gray-400 text-sm">{profile.bio}</p>
              )}
              <div className="flex gap-4 mt-3">
                <div className="text-sm">
                  <span className="text-gray-500">Üyelik: </span>
                  <span className="text-gray-300">
                    {new Date(user?.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <p className="text-blue-300 text-sm font-medium">Favoriler</p>
                <p className="text-3xl font-bold text-white">{stats.totalFavorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Yorumlar</p>
                <p className="text-3xl font-bold text-white">{stats.totalComments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-yellow-300 text-sm font-medium">Ortalama Puan</p>
                <p className="text-3xl font-bold text-white">
                  {stats.averageRating > 0 ? stats.averageRating : '-'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Favorites Grid */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            Favori Filmlerim
          </h2>

          {favorites.length === 0 ? (
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
