'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_url: string;
    rating?: number;
    year?: number;
}

interface HeroSliderProps {
    films: Film[];
}

export default function HeroSlider({ films }: HeroSliderProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [showTrailer, setShowTrailer] = useState(false);

    const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

    useEffect(() => {
        if (films.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 8000); // Rotate every 8 seconds

        return () => clearInterval(interval);
    }, [films.length, currentIndex]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % films.length);
            setIsAnimating(false);
        }, 500); // Wait for fade out
    };

    const handleDotClick = (index: number) => {
        if (isAnimating || index === currentIndex) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsAnimating(false);
        }, 500);
    };

    const fetchTrailer = async (filmTitle: string) => {
        if (!TMDB_API_KEY) {
            console.error('TMDB API Key is missing');
            return;
        }
        
        try {
            const searchResponse = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(filmTitle)}&language=tr-TR`
            );
            const searchData = await searchResponse.json();
            
            if (searchData.results && searchData.results.length > 0) {
                const movieId = searchData.results[0].id;
                
                const videosResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=tr-TR`
                );
                const videosData = await videosResponse.json();
                
                const trailer = videosData.results?.find(
                    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
                );
                
                if (trailer) {
                    setTrailerKey(trailer.key);
                    setShowTrailer(true);
                } else {
                    console.log('No trailer found');
                }
            }
        } catch (error) {
            console.error('Trailer fetch error:', error);
        }
    };

    if (!films || films.length === 0) return null;

    const currentFilm = films[currentIndex];

    return (
        <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[400px] md:min-h-[500px] overflow-hidden group">
            {/* Background Image with Fade Transition */}
            <div
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
                {currentFilm.poster_url ? (
                    <img
                        src={currentFilm.poster_url}
                        alt={currentFilm.title}
                        className="w-full h-full object-cover object-top transform scale-105 animate-slow-zoom"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900" />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e27] via-[#0a0e27]/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-[#0a0e27]/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className={`relative z-10 h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-center transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div className="max-w-2xl space-y-3 md:space-y-6">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
                        {currentFilm.title}
                    </h1>

                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm lg:text-base">
                        <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded text-yellow-400 border border-yellow-500/30">
                            <span>★</span>
                            <span className="font-bold">{currentFilm.rating || '7.8'}</span>
                        </div>
                        <span className="text-gray-300">{currentFilm.year || '2024'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-300 hidden sm:inline">Bilim Kurgu</span>
                    </div>

                    <p className="text-sm md:text-base lg:text-lg text-gray-200 line-clamp-2 md:line-clamp-3 drop-shadow-md max-w-xl">
                        {currentFilm.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                        <button
                            onClick={() => fetchTrailer(currentFilm.title)}
                            className="px-6 md:px-8 py-3 md:py-3.5 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10 text-sm md:text-base"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Fragman İzle
                        </button>

                        <button
                            onClick={() => router.push(`/film/${currentFilm.id}`)}
                            className="px-6 md:px-8 py-3 md:py-3.5 bg-gray-600/40 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-600/60 transition-all transform hover:scale-105 text-sm md:text-base"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Detaylar
                        </button>
                    </div>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                {films.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-white w-8'
                                : 'bg-white/30 hover:bg-white/50'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

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
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
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
