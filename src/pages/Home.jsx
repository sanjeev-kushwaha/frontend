
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import MusicCarousel from "../components/musicCards";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { FaHome, FaFolder, FaPlus, FaUser } from "react-icons/fa";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [songs, setSongs] = useState([]);
  const [bannerSlides, setBannerSlides] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef(null);
  const sectionRefs = useRef({});
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const sections = [
    "Popular",
    "Trending Now",
    "TV Shows",
    "Action & Adventure",
    "Recently Added",
    "Originals",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoRes, songRes] = await Promise.all([
          axios.get("https://www.globe13.com/FF/api/api/videos/videos"),
          axios.get("https://www.globe13.com/FF/api/api/songs"),
        ]);

        setVideos(videoRes.data);
        setSongs(songRes.data);

        const interleaved = [];
        const maxLength = Math.max(videoRes.data.length, songRes.data.length);
        for (let i = 0; i < maxLength; i++) {
          if (videoRes.data[i])
            interleaved.push({ type: "video", data: videoRes.data[i] });
          if (songRes.data[i])
            interleaved.push({ type: "music", data: songRes.data[i] });
        }
        setBannerSlides(interleaved);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [bannerSlides]);

  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      setBannerIndex((prev) =>
        distance > 0
          ? (prev + 1) % bannerSlides.length
          : (prev - 1 + bannerSlides.length) % bannerSlides.length
      );
    }
  };

  const handleScroll = (sectionKey, direction) => {
    const container = sectionRefs.current[sectionKey];
    if (container) {
      const card = container.querySelector("a");
      const cardWidth = card?.offsetWidth || 200;
      container.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-[#323131] text-white font-sans min-h-screen overflow-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#323131] px-6 py-4 flex items-center justify-between border-b border-gray-800 backdrop-blur-md">
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white hover:scale-105 transition">
          <span className="text-[#e50914]">LO</span>
          <span className="text-white">GO</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden sm:flex gap-6 text-gray-300 text-sm sm:text-base">
          {["Home", "TV Shows", "Originals", "Recently Added"].map(
            (item, i) => (
              <a
                key={i}
                href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                className="hover:text-white transition">
                {item}
              </a>
            )
          )}
        </nav>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4 text-gray-400">
          {/* SEARCH */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full hover:ring-1 hover:ring-gray-500 transition">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm w-28 sm:w-40 placeholder-gray-400"
            />
          </div>

          {/* BELL */}
          <Bell className="w-5 h-5 cursor-pointer hover:text-white transition" />

          {/* ACCOUNT */}
          <span className="hidden sm:inline text-sm cursor-pointer hover:text-white transition">
            Account
          </span>

          {/* MUSIC PAGE BTN (ICON ONLY ON MOBILE) */}
          <Link
            to="/music"
            className="sm:hidden block bg-[#e50914] hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
            title="Go to Music Page">
            🎵
          </Link>
        </div>

        {/* DESKTOP "Switch to Music" BUTTON */}
        <Link
          to="/music"
          className="hidden sm:inline-flex items-center px-5 py-2 ml-6 bg-gradient-to-r from-[#e50914] to-[#b0060f] text-white text-sm sm:text-base font-semibold rounded-full shadow-md hover:scale-105 transition">
          🎵 Switch to Music
        </Link>
      </header>

      {/* FEATURED BANNER SLIDER */}
      <section
        className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={bannerRef}>
        <AnimatePresence mode="wait">
          {bannerSlides.length > 0 && (
            <motion.div
              key={bannerIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0">
              {bannerSlides[bannerIndex].type === "video" ? (
                <Link to={`/watch/${bannerSlides[bannerIndex].data._id}`}>
                  <img
                    src={`https://www.globe13.com/FF/api/api/videos/thumbnail/${bannerSlides[bannerIndex].data._id}`}
                    alt={bannerSlides[bannerIndex].data.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-black/80 to-transparent" />
                  <div className="absolute bottom-10 left-5 md:left-12 z-10">
                    <h2 className="text-3xl md:text-5xl font-bold">
                      {bannerSlides[bannerIndex].data.originalName}
                    </h2>
                    <div className="flex items-center gap-2 text-yellow-400 mt-2 text-lg font-semibold">
                      ★ ★ ★ ★ ☆ <span>5</span>
                      <span className="bg-yellow-500 text-black px-2 rounded font-bold ml-2">
                        IMDB
                      </span>
                    </div>
                    {/* <p className="mt-2 max-w-md text-sm md:text-base text-gray-300">
                      {bannerSlides[bannerIndex].data.description?.slice(0, 150)}...
                    </p> */}
                    <button className="mt-4 px-6 py-2 bg-[#e50914] text-white rounded font-semibold hover:bg-red-600 transition">
                      Watch Now
                    </button>
                  </div>
                </Link>
              ) : (
                <Link to="/music">
                  <img
                    src={`https://www.globe13.com/FF/api${bannerSlides[bannerIndex].data.thumbnail}`}
                    alt={bannerSlides[bannerIndex].data.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-black/80 to-transparent" />
                  <div className="absolute bottom-10 left-5 md:left-12 z-10">
                    <h2 className="text-3xl md:text-5xl font-bold">
                      {bannerSlides[bannerIndex].data.title}
                    </h2>
                    <p className="text-lg text-gray-300 mt-2">
                      {bannerSlides[bannerIndex].data.artist}
                    </p>
                    <button className="mt-4 px-6 py-2 bg-[#e50914] text-white rounded font-semibold hover:bg-red-600 transition">
                      Listen Now
                    </button>
                  </div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* MUSIC CAROUSEL */}

      <section className="text-center my-12">
        <h1 className="text-4xl sm:text-5xl font-bold">
          Modern <span className="text-[#e50914]">Music</span> & Latest{" "}
          <span className="text-[#e50914]">Songs</span> 🎶
        </h1>
        <p className="text-lg text-gray-400 mt-2">Create Your Own Playlist</p>
      </section>

      <section className="flex justify-center items-center my-12">
        <Link
          to="/music"
          className="relative group block w-[500px] h-[300px] overflow-hidden rounded-xl  hover:scale-105 transition-transform">
          <img
            src="/3.png"
            alt="Explore Music"
            className="w-full h-full object-cover"
          />

          {/* Blurred dark background appears on hover */}
          <div className="absolute inset-0  backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Text appears from bottom */}
          <div className="flex absolute bottom-[-50px] left-0 right-0 flex justify-center opacity-0 group-hover:bottom-1/3 group-hover:opacity-100 transition-all duration-700">
            
            <div className="flex flex-col items-center gap-2">
              {/* PNG Icon Above */}
              <img src="/2.png" alt="Music Icon" className="w-40 h-30" />

              {/* Explore Button */}
              <button
                // onClick={() => }
                className="flex items-center gap-2 justify-center border border-black bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-800 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md">
               <span className="text-2xl font-bold text-white-600">Explore Music</span>
               <span className="text-2xl">🎶</span>
              </button>
            </div>
          </div>
        </Link>
      </section>

      {/* <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="text-white text-2xl sm:text-3xl font-bold group-hover:underline">
      Explore Music Library →
    </div>
  </div> */}
      {/* VIDEO CATEGORIES */}
      <section className="px-4 sm:px-8 lg:px-12">
        {sections.map((section, idx) => {
          const sectionKey = section.replace(/\s+/g, "").toLowerCase();
          return (
            <div key={idx} className="mb-12 relative" id={sectionKey}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-5">{section}</h2>

              {/* Left Scroll Button */}
              <button
                onClick={() => handleScroll(sectionKey, "left")}
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-30 bg-black/70 hover:bg-[#e50914] text-white p-2 rounded-full shadow-md backdrop-blur-sm transition mt-7">
                <ChevronLeft size={26} />
              </button>

              {/* Scrollable container */}
              <div
                ref={(el) => (sectionRefs.current[sectionKey] = el)}
                className="flex overflow-x-auto no-scrollbar space-x-5 scroll-smooth -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
                {videos.map((video) => (
                  <motion.div
                    key={`${section}-${video._id}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative group flex-shrink-0 w-[98%] sm:w-[55%] md:w-[55%] lg:w-[28%] xl:w-[28%] mx-2 transform transition-all duration-500 ease-out origin-center hover:scale-[1.07] hover:z-20">
                    <div className="relative rounded-lg overflow-hidden bg-zinc-900 shadow-md shadow-black/30 group-hover:shadow-xl group-hover:shadow-black/70 transition-transform duration-500 ease-out">
                      {/* Thumbnail */}
                      <Link to={`/watch/${video._id}`}>
                        <div className="w-full aspect-[16/9]">
                          <img
                            src={`https://www.globe13.com/FF/api/api/videos/thumbnail/${video._id}`}
                            alt={video.filename}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      {/* Dark Gradient Hover Overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 backdrop-blur-sm bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ease-out p-4 flex flex-col justify-end space-y-2">
                        <h3 className="text-white text-lg font-bold truncate drop-shadow-md">
                          {video.originalName}
                        </h3>
                        <div className="flex items-center text-white text-sm space-x-1 ">
                          <Clock size={16} />
                          <span className="pl-2">5:23</span>{" "}
                          {/* Hardcoded duration */}
                        </div>

                        {/* Watch & Watchlist Buttons */}
                        <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out ">
                          <Link
                            to={`/watch/${video._id}`}
                            className="flex items-center gap-2 justify-center bg-gradient-to-r from-[#e50914] to-[#b20710] hover:from-[#ff0a16] hover:to-[#e50914] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-transform duration-300 transform hover:scale-105 shadow-lg">
                            <span className="text-lg">▶</span> Watch
                          </Link>

                          <button
                            onClick={() => alert("Added to watchlist!")}
                            className="flex items-center gap-2 justify-center border border-white text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-md">
                            <span className="text-lg">＋</span> Watchlist
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={() => handleScroll(sectionKey, "right")}
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-30 bg-black/70 hover:bg-[#e50914] text-white p-2 rounded-full shadow-md backdrop-blur-sm transition mt-7">
                <ChevronRight size={26} />
              </button>
            </div>
          );
        })}
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-gray-800 text-sm text-gray-400">
        <div className="flex justify-center gap-6 mb-4">
          <i className="fab fa-facebook-square fa-2x hover:text-white" />
          <i className="fab fa-instagram fa-2x hover:text-white" />
          <i className="fab fa-twitter fa-2x hover:text-white" />
          <i className="fab fa-youtube fa-2x hover:text-white" />
        </div>
        <ul className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto mb-4">
          {[
            "Audio and Subtitles",
            "Audio Description",
            "Help Center",
            "Gift Cards",
            "Media Center",
            "Investor Relations",
            "Jobs",
            "Terms of Use",
            "Privacy",
            "Legal Notices",
            "Corporate Information",
            "Contact Us",
          ].map((item, idx) => (
            <li key={idx} className="hover:underline cursor-pointer">
              {item}
            </li>
          ))}
        </ul>
        <p className="text-center text-gray-500">&copy; 2025 SpirePlay</p>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION (Only visible on phones) */}
      {/* <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c1e] sm:hidden border-t border-gray-700 flex justify-around items-center py-2 text-xs text-white">
        <Link to="/" className="flex flex-col items-center justify-center">
          <FaHome className="text-lg mb-1" />
          Home
        </Link>
        <Link
          to="/category"
          className="flex flex-col items-center justify-center">
          <FaFolder className="text-lg mb-1" />
          Category
        </Link>
        <Link
          to="/watchlist"
          className="flex flex-col items-center justify-center">
          <FaPlus className="text-lg mb-1" />
          Watchlist
        </Link>
        <Link to="/me" className="flex flex-col items-center justify-center">
          <FaUser className="text-lg mb-1" />
          Account
        </Link>
      </div> */}
    </div>
  );
};

export default Home;
