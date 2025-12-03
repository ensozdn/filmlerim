'use client';

import { useRef } from 'react';
import FilmCard from './FilmCard';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_url: string;
}

interface FilmCarouselProps {
    title: string;
    films: Film[];
}

export default function FilmCarousel({ title, films }: FilmCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300; // Adjust scroll amount as needed
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const targetScroll = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    if (films.length === 0) return null;

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    {title}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-30"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scroll Container with Fade Effects */}
            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-5 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {films.map((film) => (
                        <div key={film.id} className="min-w-[200px] md:min-w-[240px] snap-start">
                            <FilmCard film={film} />
                        </div>
                    ))}
                </div>

                {/* Fade effects on sides - Only on scroll area */}
                <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#0a0e27] to-transparent pointer-events-none z-10"></div>
                <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#0a0e27] to-transparent pointer-events-none z-10"></div>
            </div>
        </div>
    );
}
