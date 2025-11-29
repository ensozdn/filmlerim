'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface Film {
  id: number;
  title: string;
  description: string;
  poster_url: string;
}

interface Comment {
  id: number;
  comment_text: string;
  rating: number;
  user_id: string;
  created_at: string;
  profiles: {
    email: string;
  };
  likes: Like[];
}

interface Like {
  id: number;
  comment_id: number;
  user_id: string;
}

interface Actor {
  name: string;
  role: string;
  image_url: string;
}

const MOCK_CAST: Record<string, Actor[]> = {
  'Inception': [
    { name: 'Leonardo DiCaprio', role: 'Cobb', image_url: 'https://image.tmdb.org/t/p/w200/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
    { name: 'Joseph Gordon-Levitt', role: 'Arthur', image_url: 'https://image.tmdb.org/t/p/w200/z2oXn0ASbfUTUR9fCsKhCTjY67T.jpg' },
    { name: 'Elliot Page', role: 'Ariadne', image_url: 'https://image.tmdb.org/t/p/w200/tp157uL7gV52I77XAgkQdGUM8q6.jpg' },
    { name: 'Tom Hardy', role: 'Eames', image_url: 'https://image.tmdb.org/t/p/w200/yVgfW4vQUIDYBTs9ViScj3n9cy.jpg' },
    { name: 'Cillian Murphy', role: 'Robert Fischer', image_url: 'https://image.tmdb.org/t/p/w200/2l91eErDNeMflSeA85F3zw0Q90O.jpg' },
  ],
  'Interstellar': [
    { name: 'Matthew McConaughey', role: 'Cooper', image_url: 'https://image.tmdb.org/t/p/w200/sY2m2EOzmzfe6hE7538NK80Jack.jpg' },
    { name: 'Anne Hathaway', role: 'Brand', image_url: 'https://image.tmdb.org/t/p/w200/tLelKoPNiyJCSEtQTz1ZFkjCZ7d.jpg' },
    { name: 'Jessica Chastain', role: 'Murph', image_url: 'https://image.tmdb.org/t/p/w200/adpp9yWdYx1XjY6b6s4g7qZ8ly.jpg' },
    { name: 'Michael Caine', role: 'Prof. Brand', image_url: 'https://image.tmdb.org/t/p/w200/klNx4Uqkr6CpzgTflOxdFnh3Xgu.jpg' },
  ],
  'The Dark Knight': [
    { name: 'Christian Bale', role: 'Bruce Wayne / Batman', image_url: 'https://image.tmdb.org/t/p/w200/b7fTC9OTJ6LfSaS570up8xQuyMY.jpg' },
    { name: 'Heath Ledger', role: 'Joker', image_url: 'https://image.tmdb.org/t/p/w200/5Y9Hn3nlb9gxD2x0uBvjWv0rKx.jpg' },
    { name: 'Michael Caine', role: 'Alfred', image_url: 'https://image.tmdb.org/t/p/w200/klNx4Uqkr6CpzgTflOxdFnh3Xgu.jpg' },
    { name: 'Gary Oldman', role: 'Gordon', image_url: 'https://image.tmdb.org/t/p/w200/2v9FVVBUrrkW2m3QOcYkuhqaOe1.jpg' },
  ],
  'Default': [
    { name: 'Brad Pitt', role: 'Lead Actor', image_url: 'https://image.tmdb.org/t/p/w200/cckcYc2v0yh1tc9QjRelptcOBko.jpg' },
    { name: 'Scarlett Johansson', role: 'Lead Actress', image_url: 'https://image.tmdb.org/t/p/w200/6NsMbJXRlDGC7yxlz4CiUhAWQQ.jpg' },
    { name: 'Morgan Freeman', role: 'Supporting Actor', image_url: 'https://image.tmdb.org/t/p/w200/oIciQWr8VwKoR8TmAw1owaiZFyb.jpg' },
    { name: 'Tom Hanks', role: 'Director', image_url: 'https://image.tmdb.org/t/p/w200/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg' },
  ]
};

export default function FilmDetailPage() {
  const [film, setFilm] = useState<Film | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<'to_watch' | 'watched' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const filmId = parseInt(params.id as string);

  // Ortalama puanı hesapla
  const averageRating =
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : 0;

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Filmi getir
      const { data: filmData } = await supabase
        .from('films')
        .select('*')
        .eq('id', filmId)
        .single();

      setFilm(filmData);

      // Yorumları getir (likes ile birlikte)
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(email), likes(id)')
        .eq('film_id', filmId)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);

      // Favoride olup olmadığını kontrol et
      const { data: favoriteData } = await supabase
        .from('favorites')
        .select('*')
        .eq('film_id', filmId)
        .eq('user_id', user.id)
        .single();

      setIsFavorite(!!favoriteData);

      // Check watchlist status
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('status')
        .eq('film_id', filmId)
        .eq('user_id', user.id)
        .single();

      setWatchlistStatus(watchlistData?.status || null);
      setLoading(false);
    };

    loadData();
  }, [filmId, router]);

  const validateComment = (): boolean => {
    if (!commentText.trim()) {
      setError('Yorum yazınız');
      return false;
    }
    if (commentText.trim().length < 3) {
      setError('Yorum en az 3 karakter olmalı');
      return false;
    }
    if (commentText.length > 500) {
      setError('Yorum en fazla 500 karakter olmalı');
      return false;
    }
    if (!rating || rating < 1 || rating > 5) {
      setError('Geçerli bir puan seçiniz (1-5)');
      return false;
    }
    return true;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateComment()) {
      return;
    }

    try {
      const { error } = await supabase.from('comments').insert([
        {
          film_id: filmId,
          user_id: user.id,
          comment_text: commentText.trim(),
          rating,
        },
      ]);

      if (error) {
        setError(error.message || 'Yorum eklenemedi');
      } else {
        setSuccess('Yorumunuz eklendi!');
        setCommentText('');
        setRating(5);
        // Yorumları yeniden yükle
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*, profiles(email), likes(id)')
          .eq('film_id', filmId)
          .order('created_at', { ascending: false });

        setComments(commentsData || []);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin');
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('film_id', filmId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('favorites').insert([
          {
            film_id: filmId,
            user_id: user.id,
          },
        ]);
      }

      setIsFavorite(!isFavorite);
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  const toggleWatchlist = async (status: 'to_watch' | 'watched') => {
    try {
      if (watchlistStatus === status) {
        // Remove from watchlist if same status clicked
        await supabase
          .from('watchlist')
          .delete()
          .eq('film_id', filmId)
          .eq('user_id', user.id);
        setWatchlistStatus(null);
      } else {
        // Upsert: insert or update
        const { error } = await supabase
          .from('watchlist')
          .upsert({
            user_id: user.id,
            film_id: filmId,
            status: status,
            watched_date: status === 'watched' ? new Date().toISOString() : null,
          }, {
            onConflict: 'user_id,film_id'
          });

        if (!error) {
          setWatchlistStatus(status);
        }
      }
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  const toggleLike = async (commentId: number) => {
    try {
      // Kullanıcının bu yoruma beğeni koyup koymadığını kontrol et
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Beğeni zaten var, kaldır
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Beğeni ekle
        await supabase.from('likes').insert([
          {
            comment_id: commentId,
            user_id: user.id,
          },
        ]);
      }

      // Yorumları yeniden yükle
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(email), likes(id)')
        .eq('film_id', filmId)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);
    } catch (err) {
      console.error('Like error:', err);
      setError('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="skeleton w-20 h-8"></div>
            <div className="skeleton w-48 h-10"></div>
            <div className="w-20"></div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 mb-8">
            <div className="flex gap-8">
              <div className="skeleton w-48 h-64"></div>
              <div className="flex-1 space-y-4">
                <div className="skeleton w-3/4 h-10"></div>
                <div className="skeleton w-1/2 h-8"></div>
                <div className="skeleton w-full h-20"></div>
                <div className="skeleton w-32 h-10"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 space-y-4">
                <div className="skeleton w-32 h-8"></div>
                <div className="skeleton w-full h-10"></div>
                <div className="skeleton w-full h-24"></div>
                <div className="skeleton w-full h-10"></div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="skeleton w-48 h-8 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 space-y-3">
                    <div className="skeleton w-32 h-5"></div>
                    <div className="skeleton w-full h-12"></div>
                    <div className="skeleton w-20 h-6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-lg">Film bulunamadı</p>
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
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Film Info */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 mb-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
          <div className="flex gap-8">
            {film.poster_url && (
              <img
                src={film.poster_url}
                alt={film.title}
                className="w-48 h-64 object-cover rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{film.title}</h1>
              <div className="flex items-center gap-3 mb-4 bg-gray-700/30 px-4 py-2 rounded-lg w-fit">
                <span className="text-yellow-400 text-lg">
                  {'⭐'.repeat(Math.round(Number(averageRating)))}
                </span>
                <span className="text-gray-300 text-sm font-semibold">
                  {averageRating} / 5 • {comments.length} yorum
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">{film.description}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleFavorite}
                  className={`${isFavorite
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/30'
                      : 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 shadow-lg shadow-pink-500/30'
                    } text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold`}
                >
                  {isFavorite ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
                </button>

                <button
                  onClick={() => toggleWatchlist('watched')}
                  className={`${watchlistStatus === 'watched'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-lg shadow-gray-500/30'
                    } text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold`}
                >
                  {watchlistStatus === 'watched' ? '✅ İzledim' : '👁️ İzledim Olarak İşaretle'}
                </button>

                <button
                  onClick={() => toggleWatchlist('to_watch')}
                  className={`${watchlistStatus === 'to_watch'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/30'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-lg shadow-gray-500/30'
                    } text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold`}
                >
                  {watchlistStatus === 'to_watch' ? '📌 İzleme Listemde' : '➕ İzleyeceğim'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Oyuncular
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {(MOCK_CAST[film.title] || MOCK_CAST['Default']).map((actor, index) => (
              <div key={index} className="min-w-[140px] snap-start group">
                <div className="w-32 h-32 md:w-40 md:h-40 mb-3 overflow-hidden rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-all shadow-lg">
                  <img
                    src={actor.image_url}
                    alt={actor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-white font-medium text-center truncate px-1 group-hover:text-blue-400 transition-colors">{actor.name}</h3>
                <p className="text-gray-500 text-xs text-center truncate px-1">{actor.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comments Form */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
              <h2 className="text-2xl font-bold text-white mb-6">Yorum Yap</h2>

              <form onSubmit={handleAddComment} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Puanla (1-5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {'⭐'.repeat(r)} {r}/5
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Yorumunuz
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Filmi nasıl buldunuz?"
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="animate-slide-in bg-red-500/15 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="font-semibold">Hata</p>
                      <p className="text-xs mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="animate-slide-in bg-green-500/15 border-l-4 border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-semibold">Başarılı</p>
                      <p className="text-xs mt-1">{success}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>

          {/* Comments List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">
              Yorumlar ({comments.length})
            </h2>
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-semibold">
                          {comment.profiles?.email}
                        </p>
                        <p className="text-yellow-400 text-sm mt-1">
                          {'⭐'.repeat(comment.rating)}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">{comment.comment_text}</p>
                    <button
                      onClick={() => toggleLike(comment.id)}
                      className={`text-sm font-semibold transition-all duration-300 px-3 py-1 rounded-lg ${comment.likes?.some((like) => like.user_id === user?.id)
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-red-400'
                        }`}
                    >
                      👍 {comment.likes?.length || 0}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
