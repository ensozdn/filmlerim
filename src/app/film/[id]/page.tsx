'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

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
  likes: number;
  user_id: string;
  created_at: string;
  profiles: {
    email: string;
  };
}

export default function FilmDetailPage() {
  const [film, setFilm] = useState<Film | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const filmId = parseInt(params.id as string);

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

      // Yorumları getir
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(email)')
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
      setLoading(false);
    };

    loadData();
  }, [filmId, router]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!commentText) {
      setError('Yorum yazınız');
      return;
    }

    try {
      const { error } = await supabase.from('comments').insert([
        {
          film_id: filmId,
          user_id: user.id,
          comment_text: commentText,
          rating,
        },
      ]);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Yorumunuz eklendi!');
        setCommentText('');
        setRating(5);
        // Yorumları yeniden yükle
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*, profiles(email)')
          .eq('film_id', filmId)
          .order('created_at', { ascending: false });

        setComments(commentsData || []);
      }
    } catch (err) {
      setError('Bir hata oluştu');
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

  const likesComment = async (commentId: number, currentLikes: number) => {
    try {
      await supabase
        .from('comments')
        .update({ likes: currentLikes + 1 })
        .eq('id', commentId);

      // Yorumları yeniden yükle
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(email)')
        .eq('film_id', filmId)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-lg">Yükleniyor...</p>
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
      <header className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-500 hover:text-blue-400"
          >
            ← Geri
          </button>
          <h1 className="text-3xl font-bold text-white">Filmlerim.iO</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Film Info */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <div className="flex gap-8">
            {film.poster_url && (
              <img
                src={film.poster_url}
                alt={film.title}
                className="w-48 h-64 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">{film.title}</h1>
              <p className="text-gray-300 mb-6">{film.description}</p>
              <button
                onClick={toggleFavorite}
                className={`${
                  isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                } text-white px-6 py-2 rounded-lg transition-colors font-medium`}
              >
                {isFavorite ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comments Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-6">
              <h2 className="text-2xl font-bold text-white mb-6">Yorum Yap</h2>

              <form onSubmit={handleAddComment} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Puanla (1-5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Filmi nasıl buldunuz?"
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
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
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">
                          {comment.profiles?.email}
                        </p>
                        <p className="text-yellow-500">
                          {'⭐'.repeat(comment.rating)}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <p className="text-gray-300 mb-4">{comment.comment_text}</p>
                    <button
                      onClick={() => likesComment(comment.id, comment.likes)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                    >
                      👍 {comment.likes}
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
