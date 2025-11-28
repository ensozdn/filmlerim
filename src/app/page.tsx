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
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Filmlerim.iO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Giriş Yap
          </a>
          <a
            href="/signup"
            className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
          >
            Kayıt Ol
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-300">Yeni Nesil Film Platformu</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
            Sinema Dünyasını
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Keşfet ve Paylaş
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          İzlediğin filmleri listele, favorilerini oluştur ve sinema tutkunlarıyla etkileşime geç. 
          Modern arayüz ile film deneyimini bir üst seviyeye taşı.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <a
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Hemen Başla
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="#features"
            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center"
          >
            Daha Fazla Bilgi
          </a>
        </div>

        {/* Floating UI Elements (Decorative) */}
        <div className="absolute top-1/2 left-10 hidden lg:block animate-float">
          <div className="p-4 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform -rotate-6">
            <div className="w-12 h-16 bg-gray-800 rounded mb-2 animate-pulse"></div>
            <div className="w-24 h-2 bg-gray-700 rounded mb-1"></div>
            <div className="w-16 h-2 bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="absolute bottom-20 right-10 hidden lg:block animate-float" style={{ animationDelay: '2s' }}>
          <div className="p-4 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform rotate-6">
            <div className="flex gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-700"></div>
              <div className="space-y-1">
                <div className="w-20 h-2 bg-gray-700 rounded"></div>
                <div className="w-12 h-2 bg-gray-800 rounded"></div>
              </div>
            </div>
            <div className="w-32 h-2 bg-blue-500/50 rounded"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
