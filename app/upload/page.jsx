'use client';
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function UploadChunkedPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [csrfToken, setCsrfToken] = useState("");
  const [fileUrl, setFileUrl] = useState("");  // Store the uploaded file URL
  const [uniqueId, setUniqueId] = useState(""); // Store the unique ID
  const [showPopup, setShowPopup] = useState(false); // Control popup visibility
  const chunkSize = 5 * 1024 * 1024; // 5MB per chunk
  const FRONTEND_URL = process.env.FRONTEND_URL;
  const BACKEND_URL = process.env.BACKEND_URL;

  // Get CSRF token from the cookie or response header
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    if (token) {
      setCsrfToken(token.split('=')[1]);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setProgress(0);
  };

  const uploadChunk = async (chunk, chunkIndex, totalChunks, fileId) => {
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex);
    formData.append("totalChunks", totalChunks);
    formData.append("fileId", fileId);
    formData.append("fileName", file.name);  // Send the original file name
    formData.append("fileSize", file.size);  // Send the total file size

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-chunk/`, {
        method: "POST",
        headers: {
          'X-CSRFToken': csrfToken, // Send CSRF token here
        },
        body: formData,
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`Error uploading chunk ${chunkIndex}:`, error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = uuidv4(); // Generate a unique ID for the file
    let currentChunkIndex = 0;

    while (currentChunkIndex < totalChunks) {
      const start = currentChunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      let success = false;
      let attempts = 0;
      while (!success && attempts < 3) {
        const response = await uploadChunk(chunk, currentChunkIndex, totalChunks, fileId);
        if (response && response.status === 'success') {
          success = true;
          setProgress(response.progress);  // Update progress
          if (response.file_url) {
            setFileUrl(response.file_url);
            setUniqueId(response.unique_id); // Store the unique ID from backend
          }
        }
        attempts++;
      }

      if (!success) {
        alert(`Failed to upload chunk ${currentChunkIndex}. Please try again.`);
        return;
      }

      currentChunkIndex++;
    }

    setShowPopup(true); // Show popup after upload completion
  };

  const handleCopy = () => {
    const videoUrl = `${FRONTEND_URL}/video/${uniqueId}`;
    navigator.clipboard.writeText(videoUrl).then(() => {
      alert("URL copied to clipboard!");
    });
  };

  return (
    <div className="relative bg-white min-h-screen flex flex-col items-center justify-center p-8">
      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-full h-full z-0 animate-pulse bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 opacity-20"></div>

      {/* Upload Section */}
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Upload Your Video</h2>
        <p className="text-md text-gray-700 mb-6">Share your content with the world. Upload your video quickly and easily.</p>

        <div className="mb-6">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full p-3 mb-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          />
          <button
            onClick={handleUpload}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105"
          >
            Start Upload
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Progress: {progress}%</h3>
          <div className="w-full h-2 bg-gray-300 rounded-lg overflow-hidden">
            <div
              className={`h-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Popup for video URL */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transition-transform transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Upload Successful!</h2>
            <p className="text-gray-700 mb-4 text-center">
              Your video is ready for sharing! Access it anytime by clicking the link below:
            </p>
            <p className="text-blue-600 font-bold text-center mb-4">
              {`${FRONTEND_URL}/video/${uniqueId}`}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCopy}
                className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
              >
                Copy URL
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
