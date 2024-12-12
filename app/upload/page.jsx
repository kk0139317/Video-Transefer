'use client';
import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function UploadChunkedPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [csrfToken, setCsrfToken] = useState("");
  const [fileUrl, setFileUrl] = useState("");  // Store the uploaded file URL
  const [uniqueId, setUniqueId] = useState(""); // Store the unique ID
  const [showPopup, setShowPopup] = useState(false); // Control popup visibility
  const [isUploading, setIsUploading] = useState(false); // Track upload status
  const [recentUploads, setRecentUploads] = useState([]); // State to store recent uploads
  const chunkSize = 5 * 1024 * 1024; // 5MB per chunk
  const FRONTEND_URL = process.env.FRONTEND_URL;
  const BACKEND_URL = process.env.BACKEND_URL;

  // Get CSRF token from the cookie or response header
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    if (token) {
      setCsrfToken(token.split('=')[1]);
    }

    fetchRecentUploads(); // Fetch recent uploads
  }, []);

  const fetchRecentUploads = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/recent-uploads/`, {
        method: "GET",
        headers: {
          'X-CSRFToken': csrfToken,
        }
      });
      const data = await res.json();
      setRecentUploads(data); // Update the recent uploads state
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
    }
  };

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

    setIsUploading(true); // Disable further uploads during the process

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
          const newProgress = Math.floor(((currentChunkIndex + 1) / totalChunks) * 100); // Calculate progress percentage
          setProgress(newProgress);  // Update progress
          if (response.file_url) {
            setFileUrl(response.file_url);
            setUniqueId(response.unique_id); // Store the unique ID from backend
          }
        }
        attempts++;
      }

      if (!success) {
        alert(`Failed to upload chunk ${currentChunkIndex}. Please try again.`);
        setIsUploading(false); // Allow upload retry after failure
        return;
      }

      currentChunkIndex++;
    }

    fetchRecentUploads(); // Refresh recent uploads after successful upload
    setShowPopup(true); // Show popup after upload completion
    setIsUploading(false); // Enable button after upload completes
  };

  const handleCopy = () => {
    const videoUrl = `${FRONTEND_URL}/video/${uniqueId}`;
    navigator.clipboard.writeText(videoUrl).then(() => {
      alert("URL copied to clipboard!");
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await fetch(`${BACKEND_URL}/api/delete-video/${id}/`, {
          method: "GET",
          headers: {
            'X-CSRFToken': csrfToken,
          }
        });
        alert("Video deleted successfully!");
        fetchRecentUploads(); // Refresh the recent uploads
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete the video.");
      }
    }
  };

  const handleShare = (id) => {
    const videoUrl = `${FRONTEND_URL}/video/${id}`;
    navigator.clipboard.writeText(videoUrl).then(() => {
      alert("Video URL copied to clipboard!");
    });
  };

  const handlePlay = (id) => {
    window.location.href = `/video/${id}`;
  };




  const [historyItems, setHistoryItems] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");


  const convertToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };
  
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/file-uploads/`)
      .then((response) => response.json())
      .then((data) => setHistoryItems(data))
      .catch((error) => console.error("Error fetching history data:", error));
  }, []);


  const handleCloseDialog = () => {
    setShowShareDialog(false);
  };

  const handledelete = (id) => {
    fetch(`${BACKEND_URL}/api/delete-video/${id}/`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          alert("File deleted successfully!");
          // Update the local state to remove the deleted item
          setHistoryItems((prevItems) => prevItems.filter((item) => item.file_id !== id));
        } else {
          alert("Failed to delete the file. Please try again.");
        }
      })
      .catch((error) => console.error("Error deleting the file:", error));
  };
  return (
    <>
      <NavBar />
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
              disabled={isUploading} // Disable button during upload
              className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? "Uploading..." : "Start Upload"}
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

        {/* Recent Uploads Section */}
        {/* <div className="relative z-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-md mt-10 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Recent Uploads</h2>
          {recentUploads.length === 0 ? (
            <p className="text-gray-500">No recent uploads found.</p>
          ) : (
            <ul className="space-y-4">
              {recentUploads.slice(-5).reverse().map((upload) => (
                <li key={upload.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-900">{upload.file_name}</p>
                    <input type="text" className=" w-52 px-2 border-s border-x border-y " 
                    value={upload.file_name}
                    placeholder={upload.file_name}
                    readOnly
                    />
                    <p className="text-sm text-gray-500">{new Date(upload.uploadDate).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleShare(upload.file_id)}
                      className="bg-blue-500 text-white py-0 px-2 h-6 rounded-lg text-xs  shadow-md hover:bg-red-600"
                    >
                      Share
                    </button>
                  <button
                      onClick={() => handlePlay(upload.file_id)}
                      className="bg-green-500 text-white py-0 px-2 h-6 rounded-lg text-xs  shadow-md hover:bg-red-600"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleDelete(upload.file_id)}
                      className="bg-red-500 text-white py-0 px-2 h-6 rounded-lg text-xs  shadow-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div> */}


        <div className="max-w-screen-xl mx-auto z-10 mt-6 px-6 md:px-8">
        <div className="text-center mb-0">
          <h3 className="text-4xl font-extrabold text-gray-800 mb-0">Recent Upload</h3>
          {/* <p className="text-lg text-gray-600">
            Track your uploaded files, check their status, and take quick actions.
          </p> */}
        </div>

        <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          <table className="w-full table-auto text-sm text-left">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="py-4 px-6">File Name</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">File Size (MB)</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* {historyItemsreverse().map((item, idx) => ( */}
                {historyItems.slice(-5).reverse().map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-100 transition duration-300 ease-in-out"
                >
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {item.file_name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {convertToMB(item.file_size)}
                  </td>
                  <td className="px-6 py-4 flex justify-center space-x-4">
                    <button
                      onClick={() => handlePlay(item.file_id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleShare(item.file_id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
                    >
                      Share
                    </button>
                    <button
  onClick={() => handledelete(item.file_id)}
  className="px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
>
  Delete
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Share URL Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
              <h4 className="text-2xl font-semibold text-center mb-4 text-gray-800">
                Share File
              </h4>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 mb-4"
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={handleCopy}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                >
                  Copy URL
                </button>
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg shadow-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
