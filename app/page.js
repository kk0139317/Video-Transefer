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
  const FRONTEND_URL = process.env.FRONTEND_URL
  const BACKEND_URL = process.env.BACKEND_URL

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
    // alert("File upload complete!");
  };

  const handleCopy = () => {
    const videoUrl = `${FRONTEND_URL}/video/${uniqueId}`;
    navigator.clipboard.writeText(videoUrl).then(() => {
      alert("URL copied to clipboard!");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Upload Your video</h1>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full px-3 py-2 mb-4 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleUpload}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Upload
        </button>
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Progress: {progress}%</h2>
          <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className={`h-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Popup for showing video URL */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">File Uploaded Successfully!</h2>
            <p className="text-gray-700 mb-4">
              Your video URL: <span className="text-blue-600">{`${FRONTEND_URL}/video/${uniqueId}`}</span>
            </p>
            <button
              onClick={handleCopy}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition mb-4"
            >
              Copy URL
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
