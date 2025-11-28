'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface UserStats {
  favoriteCount: number;
  commentCount: number;
  averageRating: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    favoriteCount: 0,
    commentCount: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Favorileri say
      const { data: favorites } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id);

      // Yorumları say
      const { data: comments } = await supabase
        .from('comments')
        .select('rating')
        .eq('user_id', user.id);

      const avgRating =
        comments && comments.length > 0
          ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
          : 0;

      setStats({
        favoriteCount: favorites?.length || 0,
        commentCount: comments?.length || 0,
        averageRating: Number(avgRating),
      });

      setLoading(false);
    };

    loadUserData();
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
          <div className="skeleton w-full h-64 rounded-2xl"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-2"
          >
            ← Geri
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Filmlerim.iO
          </h1>
          <div className="flex items-center gap-4">
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

      <main className="max-w-7xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">👤</span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Profil</h2>
              <p className="text-gray-400 text-lg mb-4">{user?.email}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-gray-700/30 px-4 py-2 rounded-lg">
                  <p className="text-gray-400 text-sm">Üyelik Tarihi</p>
                  <p className="text-white font-semibold">
                    {new Date(user?.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-gray-700/30 px-4 py-2 rounded-lg">
                  <p className="text-gray-400 text-sm">Son Giriş</p>
                  <p className="text-white font-semibold">
                    {new Date(user?.last_sign_in_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Favorites */}
          <div className="bg-gradient-to-br from-pink-800 to-pink-900 rounded-2xl p-6 border border-pink-700 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Favorilerim</h3>
              <span className="text-3xl">❤️</span>
            </div>
            <p className="text-5xl font-bold text-pink-300 mb-2">{stats.favoriteCount}</p>
            <p className="text-pink-200 text-sm">Favori filme eklendi</p>
          </div>

          {/* Comments */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 border border-blue-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Yorumlar</h3>
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-5xl font-bold text-blue-300 mb-2">{stats.commentCount}</p>
            <p className="text-blue-200 text-sm">Yorum yapıldı</p>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-2xl p-6 border border-yellow-700 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Ortalama Puan</h3>
              <span className="text-3xl">⭐</span>
            </div>
            <p className="text-5xl font-bold text-yellow-300 mb-2">
              {stats.averageRating > 0 ? stats.averageRating : '-'}
            </p>
            <p className="text-yellow-200 text-sm">
              {stats.averageRating > 0 ? 'Ortalama puan' : 'Henüz puan verilmedi'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6">İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🎬 Tüm Filmler
            </button>
            <button
              onClick={() => router.push('/favorites')}
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ❤️ Favorilerim
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
