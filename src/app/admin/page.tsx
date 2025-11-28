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

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      await loadFilms();
      setLoading(false);
    };

    getUser();
  }, [router]);

  const loadFilms = async () => {
    const { data } = await supabase.from('films').select('*');
    setFilms(data || []);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Film başlığı gerekli');
      return false;
    }
    if (title.length < 2) {
      setError('Film başlığı en az 2 karakter olmalı');
      return false;
    }
    if (title.length > 100) {
      setError('Film başlığı en fazla 100 karakter olmalı');
      return false;
    }
    if (!description.trim()) {
      setError('Film açıklaması gerekli');
      return false;
    }
    if (description.length < 10) {
      setError('Film açıklaması en az 10 karakter olmalı');
      return false;
    }
    if (description.length > 1000) {
      setError('Film açıklaması en fazla 1000 karakter olmalı');
      return false;
    }
    if (posterUrl && !/^https?:\/\/.+/.test(posterUrl)) {
      setError('Geçerli bir poster URL girin (http:// veya https:// ile başlamalı)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        // Güncelle
        const { error } = await supabase
          .from('films')
          .update({
            title: title.trim(),
            description: description.trim(),
            poster_url: posterUrl.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) {
          setError(error.message || 'Güncelleme başarısız oldu');
        } else {
          setSuccess('Film başarıyla güncellendi!');
          resetForm();
          await loadFilms();
        }
      } else {
        // Yeni ekle
        const { error } = await supabase.from('films').insert([
          {
            title: title.trim(),
            description: description.trim(),
            poster_url: posterUrl.trim() || null,
          },
        ]);

        if (error) {
          setError(error.message || 'Ekleme başarısız oldu');
        } else {
          setSuccess('Film başarıyla eklendi!');
          resetForm();
          await loadFilms();
        }
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin');
    }
  };

  const handleEdit = (film: Film) => {
    setTitle(film.title);
    setDescription(film.description);
    setPosterUrl(film.poster_url || '');
    setEditingId(film.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu filmi silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase.from('films').delete().eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Film başarıyla silindi!');
        await loadFilms();
      }
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPosterUrl('');
    setEditingId(null);
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 space-y-4">
                <div className="skeleton w-32 h-8"></div>
                <div className="skeleton w-full h-10"></div>
                <div className="skeleton w-full h-10"></div>
                <div className="skeleton w-full h-24"></div>
                <div className="skeleton w-full h-10"></div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 space-y-3">
                <div className="skeleton w-32 h-8 mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton w-full h-20"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ⚙️ Admin Paneli
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Kullanıcı Paneli
            </a>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? '✏️ Filmi Düzenle' : '➕ Yeni Film Ekle'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Film başlığı"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Film açıklaması"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Poster URL
                  </label>
                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="https://..."
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

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {editingId ? 'Güncelle' : 'Ekle'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Films List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
              <h2 className="text-2xl font-bold text-white mb-6">📽️ Filmler ({films.length})</h2>
              {films.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Henüz film eklenmemiş.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {films.map((film) => (
                    <div
                      key={film.id}
                      className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg p-4 flex justify-between items-start border border-gray-600 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-bold hover:text-purple-400 transition-colors">
                          {film.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                          {film.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(film)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(film.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
