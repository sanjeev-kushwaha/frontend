import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  SkipForward,
  SkipBack,
} from 'lucide-react';

const PlayerPage = () => {
  const audioRef = useRef(null);
  const volumeTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { song, songs, index } = location.state;

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const formatTime = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;

    setShowVolumeSlider(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Play error:', err));
    }
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
  };

  const handleNext = () => {
    if (!songs || index == null) return;
    const nextIndex = (index + 1) % songs.length;
    const nextSong = songs[nextIndex];
    navigate(`/player/${nextSong._id}`, {
      state: { song: nextSong, songs, index: nextIndex },
    });
  };

  const handlePrevious = () => {
    if (!songs || index == null) return;
    const prevIndex = (index - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    navigate(`/player/${prevSong._id}`, {
      state: { song: prevSong, songs, index: prevIndex },
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleLoaded = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Autoplay blocked or load not ready:', err);
          setIsPlaying(false);
        });
    };
    if (audio) {
      audio.volume = volume;
      audio.addEventListener('loadedmetadata', handleLoaded);
      audio.load();
      return () => audio.removeEventListener('loadedmetadata', handleLoaded);
    }
  }, [song]);

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1c2c] via-[#2c3e50] to-[#4b79a1] text-white relative p-4 overflow-hidden">
      <button
        onClick={() => navigate('/music')}
        className="absolute top-4 left-4 flex items-center gap-1 text-white hover:text-teal-400"
      >
        <ChevronLeft /> Back
      </button>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm flex flex-col items-center text-center border border-white/20">
        <img
          src={`https://www.globe13.com/FF/api${song.thumbnail}`}
          alt={song.title}
          className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-xl mb-4"
        />

        <h1 className="text-lg sm:text-xl font-bold">{song.title}</h1>
        <p className="text-gray-300 mb-4 text-sm">{song.artist}</p>

        <div className="flex items-center justify-center gap-6 mt-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full hover:text-teal-400 transition"
          >
            <SkipBack size={28} />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-teal-500 hover:bg-teal-400 transition-all shadow-md hover:scale-105"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:text-teal-400 transition"
          >
            <SkipForward size={28} />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs mt-4 w-full">
          <span className="w-10 text-left">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="flex-1 accent-teal-400"
          />
          <span className="w-10 text-right">{formatTime(duration)}</span>
        </div>

        <div className="mt-5 w-full flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              if (volume === 0) {
                setVolume(1);
                audioRef.current.volume = 1;
              } else {
                setShowVolumeSlider(true);
                if (volumeTimeoutRef.current) {
                  clearTimeout(volumeTimeoutRef.current);
                }
                volumeTimeoutRef.current = setTimeout(() => {
                  setShowVolumeSlider(false);
                }, 2000);
              }
            }}
            className="hover:text-teal-400"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {showVolumeSlider && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              className="w-36 accent-teal-400 transition-opacity duration-200 ease-in-out"
            />
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={`https://www.globe13.com/FF/api/api/songs/stream/${song._id}`}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default PlayerPage;
