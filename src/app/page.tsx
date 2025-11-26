'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-white mb-4">Filmlerim.iO</h1>
        <p className="text-xl text-gray-400 mb-8">
          Sevdiğin filmleri paylaş, yorum yap ve puanla
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Giriş Yap
          </a>
          <a
            href="/signup"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Kayıt Ol
          </a>
        </div>
      </div>
    </div>
  );
}
