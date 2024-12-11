'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VideoPage() {
  const { id } = useParams(); // Extract the unique ID from the URL
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(""); // URL for downloading the video
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const BACKEND_URL = process.env.BACKEND_URL
  
  useEffect(() => {
    if (id) {
      // Fetch the video URL from the backend using the unique ID
      fetch(`${BACKEND_URL}/api/videos/${id}/stream/`)
        .then((res) => {
          if (!res.ok) throw new Error("Video not found");
          return res.url; // Direct stream URL
        })
        .then((streamUrl) => {
          setVideoUrl(streamUrl);
          setDownloadUrl(`${BACKEND_URL}/api/videos/${id}/download/`); // Construct download URL
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">Video not found</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Video Player</h1>
        <video controls className="w-full mb-4">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <a
          href={downloadUrl}
          className="inline-block px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition"
          download
        >
          Download Video
        </a>
      </div>
    </div>
  );
}
