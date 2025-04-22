import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ListMusic, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const InstrumentalPage = () => {
  const [songs, setSongs] = useState([]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://www.globe13.com/FF/api/api/songs')
      .then(res => setSongs(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSongClick = (index) => {
    const song = songs[index];
    navigate(`/player/${song._id}`, { state: { song, songs, index } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-zinc-900 text-white pb-28 font-sans">

      {/* Header */}
      <header className="flex justify-between items-center p-5 sticky top-0 z-50 bg-black/50 backdrop-blur border-b border-zinc-800">
        <Link to="/" className="text-white hover:text-teal-400 font-medium transition">
          ← Back
        </Link>
        <div className="flex gap-4">
          <button onClick={() => setQueueOpen(!queueOpen)} className="hover:text-teal-400 transition">
            <ListMusic />
          </button>
          <button onClick={() => setLyricsOpen(!lyricsOpen)} className="hover:text-teal-400 transition">
            <FileText />
          </button>
        </div>
      </header>

      {/* Title */}
      <div className="text-center mt-10">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-600 bg-clip-text text-transparent">
          Music Vibes
        </h1>
        <p className="text-gray-400 mt-2 text-lg italic">Chill • Lo-Fi • Ambient</p>
      </div>

      {/* Song List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 mt-10">
        {songs.map((song, index) => (
          <div
            key={song._id}
            onClick={() => handleSongClick(index)}
            className="flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <img
              src={`https://www.globe13.com/FF/api${song.thumbnail}`}
              alt={song.title}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{song.title}</h3>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Drawer */}
      {queueOpen && (
        <div className="fixed bottom-0 left-0 w-full max-h-[300px] overflow-y-auto bg-[#181818] border-t border-zinc-700 z-40 shadow-xl">
          <div className="p-4 font-bold text-lg flex justify-between items-center border-b border-zinc-700">
            Queue <button onClick={() => setQueueOpen(false)}>Close</button>
          </div>
          {songs.map((song, index) => (
            <div
              key={song._id}
              onClick={() => handleSongClick(index)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800 transition"
            >
              <img
                src={`https://www.globe13.com/FF/api${song.thumbnail}`}
                className="w-10 h-10 rounded"
                alt={song.title}
              />
              <div>
                <h4 className="text-sm font-semibold">{song.title}</h4>
                <p className="text-xs text-gray-400">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lyrics Panel */}
      {lyricsOpen && (
        <div className="fixed right-0 top-0 w-64 h-full bg-[#1b1b1b] border-l border-gray-700 p-4 z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Lyrics</h2>
            <button onClick={() => setLyricsOpen(false)}>Close</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">
            No lyrics available.
          </pre>
        </div>
      )}
    </div>
  );
};

export default InstrumentalPage;
