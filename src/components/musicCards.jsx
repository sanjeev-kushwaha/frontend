
// import React, { useRef } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// const songs = Array.from({ length: 12 }, (_, i) => ({
//   id: i + 1,
//   title: `Song ${i + 1}`,
//   artist: `Artist ${String.fromCharCode(65 + i)}`,
// }));

// export default function MusicCarousel() {
//   const scrollRef = useRef();

//   const scroll = (dir) => {
//     const container = scrollRef.current;
//     const cardWidth = container?.querySelector("div")?.offsetWidth || 200;
//     container?.scrollBy({
//       left: dir === 'left' ? -cardWidth * 3 : cardWidth * 3,
//       behavior: 'smooth',
//     });
//   };

//   return (
//     <section className="w-full bg-[#141414] py-8 text-white overflow-hidden">
//       <div className="relative max-w-7xl mx-auto px-4">
//         <h2 className="text-2xl sm:text-3xl font-bold mb-6">
//           Top Music Picks 🎶
//         </h2>

//         {/* Left Arrow */}
//         <button
//           onClick={() => scroll('left')}
//           className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full text-white transition sm:flex hidden"
//         >
//           <ChevronLeft size={24} />
//         </button>

//         {/* Scrollable Track */}
//         <div
//           ref={scrollRef}
//           className="flex overflow-x-auto space-x-4 scroll-smooth no-scrollbar pb-2"
//         >
//           {songs.map((song) => (
//             <div
//               key={song.id}
//               className="min-w-[180px] sm:min-w-[200px] bg-[#1f1f1f] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-md"
//             >
//               <div className="h-32 sm:h-36 bg-gradient-to-br from-[#292929] to-[#1a1a1a] flex items-center justify-center text-5xl">
//                 🎧
//               </div>
//               <div className="p-4">
//                 <h3 className="text-base sm:text-lg font-semibold truncate">{song.title}</h3>
//                 <p className="text-sm text-gray-400 truncate">{song.artist}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Right Arrow */}
//         <button
//           onClick={() => scroll('right')}
//           className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full text-white transition sm:flex hidden"
//         >
//           <ChevronRight size={24} />
//         </button>
//       </div>
//     </section>
//   );
// }

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MusicCarousel() {
  const [songs, setSongs] = useState([]);
  const [playingUrl, setPlayingUrl] = useState(null);
  const audioRef = useRef(null);
  const scrollRef = useRef();

  // Fetch songs from backend
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/songs');
        setSongs(res.data);
      } catch (err) {
        console.error('Error fetching songs:', err);
      }
    };
    fetchSongs();
  }, []);

  // Scroll carousel left/right
  const scroll = (dir) => {
    const container = scrollRef.current;
    const cardWidth = container?.querySelector("div")?.offsetWidth || 200;
    container?.scrollBy({
      left: dir === 'left' ? -cardWidth * 3 : cardWidth * 3,
      behavior: 'smooth',
    });
  };

  // Play a selected song
  const playSong = (id) => {
    const url = `http://localhost:8000/api/songs/stream/${id}`;
    setPlayingUrl(url);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  return (
    <section className="w-full bg-[#141414] py-8 text-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          Top Music Picks 🎶
        </h2>

        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full text-white transition sm:flex hidden"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Songs Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 scroll-smooth no-scrollbar pb-2"
        >
          {songs.map((song) => (
            <Link
              to="/music"
              key={song._id}
              className="min-w-[180px] sm:min-w-[200px] bg-[#1f1f1f] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-md cursor-pointer"
            >
              <img
                src={`http://localhost:8000${song.thumbnail}`}
                alt={song.title}
                className="h-32 sm:h-36 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-base sm:text-lg font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black p-2 rounded-full text-white transition sm:flex hidden"
        >
          <ChevronRight size={24} />
        </button>

        {/* Audio Player */}
        {playingUrl && (
          <div className="mt-6 w-full flex justify-center">
            <audio ref={audioRef} controls src={playingUrl} className="w-full max-w-lg" />
          </div>
        )}
      </div>
    </section>
  );
}


