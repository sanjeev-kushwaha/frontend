import React from "react";

const VideoPlayer = ({ videoUrl, title }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      <video
        src={videoUrl}
        controls
        autoPlay
        className="w-full max-w-4xl rounded-lg shadow-lg"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
