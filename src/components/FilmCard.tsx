'use client';

import { useRouter } from 'next/navigation';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_url: string;
    genres?: string[];
    average_rating?: number;
    comment_count?: number;
}

interface FilmCardProps {
    film: Film;
}

export default function FilmCard({ film }: FilmCardProps) {
    const router = useRouter();

    return (
        <div
            className="group relative bg-[#1a1f35] dark:bg-[#1a1f35] light:bg-white rounded-xl md:rounded-2xl overflow-hidden border border-white/5 dark:border-white/5 light:border-gray-200 hover:border-blue-500/30 dark:hover:border-blue-500/30 light:hover:border-blue-400 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 active:scale-95"
            onClick={() => router.push(`/film/${film.id}`)}
        >
            {/* Image Container */}
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-900 dark:bg-gray-900 light:bg-gray-200">
                {film.poster_url ? (
                    <img
                        src={film.poster_url}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 dark:bg-gray-800 light:bg-gray-300 text-gray-600 dark:text-gray-600 light:text-gray-400">
                        <span className="text-4xl">🎬</span>
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t dark:from-[#1a1f35] dark:via-transparent from-white/40 via-white/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

                {/* Rating Badge */}
                {film.average_rating && film.average_rating > 0 && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-yellow-500/90 dark:bg-yellow-500/90 light:bg-yellow-400 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-900 dark:text-yellow-900 light:text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-bold text-yellow-900 dark:text-yellow-900 light:text-yellow-700">{film.average_rating.toFixed(1)}</span>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t dark:from-[#1a1f35] dark:via-[#1a1f35]/95 from-white via-white/95 to-transparent">
                <h3 className="text-white dark:text-white light:text-gray-900 font-bold text-base md:text-lg truncate group-hover:text-blue-400 dark:group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors duration-300">
                    {film.title}
                </h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs md:text-sm line-clamp-2 mt-1 md:mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                    {film.description}
                </p>

                {/* Genre Tags */}
                {film.genres && film.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {film.genres.slice(0, 2).map((genre, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 dark:bg-blue-500/20 light:bg-blue-100 text-blue-300 dark:text-blue-300 light:text-blue-700 border border-blue-500/30 dark:border-blue-500/30 light:border-blue-300">
                                {genre}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/5 dark:border-white/5 light:border-gray-200 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="text-xs text-blue-400 dark:text-blue-400 light:text-blue-600 font-medium flex items-center gap-1">
                        İncele
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}
