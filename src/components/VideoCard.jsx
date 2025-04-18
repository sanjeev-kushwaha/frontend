import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  const thumbnailUrl = `http://localhost:8000/api/videos/thumbnail/${video._id}`;

  return (
    <Link to={`/watch/${video._id}`} className="hover:scale-105 transition-transform">
      <div className="rounded overflow-hidden shadow-lg bg-zinc-900">
        <img src={thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h2 className="text-lg font-semibold">{video.title}</h2>
          <p className="text-sm text-gray-400">{video.category}</p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
