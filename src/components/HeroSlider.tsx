'use client';

import { useRouter } from 'next/navigation';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_url: string;
    rating?: number; // Optional for now
    year?: number;   // Optional for now
}

interface HeroSliderProps {
    film: Film;
}

export default function HeroSlider({ film }: HeroSliderProps) {
    const router = useRouter();

    if (!film) return null;

    return (
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                {film.poster_url ? (
                    <img
                        src={film.poster_url}
                        alt={film.title}
                        className="w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900" />
                )}
                {/* Gradient Overlay - Left and Bottom */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e27] via-[#0a0e27]/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-[#0a0e27]/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
                <div className="max-w-2xl space-y-6 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg">
                        {film.title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm md:text-base">
                        <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded text-yellow-400 border border-yellow-500/30">
                            <span>★</span>
                            <span className="font-bold">{film.rating || '7.8'}</span>
                        </div>
                        <span className="text-gray-300">{film.year || '2024'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-300">Bilim Kurgu</span>
                    </div>

                    <p className="text-lg text-gray-200 line-clamp-3 drop-shadow-md max-w-xl">
                        {film.description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            className="px-8 py-3.5 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Fragman İzle
                        </button>

                        <button
                            onClick={() => router.push(`/film/${film.id}`)}
                            className="px-8 py-3.5 bg-gray-600/40 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-600/60 transition-all transform hover:scale-105"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Detaylar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
