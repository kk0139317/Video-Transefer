'use client'
import { useEffect, useState } from "react";

export default () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const BACKEND_URL = process.env.BACKEND_URL;
  const FRONTEND_URL = process.env.FRONTEND_URL;

  useEffect(() => {
    // Fetch data from the Django API (make sure the URL matches your Django server)
    fetch(`${BACKEND_URL}/api/file-uploads/`)  // Adjust the URL as per your server
      .then((response) => response.json())
      .then((data) => setHistoryItems(data))
      .catch((error) => console.error("Error fetching history data:", error));
  }, []);

  const convertToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);  // Convert bytes to MB and format to 2 decimal places
  };

  const handlePlay = (id) => {
    console.log(`Play action for file ID: ${id}`);
    // Redirect to video page
    window.location.href = `${FRONTEND_URL}/video/${id}`;
  };

  const handleShare = (id) => {
    console.log(`Share action for file ID: ${id}`);
    // Construct the shareable URL
    const url = `${FRONTEND_URL}/video/${id}`;
    setShareUrl(url);
    setShowShareDialog(true);  // Show the share dialog
  };

  const handleDelete = (id) => {
    console.log(`Delete action for file ID: ${id}`);
    // Implement the delete action (e.g., delete the file record)
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);  // Copy the URL to clipboard
    alert("URL copied to clipboard!");  // You can replace with a toast notification if needed
  };

  const handleCloseDialog = () => {
    setShowShareDialog(false);  // Close the dialog
  };

  return (
    <div className="max-w-screen-xl mx-auto mt-20 px-6 md:px-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-indigo-600">File Upload History</h3>
        <p className="text-lg text-gray-600">Here you can find the history of all your uploaded files with status and actions.</p>
      </div>

      <div className="mt-12 shadow-xl border-2 rounded-lg overflow-x-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <table className="w-full table-auto text-sm text-left text-white">
          <thead className="bg-gradient-to-r from-indigo-700 to-purple-600">
            <tr>
              <th className="py-4 px-6">File Name</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">File Size (MB)</th>
              {/* <th className="py-4 px-6">Uploaded Size (MB)</th> */}
              <th className="py-4 px-6">Actions</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="text-gray-200 divide-y bg-gray-800">
            {historyItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4">{item.file_name}</td>
                <td className="px-6 py-4">{item.status}</td>
                <td className="px-6 py-4">{convertToMB(item.file_size)}</td>
                {/* <td className="px-6 py-4">{convertToMB(item.uploaded_size)}</td> */}
                <td className="text-right px-6 py-4 space-x-4">

                  <button
                    onClick={() => handlePlay(item.file_id)}
                    className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition duration-300"
                  >
                    Play
                  </button>
                  </td>
                  <td className="text-right px-6 py-4 space-x-4">
                  <button
                    onClick={() => handleShare(item.file_id)}
                    className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-full transition duration-300"
                    >
                    Share
                  </button>
                  </td>
                  {/* <button
                    onClick={() => handleDelete(item.file_id)}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-full transition duration-300"
                  >
                    Delete
                  </button> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Share URL Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-lg">
            <h4 className="text-xl font-semibold text-center mb-4">Share File</h4>
            <div className="mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-4 py-2 border rounded-lg shadow-sm text-gray-700"
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleCopy}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Copy URL
              </button>
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
