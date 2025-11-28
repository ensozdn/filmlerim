'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const MOCK_FILMS = [
    {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        poster_url: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
    },
    {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniL6E77NI6lCU6MxlNBvIx.jpg'
    },
    {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    },
    {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
        poster_url: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'
    },
    {
        title: 'Oppenheimer',
        description: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
        poster_url: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
    },
    {
        title: 'The Matrix',
        description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
        poster_url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpQUk5H.jpg'
    },
    {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'
    },
    {
        title: 'Fight Club',
        description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
        poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
    },
    {
        title: 'Forrest Gump',
        description: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
        poster_url: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg'
    },
    {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        poster_url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
    },
    {
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        poster_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg'
    },
    {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        poster_url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
    },
    {
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
        poster_url: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg'
    },
    {
        title: 'Joker',
        description: 'During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.',
        poster_url: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg'
    },
    {
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
    },
    {
        title: 'Whiplash',
        description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
        poster_url: 'https://image.tmdb.org/t/p/w500/6uSPcdGNA2A6vJmCagXlhp91T61.jpg'
    },
    {
        title: 'The Grand Budapest Hotel',
        description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.',
        poster_url: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg'
    },
    {
        title: 'Blade Runner 2049',
        description: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
        poster_url: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg'
    },
    {
        title: 'Mad Max: Fury Road',
        description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.',
        poster_url: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg'
    },
    {
        title: 'Gladiator',
        description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
        poster_url: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg'
    }
];

export default function SeedPage() {
    const [status, setStatus] = useState('Idle');
    const [log, setLog] = useState<string[]>([]);

    const runSeed = async () => {
        setStatus('Seeding...');
        setLog([]);

        try {
            for (const film of MOCK_FILMS) {
                setLog(prev => [...prev, `Inserting: ${film.title}...`]);

                const { error } = await supabase
                    .from('films')
                    .insert([film]);

                if (error) {
                    console.error('Error inserting', film.title, error);
                    setLog(prev => [...prev, `❌ Error: ${film.title} - ${error.message}`]);
                } else {
                    setLog(prev => [...prev, `✅ Success: ${film.title}`]);
                }
            }
            setStatus('Done');
        } catch (err: any) {
            setStatus('Error');
            setLog(prev => [...prev, `🔥 Critical Error: ${err.message}`]);
        }
    };

    useEffect(() => {
        runSeed();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <div className="mb-4">
                Status: <span className={status === 'Done' ? 'text-green-500' : 'text-yellow-500'}>{status}</span>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg h-[80vh] overflow-y-auto">
                {log.map((entry, i) => (
                    <div key={i} className="mb-1">{entry}</div>
                ))}
            </div>
        </div>
    );
}
