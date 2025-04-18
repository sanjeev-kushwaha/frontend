import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaDownload,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { openDB } from "idb";

const resolutions = ["144p", "320p", "480p", "720p", "1080p", "2160p"];

const Watch = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [resolution, setResolution] = useState("720p");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://www.globe13.com/FF/api/api/videos/videos")
      .then((res) => {
        const found = res.data.find((v) => v._id === id);
        setVideo(found);
      })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const getVideoUrl = (res, isDownload = false) => {
    return isDownload
      ? `https://www.globe13.com/FF/api/api/videos/download/${id}/${res}`
      : `https://www.globe13.com/FF/api/api/videos/stream/${id}?resolution=${res}`;
  };

  const handleResolutionChange = async (newRes) => {
    setResolution(newRes);
    const currentTime = videoRef.current?.currentTime || 0;
    const key = `${id}_${newRes}`;
    const db = await openDB("video-store", 2);
    const blob = await db.get("videos", key);

    if (blob) {
      const offlineUrl = URL.createObjectURL(blob);
      videoRef.current.src = offlineUrl;
      setIsOffline(true);
    } else {
      videoRef.current.src = getVideoUrl(newRes);
      setIsOffline(false);
    }

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.currentTime = currentTime;
      videoRef.current.play().catch((err) => console.warn("Autoplay failed:", err));
    };
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10
      );
    }
  };

  const handleBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const downloadVideo = async () => {
    const db = await openDB("video-store", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      },
    });

    const url = getVideoUrl(resolution, true);
    const key = `${id}_${resolution}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Video not available");
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

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
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
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;
    videoRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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

  if (!video) return <p className="text-white p-4">Loading...</p>;

  return (
    <div
      className="bg-black text-white min-h-screen"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* <div className="p-4 flex items-center gap-3">
        <Link to="/" className="bg-white p-2 rounded-full shadow hover:bg-red-500">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-semibold ml-4">{video.title}</h2>
      </div> */}

      <div className="relative w-screen h-screen overflow-hidden">

        <div className="relative group">
          <video
            ref={videoRef}
            src={getVideoUrl(resolution)}
            className="w-full h-full object-cover bg-black"
            autoPlay
            controls={false}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />


          {showControls && (
            <div className="absolute inset-0 flex flex-col justify-end bg-black/40 transition duration-300">
              {/* Center controls */}
              <div className="flex justify-center items-center gap-10 py-6">
                <button onClick={handleBackward} className="text-3xl hover:scale-110">
                  <FaBackward />
                </button>
                <button onClick={handlePlayPause} className="text-5xl hover:scale-110">
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button onClick={handleForward} className="text-3xl hover:scale-110">
                  <FaForward />
                </button>
              </div>

              {/* Bottom controls */}
              <div className="flex flex-col px-4 pb-4">
                <div
                  ref={progressRef}
                  className="w-full h-2 bg-gray-600 cursor-pointer relative"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500"
                    style={{ left: `calc(${progress}% - 6px)` }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm mt-2">
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex gap-2 items-center">
                    <select
                      className="bg-gray-800 text-white text-sm p-1 rounded"
                      value={resolution}
                      onChange={(e) => handleResolutionChange(e.target.value)}
                    >
                      {resolutions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button onClick={downloadVideo} title="Download">
                      <FaDownload />
                    </button>
                    <button onClick={toggleFullscreen} title="Fullscreen">
                      {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;





