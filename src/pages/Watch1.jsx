
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaDownload,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { openDB } from "idb";
import { FaArrowLeft } from "react-icons/fa";

const resolutions = ["144p", "320p", "480p", "720p", "1080p", "2160p"];

const Watch = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [progress, setProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    axios
      .get("https://www.globe13.com/FF/api/api/videos/videos")
      .then((res) => {
        const found = res.data.find((v) => v._id === id);
        setVideo(found);
      })
      .catch((err) => console.error("Video fetch error:", err));
  }, [id]);

  const getVideoUrl = (res, isDownload = false) => {
    return isDownload
      ? `https://www.globe13.com/FF/api/api/videos/download/${id}/${res}`
      : `https://www.globe13.com/FF/api/api/videos/stream/${id}?resolution=${res}`;
  };

  const handleResolutionChange = async (res) => {
    setSelectedResolution(res);
    const currentTime = videoRef.current?.currentTime || 0;
    const key = `${id}_${res}`;
    const db = await openDB("video-store", 2);
    const blob = await db.get("videos", key);

    if (blob) {
      const offlineUrl = URL.createObjectURL(blob);
      videoRef.current.src = offlineUrl;
      setIsOffline(true);
    } else {
      videoRef.current.src = getVideoUrl(res);
      setIsOffline(false);
    }

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.currentTime = currentTime;
      videoRef.current.play().catch(console.warn);
    };
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const handleBackward = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    videoRef.current.currentTime = newTime;
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " " || e.key === "Enter") handlePlayPause();
      else if (e.key === "ArrowRight") handleForward();
      else if (e.key === "ArrowLeft") handleBackward();
      else if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const downloadVideo = async () => {
    const db = await openDB("video-store", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      },
    });

    const url = getVideoUrl(selectedResolution, true);
    const key = `${id}_${selectedResolution}`;

    try {
      const res = await fetch(url);
      const reader = res.body.getReader();
      const contentLength = +res.headers.get("Content-Length");
      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setProgress((received / contentLength) * 100);
      }

      const blob = new Blob(chunks);
      await db.put("videos", blob, key);
      alert("Video downloaded for offline use.");
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (!video) return <p className="text-white p-4">Loading...</p>;

  return (
    <div
      className="bg-black text-white min-h-screen"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <div className="relative w-screen h-screen overflow-hidden">
      {!isFullscreen && (
                <div className="absolute top-4 left-4 z-20">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-white  rounded-full p-2 hover:bg-black/70 transition"
                    >
                        <FaArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            )}
        <video
          ref={videoRef}
          src={getVideoUrl(selectedResolution)}
          className="w-full h-full object-cover bg-black"
          autoPlay
          controls={false}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          volume={volume}
        />

        {showControls && (
          <div className="absolute inset-0 flex flex-col justify-end bg-black/40 transition duration-300">
            <div className="flex justify-center items-center gap-10 py-6">
              <button onClick={handleBackward} className="text-3xl hover:scale-110"><FaBackward /></button>
              <button onClick={handlePlayPause} className="text-5xl hover:scale-110">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={handleForward} className="text-3xl hover:scale-110"><FaForward /></button>
            </div>

            <div className="flex flex-col px-4 pb-4">
              <div
                ref={progressRef}
                className="w-full h-2 bg-gray-600 cursor-pointer relative"
                onClick={handleSeek}
              >
                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>

              <div className="flex justify-between items-center text-sm mt-2">
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedResolution}
                    onChange={(e) => handleResolutionChange(e.target.value)}
                    className="bg-gray-800 text-white text-sm p-1 rounded"
                  >
                    {resolutions.map((res) => (
                      <option key={res} value={res}>{res}</option>
                    ))}
                  </select>
                  <button onClick={downloadVideo}><FaDownload /></button>
                  <button onClick={handleVolumeToggle}>
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <button onClick={toggleFullscreen}>
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
