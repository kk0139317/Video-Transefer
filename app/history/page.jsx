'use client';

import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import Link from "next/link";

export default () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const BACKEND_URL = process.env.BACKEND_URL;
  const FRONTEND_URL = process.env.FRONTEND_URL;

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/file-uploads/`)
      .then((response) => response.json())
      .then((data) => setHistoryItems(data))
      .catch((error) => console.error("Error fetching history data:", error));
  }, []);

  const convertToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const handlePlay = (id) => {
    window.location.href = `${FRONTEND_URL}/video/${id}`;
  };

  const handleShare = (id) => {
    const url = `${FRONTEND_URL}/video/${id}`;
    setShareUrl(url);
    setShowShareDialog(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("URL copied to clipboard!");
  };

  const handleCloseDialog = () => {
    setShowShareDialog(false);
  };

  return (
    <>
      <NavBar />
      <div className="max-w-screen-xl mx-auto mt-20 px-6 md:px-8">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-gray-800 mb-4">File Upload History</h3>
          <p className="text-lg text-gray-600">
            Track your uploaded files, check their status, and take quick actions.
          </p>
        </div>

        <div className="mt-12 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
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
              {historyItems.map((item, idx) => (
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
    </>
  );
};
