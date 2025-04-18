import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Upload = () => {
    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!video || !thumbnail || !title || !description || !category) {
            return alert("Please fill in all fields.");
        }

        const formData = new FormData();
        formData.append("video", video);
        formData.append("thumbnail", thumbnail  );
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
       
       

        try {
            const res = await axios.post("http://localhost:8000/api/videos/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Upload successful!");
            console.log(res.data);
            navigate("/")
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xl bg-gray-800 p-8 rounded-lg shadow-md space-y-4"
            >
                <h2 className="text-2xl font-bold mb-4">Upload New Video</h2>

                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded outline-none"
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded outline-none"
                />
                
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded outline-none"
                >
                    <option value="">Select Category</option>
                    <option value="Action">Action</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                    <option value="Drama">Drama</option>
                </select>


                <div className="space-y-2">
                    <label>Video File</label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideo(e.target.files[0])}
                        className="w-full bg-gray-700 p-2 rounded"
                    />
                </div>

                <div className="space-y-2">
                    <label>Thumbnail Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        className="w-full bg-gray-700 p-2 rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 transition duration-200 p-3 rounded font-semibold"
                >
                    Upload Video
                </button>
            </form>
        </div>
    );
};

export default Upload;
