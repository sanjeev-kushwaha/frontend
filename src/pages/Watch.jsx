import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaCog,
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaDownload,
  FaExpand,
  FaCompress,
  FaArrowLeft,
  FaUndo,
  FaRedo,
  FaVolumeMute,
  FaVolumeDown,
  FaVolumeUp,
} from "react-icons/fa";

const Watch = () => {
  const { id } = useParams();
  const [showSettings, setShowSettings] = useState(false);
  const [video, setVideo] = useState(null);
  const [resolution, setResolution] = useState("720p");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [availableResolutions, setAvailableResolutions] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://www.globe13.com/FF/api/api/videos/videos")
      .then((res) => {
        const found = res.data.find((v) => v._id === id);
        setVideo(found);
        setRecommendedVideos(res.data.filter((v) => v._id !== id));
        if (found?.resolutions) {
          const resolutionKeys = Object.keys(found.resolutions);
          setAvailableResolutions(resolutionKeys);
          if (resolutionKeys.length > 0) {
            setResolution(resolutionKeys[resolutionKeys.length - 1]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (!video || !resolution) return;
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const currentTime = videoElement.currentTime;
    const wasPlaying = true;

    videoElement.src = getVideoUrl(resolution);

    videoElement.onloadedmetadata = () => {
      videoElement.currentTime = currentTime;
      if (wasPlaying) {
        videoElement.play().then(() => setIsPlaying(true)).catch(console.warn);
      }
    };
  }, [video, resolution]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ✅ Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ["INPUT", "TEXTAREA", "BUTTON"].includes(
          document.activeElement.tagName
        )
      )
        return;

      console.log("Key Pressed:", e.code); // Debugging

      if (!videoRef.current) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowRight":
        case "KeyD":
          handleForward();
          break;
        case "ArrowLeft":
        case "KeyA":
          handleBackward();
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyM":
          setVolume((prev) => (prev === 0 ? 1 : 0));
          break;
        case "KeyS":
          setShowSettings((prev) => !prev);
          break;
       
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const getVideoUrl = (res, isDownload = false) => {
    return isDownload
      ? `https://www.globe13.com/FF/api/api/videos/download/${id}/${res}`
      : `https://www.globe13.com/FF/api/api/videos/stream/${id}?resolution=${res}`;
  };

  const handleResolutionChange = (newResolution) => {
    setResolution(newResolution);
    setShowSettings(false); 
  };
  

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleForward = () => {
    videoRef.current.currentTime = Math.min(
      videoRef.current.duration,
      videoRef.current.currentTime + 10
    );
  };

  const handleBackward = () => {
    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 10
    );
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);
    updateBuffered();
  };

  const updateBuffered = () => {
    const video = videoRef.current;
    if (!video || !video.buffered) return;

    for (let i = 0; i < video.buffered.length; i++) {
      if (
        video.currentTime >= video.buffered.start(i) &&
        video.currentTime <= video.buffered.end(i)
      ) {
        const bufferedEnd = video.buffered.end(i);
        const bufferPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferPercent);
        break;
      }
    }
  };

  const handleSeek = (e) => {
    const boundingRect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const newTime = (offsetX / boundingRect.width) * duration;
    videoRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const playNextVideo = () => {
    if (recommendedVideos.length > 0) {
      const nextVideo = recommendedVideos[0];
      window.location.href = `/watch/${nextVideo._id}`;
    }
  };

  if (!video) return <p className="text-white p-4">Loading...</p>;

  return (
    <section>
      <div
        onMouseMove={handleMouseMove}
        className="bg-black h-[100vh] text-white p-4"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-center">{video.title}</h1>
          <div className="fixed inset-0 z-50 bg-black">
            <video
              ref={videoRef}
              controls={false}
              onTimeUpdate={handleTimeUpdate}
              onProgress={updateBuffered}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={playNextVideo}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              className="w-full h-full object-contain bg-black"
            />
            {isBuffering && (
              <div className="absolute inset-0 flex justify-center items-center z-50">
                <div className="w-16 h-16 border-4 border-t-white border-gray-600 rounded-full animate-spin"></div>
              </div>
            )}
            {showControls && (
              <div className="absolute inset-0 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between p-4">
                  <button onClick={() => window.history.back()} className="text-xl">
                    <FaArrowLeft />
                  </button>
                </div>
                <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                  <div
                    ref={progressRef}
                    className="w-full h-1 bg-white/30 cursor-pointer relative rounded-md"
                    onClick={handleSeek}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gray-400/60 rounded-md"
                      style={{ width: `${buffered}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-red-600 rounded-md"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-md"
                      style={{ left: `calc(${progress}% - 0.5rem)` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={handlePlayPause}>
                        {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                      </button>
                      <button onClick={handleBackward}><FaUndo size={18} /></button>
                      <button onClick={handleForward}><FaRedo size={18} /></button>
                      <div>{formatTime(currentTime)} / {formatTime(duration)}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-4 items-center">
                        <span className="text-xl flex items-center gap-2">
                          <button onClick={() => setVolume(volume === 0 ? 1 : 0)}>
                            {volume === 0 ? <FaVolumeMute size={16} /> : volume < 0.5 ? <FaVolumeDown size={16} /> : <FaVolumeUp size={16} />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                          />
                        </span>
                        <div className="relative">
                          <button onClick={() => setShowSettings(!showSettings)}><FaCog size={20} /></button>
                          {showSettings && (
                            <div className="absolute bottom-12 right-1 w-48 max-h-60 overflow-y-auto bg-black/50 border border-white/10 rounded-xl shadow-xl text-white z-50 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                              <div className="text-sm font-medium px-4 py-2 border-b border-white/10">Quality</div>
                              {availableResolutions.map((r) => (
                                <div
                                  key={r}
                                  onClick={() => handleResolutionChange(r)}
                                  className={`px-4 py-2 cursor-pointer text-sm hover:bg-white/30 transition duration-150 ${resolution === r ? "text-blue-400 font-semibold" : ""}`}
                                >
                                  {r}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <a href={getVideoUrl(resolution, true)} download>
                          <button><FaDownload size={16} /></button>
                        </a>
                        <button onClick={toggleFullscreen}>
                          {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Watch;
