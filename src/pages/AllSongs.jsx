// JioSaavn-like Full Music Player Page with Enhanced UI
// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import {
//   PlayCircle,
//   PauseCircle,
//   Volume2,
//   VolumeX,
//   SkipForward,
//   SkipBack,
//   X,
//   ListMusic
// } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function AllSongsPage() {
//   const [songs, setSongs] = useState([]);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState(1);
//   const [queue, setQueue] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [progress, setProgress] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [showLyrics, setShowLyrics] = useState(false);
//   const [showQueue, setShowQueue] = useState(false);

//   const audioRef = useRef();
//   const intervalRef = useRef();

//   useEffect(() => {
//     const fetchSongs = async () => {
//       try {
//         const res = await axios.get('http://localhost:8000/api/songs');
//         setSongs(res.data);
//         setQueue(res.data);
//       } catch (err) {
//         console.error('Error fetching songs:', err);
//       }
//     };
//     fetchSongs();
//   }, []);

//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.volume = volume;
//     }
//   }, [volume]);

//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         if (audioRef.current) {
//           setProgress(audioRef.current.currentTime);
//         }
//       }, 500);
//     } else {
//       clearInterval(intervalRef.current);
//     }
//     return () => clearInterval(intervalRef.current);
//   }, [isPlaying]);

//   const playSongAtIndex = (index) => {
//     const song = queue[index];
//     if (!song) return;
//     setCurrentSong(song);
//     setCurrentIndex(index);
//     setIsPlaying(true);
//     setTimeout(() => audioRef.current?.play(), 100);
//   };

//   const togglePlayPause = () => {
//     if (!currentSong) return;
//     if (isPlaying) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   };

//   const handleSeek = (e) => {
//     const time = parseFloat(e.target.value);
//     audioRef.current.currentTime = time;
//     setProgress(time);
//   };

//   const handleNext = () => {
//     const nextIndex = currentIndex + 1;
//     if (nextIndex < queue.length) {
//       playSongAtIndex(nextIndex);
//     } else {
//       setIsPlaying(false);
//     }
//   };

//   const handlePrev = () => {
//     const prevIndex = currentIndex - 1;
//     if (prevIndex >= 0) {
//       playSongAtIndex(prevIndex);
//     }
//   };

//   const toggleLyrics = () => setShowLyrics(!showLyrics);
//   const toggleQueue = () => setShowQueue(!showQueue);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#0d1321] to-[#24243e] text-white">
//       <div className="px-4 py-6 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6 text-center">Discover New Music</h1>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
//           {songs.map((song, idx) => (
//             <motion.div
//               key={song._id}
//               onClick={() => playSongAtIndex(idx)}
//               className="bg-[#1f1f1f] p-3 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
//               whileHover={{ scale: 1.05 }}
//             >
//               <img
//                 src={`http://localhost:8000${song.thumbnail}`}
//                 className="rounded-lg w-full h-36 object-cover"
//                 alt={song.title}
//               />
//               <h3 className="mt-2 font-semibold truncate text-base">{song.title}</h3>
//               <p className="text-sm text-gray-400 truncate">{song.artist}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {currentSong && (
//         <motion.div
//           initial={{ y: 100 }}
//           animate={{ y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl px-4 py-3 flex flex-col sm:flex-row items-center gap-4 z-50 border-t border-gray-700"
//         >
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             <img
//               src={`http://localhost:8000${currentSong.thumbnail}`}
//               alt="current"
//               className="w-14 h-14 object-cover rounded-lg"
//             />
//             <div className="flex-1">
//               <h4 className="text-sm font-bold truncate">{currentSong.title}</h4>
//               <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 justify-center">
//             <button onClick={handlePrev}><SkipBack /></button>
//             <button onClick={togglePlayPause}>
//               {isPlaying ? <PauseCircle size={36} /> : <PlayCircle size={36} />}
//             </button>
//             <button onClick={handleNext}><SkipForward /></button>
//           </div>

//           <input
//             type="range"
//             min="0"
//             max={audioRef.current?.duration || 1}
//             value={progress}
//             onChange={handleSeek}
//             className="w-full sm:w-60 accent-green-500"
//           />

//           <div className="flex items-center gap-2">
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={volume}
//               onChange={(e) => setVolume(parseFloat(e.target.value))}
//               className="w-20 accent-green-500"
//             />
//             {volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
//           </div>

//           <button onClick={toggleLyrics} className="text-xs underline">Lyrics</button>
//           <button onClick={toggleQueue} className="text-xs ml-2"><ListMusic size={18} /></button>

//           <audio
//             ref={audioRef}
//             src={`http://localhost:8000/api/songs/stream/${currentSong._id}`}
//             onLoadedMetadata={() => setDuration(audioRef.current.duration)}
//             onEnded={handleNext}
//             onPlay={() => setIsPlaying(true)}
//             onPause={() => setIsPlaying(false)}
//             autoPlay
//           />
//         </motion.div>
//       )}

//       {showLyrics && currentSong && (
//         <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999] p-6">
//           <div className="max-w-2xl w-full text-center relative">
//             <button
//               className="absolute top-3 right-3 text-gray-400 hover:text-white"
//               onClick={toggleLyrics}
//             >
//               <X size={24} />
//             </button>
//             <h2 className="text-2xl font-bold mb-4">Lyrics - {currentSong.title}</h2>
//             <p className="whitespace-pre-wrap text-sm text-gray-300 max-h-[60vh] overflow-y-auto">
//               {currentSong.lyrics || 'Lyrics not available.'}
//             </p>
//           </div>
//         </div>
//       )}

//       {showQueue && (
//         <div className="fixed bottom-20 right-4 bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 max-w-sm w-full z-40">
//           <h3 className="font-bold mb-2 text-white text-sm">Queue</h3>
//           <ul className="max-h-60 overflow-y-auto text-sm">
//             {queue.map((song, idx) => (
//               <li
//                 key={song._id}
//                 onClick={() => playSongAtIndex(idx)}
//                 className={`p-2 rounded cursor-pointer hover:bg-[#2a2a2a] ${
//                   currentIndex === idx ? 'bg-green-700 text-white' : 'text-gray-300'
//                 }`}
//               >
//                 {song.title} - {song.artist}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Play, Pause, Plus, Download, MoreVertical, Shuffle, ArrowLeft
} from 'lucide-react';
import { FaHome, FaFolder, FaPlus, FaUser } from "react-icons/fa";

const InstrumentalPage = () => {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/songs')
            .then((res) => setSongs(res.data))
            .catch((err) => console.error(err));
    }, []);

    const handlePlay = (song) => {
        if (currentSong?._id === song._id && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setCurrentSong(song);
            setIsPlaying(true);
            setTimeout(() => audioRef.current?.play(), 100);
        }
    };

    const getStreamUrl = (id) => `http://localhost:8000/api/songs/stream/${id}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white pb-32">
            {/* Header */}
            <div className="p-4 flex items-center gap-4">
                <Link to="/" className="bg-red-600 hover:bg-red-500 p-2 rounded-full shadow-lg">
                    <ArrowLeft size={20} />
                </Link>
            </div>

            {/* Album Art & Info */}
            <div className="flex flex-col items-center text-center px-6">
                <img
                    src="https://t4.ftcdn.net/jpg/04/10/17/95/360_F_410179527_ExxSzamajaCtS16dyIjzBRNruqlU5KMA.jpg"
                    alt="Instrumental"
                    className="rounded-full w-44 h-44 sm:w-56 sm:h-56 object-cover shadow-2xl"
                />
                <span className="bg-red-600 text-white px-4 py-1 mt-4 rounded-full font-bold uppercase text-xs tracking-wide">
                    Music
                </span>
                <p className="text-gray-400 text-sm mt-2 max-w-sm leading-relaxed">
                    Enjoy a relaxing collection of instrumental tracks, perfect for focus or unwinding.
                </p>
                <div className="mt-4">
                    <h2 className="font-bold text-lg sm:text-2xl">Relaxing Beats</h2>
                    <p className="text-gray-400 text-xs sm:text-sm">10,200 saves • 5h 16min</p>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {[Plus, Download, MoreVertical, Shuffle].map((Icon, i) => (
                        <button key={i} className="bg-zinc-800 p-3 rounded-full hover:bg-zinc-700 transition-all shadow-md">
                            <Icon size={20} />
                        </button>
                    ))}
                    <button
                        onClick={() => currentSong && handlePlay(currentSong)}
                        className="bg-red-600 hover:bg-red-500 p-3 rounded-full shadow-md"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                </div>
            </div>

            {/* Song List */}
            <div className="mt-10 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {songs.map((song) => (
                    <div
                        key={song._id}
                        onClick={() => handlePlay(song)}
                        className={`flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:bg-zinc-800 ${currentSong?._id === song._id ? 'bg-zinc-800 ring-1 ring-red-500' : 'bg-zinc-900'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={`http://localhost:8000${song.thumbnail}`}
                                alt={song.name}
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div>
                                <h3 className="text-white font-semibold text-sm sm:text-base">{song.title}</h3>
                                <p className="text-gray-400 text-xs sm:text-sm">{song.artist}</p>
                            </div>
                        </div>
                        <Play className="text-white" />
                    </div>
                ))}
            </div>

            {/* Bottom Sticky Player */}
            {currentSong && (
                <div className="fixed bottom-0 left-0 w-full bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <img
                            src={`http://localhost:8000${currentSong.thumbnail}`}
                            alt="Now playing"
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="text-sm sm:text-base font-semibold">{currentSong.title}</h4>
                            <p className="text-gray-400 text-xs">{currentSong.artist}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handlePlay(currentSong)}
                        className="bg-red-600 hover:bg-red-500 p-2 rounded-full shadow"
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <audio
                        ref={audioRef}
                        src={getStreamUrl(currentSong._id)}
                        onEnded={() => setIsPlaying(false)}
                    />
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1c1c1e] sm:hidden border-t border-gray-700 flex justify-around items-center py-2 text-xs text-white">
                <Link to="/" className="flex flex-col items-center">
                    <FaHome className="text-lg mb-1" />
                    Home
                </Link>
                <Link to="/category" className="flex flex-col items-center">
                    <FaFolder className="text-lg mb-1" />
                    Category
                </Link>
                <Link to="/watchlist" className="flex flex-col items-center">
                    <FaPlus className="text-lg mb-1" />
                    Watchlist
                </Link>
                <Link to="/me" className="flex flex-col items-center">
                    <FaUser className="text-lg mb-1" />
                    Me
                </Link>
            </div>
        </div>
    );
};

export default InstrumentalPage;
