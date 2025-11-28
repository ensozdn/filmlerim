'use client';

import { useRouter } from 'next/navigation';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_url: string;
}

interface FilmCardProps {
    film: Film;
}

export default function FilmCard({ film }: FilmCardProps) {
    const router = useRouter();

    return (
        <div
            className="group relative bg-[#1a1f35] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
            onClick={() => router.push(`/film/${film.id}`)}
        >
            {/* Image Container */}
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
                {film.poster_url ? (
                    <img
                        src={film.poster_url}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                        <span className="text-4xl">🎬</span>
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f35] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-[#1a1f35] via-[#1a1f35]/95 to-transparent">
                <h3 className="text-white font-bold text-lg truncate group-hover:text-blue-400 transition-colors duration-300">
                    {film.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                    {film.description}
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
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
