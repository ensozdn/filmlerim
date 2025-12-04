'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function SignupPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.emailInvalid'));
      return false;
    }
    if (!password) {
      setError(t('auth.passwordRequired'));
      return false;
    }
    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return false;
    }
    if (!confirmPassword) {
      setError(t('auth.passwordRequired'));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message || t('auth.signupFailed'));
      } else {
        setSuccess(t('auth.signupSuccess'));
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError(t('auth.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black from-gray-100 via-gray-50 to-white flex items-center justify-center p-4">
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 from-white to-gray-50 rounded-2xl shadow-2xl dark:shadow-purple-500/10 light:shadow-gray-400/20 p-8 border dark:border-gray-700 light:border-gray-200 hover:border-purple-500 dark:hover:border-purple-500 light:hover:border-purple-400 transition-colors">
          <h1 className="text-3xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Filmlerim.iO
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-700 mb-8 font-light">{t('auth.signup')}</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm font-medium mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 dark:bg-gray-700/50 light:bg-gray-100 border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm font-medium mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 dark:bg-gray-700/50 light:bg-gray-100 border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm font-medium mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 dark:bg-gray-700/50 light:bg-gray-100 border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="animate-slide-in bg-red-500/15 dark:bg-red-500/15 light:bg-red-100 border-l-4 border-red-500 dark:border-red-500 light:border-red-400 text-red-400 dark:text-red-400 light:text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold">{t('auth.error')}</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="animate-slide-in bg-green-500/15 dark:bg-green-500/15 light:bg-green-100 border-l-4 border-green-500 dark:border-green-500 light:border-green-400 text-green-400 dark:text-green-400 light:text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-semibold">{t('auth.success')}</p>
                  <p className="text-xs mt-1">{success}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r dark:from-purple-600 dark:to-purple-700 light:from-purple-500 light:to-purple-600 dark:hover:from-purple-500 dark:hover:to-purple-600 light:hover:from-purple-400 light:hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white dark:text-white light:text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {loading ? t('auth.signingUp') : t('auth.signup')}
            </button>
          </form>

          <p className="text-center text-gray-400 dark:text-gray-400 light:text-gray-700 text-sm mt-6">
            {t('auth.haveAccount')}{' '}
            <a href="/login" className="text-purple-400 dark:text-purple-400 light:text-purple-600 hover:text-purple-300 dark:hover:text-purple-300 light:hover:text-purple-500 font-semibold transition-colors">
              {t('auth.login')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
