'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Admin kontrolü
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(user);
      await loadFilms();
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const loadFilms = async () => {
    const { data } = await supabase.from('films').select('*');
    setFilms(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description) {
      setError('Başlık ve açıklama gerekli');
      return;
    }

    try {
      if (editingId) {
        // Güncelle
        const { error } = await supabase
          .from('films')
          .update({
            title,
            description,
            poster_url: posterUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) {
          setError(error.message);
        } else {
          setSuccess('Film başarıyla güncellendi!');
          resetForm();
          await loadFilms();
        }
      } else {
        // Yeni ekle
        const { error } = await supabase.from('films').insert([
          {
            title,
            description,
            poster_url: posterUrl,
          },
        ]);

        if (error) {
          setError(error.message);
        } else {
          setSuccess('Film başarıyla eklendi!');
          resetForm();
          await loadFilms();
        }
      }
    } catch (err) {
      setError('Bir hata oluştu');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Paneli</h1>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Kullanıcı Paneli
            </a>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? 'Filmi Düzenle' : 'Yeni Film Ekle'}
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
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

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {editingId ? 'Güncelle' : 'Ekle'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors"
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
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Filmler</h2>
              {films.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Henüz film eklenmemiş.</p>
              ) : (
                <div className="space-y-4">
                  {films.map((film) => (
                    <div
                      key={film.id}
                      className="bg-gray-700 rounded-lg p-4 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{film.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {film.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(film)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(film.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Sil
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
