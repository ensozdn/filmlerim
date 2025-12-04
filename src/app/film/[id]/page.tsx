'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import FilmCard from '@/components/FilmCard';
import StarRating from '@/components/StarRating';

interface Film {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genres?: string[];
  average_rating?: number;
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

// Helper function for relative time
function getRelativeTime(dateString: string, t: any) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t('film.justNow');
  if (diffInSeconds < 3600) return t('film.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
  if (diffInSeconds < 86400) return t('film.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
  if (diffInSeconds < 604800) return t('film.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
  return date.toLocaleDateString('tr-TR');
}

// Helper for avatar color
function getAvatarColor(email: string) {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function FilmDetailPage() {
  const [film, setFilm] = useState<Film | null>(null);
  const [relatedFilms, setRelatedFilms] = useState<Film[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [processingLikes, setProcessingLikes] = useState<Set<number>>(new Set());
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<'to_watch' | 'watched' | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const { showToast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const filmId = parseInt(params.id as string);

  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Image';
    e.currentTarget.onerror = null; // Prevent infinite loop
  };


  const averageRating = comments.length > 0
    ? (comments.reduce((acc, comment) => acc + comment.rating, 0) / comments.length).toFixed(1)
    : 'N/A';

  // Fetch trailer from TMDB
  const fetchTrailer = async (filmTitle: string) => {
    console.log('🎬 Fetching trailer for:', filmTitle);
    console.log('🔑 TMDB API Key:', TMDB_API_KEY ? 'Exists' : 'Missing');
    
    if (!TMDB_API_KEY) {
      console.error('❌ TMDB API Key is missing!');
      return;
    }
    
    try {
      // Search for movie
      console.log('🔍 Searching movie...');
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(filmTitle)}&language=tr-TR`
      );
      const searchData = await searchResponse.json();
      console.log('📦 Search results:', searchData);
      
      if (searchData.results && searchData.results.length > 0) {
        const movieId = searchData.results[0].id;
        console.log('🎥 Movie ID:', movieId);
        
        // Get videos
        const videosResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        const videosData = await videosResponse.json();
        console.log('🎞️ Videos data:', videosData);
        
        // Find trailer
        const trailer = videosData.results?.find(
          (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (trailer) {
          console.log('✅ Trailer found:', trailer.key);
          setTrailerKey(trailer.key);
        } else {
          console.log('⚠️ No trailer found');
        }
      } else {
        console.log('⚠️ No search results');
      }
    } catch (error) {
      console.error('❌ Trailer fetch error:', error);
    }
  };

  const fetchFilmDetails = async () => {
    setLoading(true);
    try {
      const { data: filmData, error: filmError } = await supabase
        .from('films')
        .select('*')
        .eq('id', filmId)
        .single();

      if (filmError) throw filmError;
      setFilm(filmData);

      // Fetch related films
      let relatedQuery = supabase
        .from('films')
        .select('*')
        .neq('id', filmId);

      if (filmData.genres && filmData.genres.length > 0) {
        relatedQuery = relatedQuery.overlaps('genres', filmData.genres);
      }

      const { data: relatedData } = await relatedQuery.limit(4);
      setRelatedFilms(relatedData || []);

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*, profiles(email), likes(id, user_id)') // Select user_id for likes
        .eq('film_id', filmId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      setUser(userData.user);

      if (userData.user) {
        // Check if admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();

        // if (profileError && profileError.code !== 'PGRST116') {
        //   console.error('Error fetching profile:', profileError);
        // }
        setIsAdmin(profileData?.role === 'admin');

        // Check favorite status
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('film_id', filmId)
          .single();
        setIsFavorite(!!favoriteData);

        // Check watchlist status
        const { data: watchlistData } = await supabase
          .from('watchlist')
          .select('status')
          .eq('user_id', userData.user.id)
          .eq('film_id', filmId)
          .single();
        setWatchlistStatus(watchlistData?.status || null);
      }
      
      // Fetch trailer
      if (filmData.title) {
        fetchTrailer(filmData.title);
      }
    } catch (error: any) {
      console.error('Error fetching film details:', error.message);
      showToast('Film detayları yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filmId) {
      fetchFilmDetails();
    }
  }, [filmId]);

  const validateComment = (): boolean => {
    if (!commentText.trim()) {
      showToast('Lütfen bir yorum yazın', 'warning');
      return false;
    }
    if (commentText.trim().length < 3) {
      showToast('Yorum en az 3 karakter olmalı', 'warning');
      return false;
    }
    if (commentText.length > 500) {
      showToast('Yorum en fazla 500 karakter olmalı', 'warning');
      return false;
    }
    return true;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateComment()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('comments').insert([
        {
          film_id: filmId,
          user_id: user.id,
          comment_text: commentText.trim(),
          rating,
        },
      ]);

      if (error) throw error;

      showToast('Yorumunuz başarıyla eklendi!', 'success');
      setCommentText('');
      setRating(5);

      // Refresh comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(email), likes(id)')
        .eq('film_id', filmId)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);
    } catch (err) {
      showToast('Yorum eklenirken bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      showToast('Yorum silindi', 'success');
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      showToast('Yorum silinirken hata oluştu', 'error');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.comment_text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editCommentText.trim()) {
      showToast('Yorum boş olamaz', 'warning');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ comment_text: editCommentText.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      showToast(t('film.commentUpdated'), 'success');

      // Update local state
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, comment_text: editCommentText.trim() } : c
      ));

      cancelEditing();
    } catch (err) {
      showToast(t('film.commentUpdateError'), 'error');
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
      showToast(t('film.errorOccurred'), 'error');
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
      showToast(t('film.errorOccurred'), 'error');
    }
  };

  const toggleLike = async (commentId: number) => {
    if (processingLikes.has(commentId)) return;

    // Add to processing set
    setProcessingLikes(prev => new Set(prev).add(commentId));

    try {
      // Optimistic UI update
      const isLiked = comments.find(c => c.id === commentId)?.likes.some(l => l.user_id === user.id);

      // Update UI immediately
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: isLiked
              ? c.likes.filter(l => l.user_id !== user.id)
              : [...c.likes, { id: Date.now(), comment_id: commentId, user_id: user.id }]
          };
        }
        return c;
      }));

      // Perform actual request
      if (isLiked) {
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .single();

        if (existingLike) {
          await supabase.from('likes').delete().eq('id', existingLike.id);
        }
      } else {
        // Check if already liked to prevent duplicates (double safety)
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .single();

        if (!existingLike) {
          await supabase.from('likes').insert([{ comment_id: commentId, user_id: user.id }]);
        }
      }

      // Re-fetch to sync exact state
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(email), likes(id, user_id)')
        .eq('film_id', filmId)
        .order('created_at', { ascending: false });

      if (commentsData) setComments(commentsData);

    } catch (err) {
      console.error('Like error:', err);
      showToast('Bir hata oluştu', 'error');
      // Revert optimistic update could be added here
    } finally {
      // Remove from processing set
      setProcessingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] dark:bg-[#0a0e27] light:bg-white">
        <div className="h-20 border-b border-white/5 dark:border-white/5 light:border-gray-200 bg-[#0a0e27]/80 dark:bg-[#0a0e27]/80 light:bg-white/80 backdrop-blur-xl"></div>
        <main className="max-w-7xl mx-auto p-6">
          <div className="bg-white/5 dark:bg-white/5 light:bg-gray-100 rounded-2xl p-8 border border-white/5 dark:border-white/5 light:border-gray-200 mb-8">
            <div className="flex gap-8">
              <div className="skeleton w-48 h-64 bg-white/5 dark:bg-white/5 light:bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-4">
                <div className="skeleton w-3/4 h-10 bg-white/5 dark:bg-white/5 light:bg-gray-200 rounded"></div>
                <div className="skeleton w-1/2 h-8 bg-white/5 rounded"></div>
                <div className="skeleton w-full h-20 bg-white/5 rounded"></div>
                <div className="skeleton w-32 h-10 bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen bg-[#0a0e27] dark:bg-[#0a0e27] light:bg-white flex items-center justify-center">
        <p className="text-white dark:text-white light:text-gray-900 text-lg">Film bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] dark:bg-[#0a0e27] light:bg-white text-white dark:text-white light:text-gray-900">
      <DashboardHeader userEmail={user?.email} isAdmin={isAdmin} />

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Film Info */}
        <div className="bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 from-gray-200 to-gray-300 rounded-xl md:rounded-2xl p-4 md:p-8 border dark:border-gray-700 light:border-gray-400 mb-6 md:mb-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {film.poster_url && (
              <img
                src={film.poster_url}
                alt={film.title}
                onError={handleImageError}
                className="w-full md:w-48 h-auto md:h-64 object-cover rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{film.title}</h1>
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 bg-gray-700/30 px-3 md:px-4 py-2 rounded-lg w-fit">
                <span className="text-yellow-400 text-base md:text-lg">
                  {'⭐'.repeat(Math.round(Number(averageRating)))}
                </span>
                <span className="text-gray-300 text-xs md:text-sm font-semibold">
                  {t('film.averageRating', { rating: averageRating, count: comments.length })}
                </span>
              </div>
              <p className="text-gray-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">{film.description}</p>
              
              {/* Trailer Button */}
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="mb-4 px-4 md:px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg shadow-red-500/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  🎬 Fragman İzle
                </button>
              )}
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
                <button
                  onClick={toggleFavorite}
                  className={`${isFavorite
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/30'
                    : 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 shadow-lg shadow-pink-500/30'
                    } text-white px-4 md:px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm md:text-base w-full sm:w-auto text-center`}
                >
                  {isFavorite ? t('film.removeFromFavorites') : t('film.addToFavorites')}
                </button>

                <button
                  onClick={() => toggleWatchlist('watched')}
                  className={`${watchlistStatus === 'watched'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-lg shadow-gray-500/30'
                    } text-white px-4 md:px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm md:text-base w-full sm:w-auto text-center`}
                >
                  {watchlistStatus === 'watched' ? t('film.watched') : t('film.markAsWatched')}
                </button>

                <button
                  onClick={() => toggleWatchlist('to_watch')}
                  className={`${watchlistStatus === 'to_watch'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/30'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-lg shadow-gray-500/30'
                    } text-white px-4 md:px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm md:text-base w-full sm:w-auto text-center`}
                >
                  {watchlistStatus === 'to_watch' ? t('film.inWatchlist') : t('film.addToWatchlist')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            {t('film.cast')}
          </h2>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {(MOCK_CAST[film.title] || MOCK_CAST['Default']).map((actor, index) => (
              <div key={index} className="min-w-[120px] md:min-w-[140px] snap-start group">
                <div className="w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 mb-2 md:mb-3 overflow-hidden rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-all shadow-lg">
                  <img
                    src={actor.image_url}
                    alt={actor.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-white font-medium text-center text-sm md:text-base truncate px-1 group-hover:text-blue-400 transition-colors">{actor.name}</h3>
                <p className="text-gray-500 text-xs text-center truncate px-1">{actor.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Films */}
        {relatedFilms.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
              {t('film.relatedFilms')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedFilms.map((relatedFilm) => (
                <FilmCard key={relatedFilm.id} film={relatedFilm} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comments Form */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
              <h2 className="text-2xl font-bold text-white mb-6">{t('film.addComment')}</h2>

              <form onSubmit={handleAddComment} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-4">
                    {t('film.rating')}
                  </label>
                  <StarRating 
                    rating={rating} 
                    onRatingChange={setRating}
                    size="md"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    {t('film.yourComment')}
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder={t('film.commentPlaceholder')}
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? t('film.sending') : t('film.send')}
                </button>
              </form>
            </div>
          </div>

          {/* Comments List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">
              {t('film.commentsCount', { count: comments.length })}
            </h2>
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {t('film.noComments')}
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${getAvatarColor(comment.profiles?.email || '')}`}>
                          {(comment.profiles?.email || '?').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-white font-semibold text-sm">
                            {comment.profiles?.email.split('@')[0]}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-yellow-400 text-xs">
                              {'⭐'.repeat(comment.rating)}
                            </p>
                            <span className="text-gray-600 text-xs">•</span>
                            <p className="text-gray-500 text-xs">
                              {getRelativeTime(comment.created_at, t)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {user?.id === comment.user_id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(comment)}
                            className="text-gray-500 hover:text-blue-400 transition-colors p-1 hover:bg-white/5 rounded-lg"
                            title={t('film.editComment')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1 hover:bg-white/5 rounded-lg"
                            title={t('film.deleteComment')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="mb-4">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none mb-2"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            {t('film.cancelEdit')}
                          </button>
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                          >
                            {t('film.saveComment')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300 mb-4 leading-relaxed text-sm">{comment.comment_text}</p>
                    )}

                    <button
                      onClick={() => toggleLike(comment.id)}
                      className={`text-xs font-semibold transition-all duration-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${comment.likes?.some((like) => like.user_id === user?.id)
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                    >
                      <svg className={`w-4 h-4 ${comment.likes?.some((like) => like.user_id === user?.id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {comment.likes?.length || 0}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* YouTube Embed */}
            <iframe
              className="w-full h-full rounded-xl shadow-2xl"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Film Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
