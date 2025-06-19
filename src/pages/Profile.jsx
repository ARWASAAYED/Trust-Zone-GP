import React, { useState, useEffect } from "react";
import { Edit, LogOut, AlertCircle, RefreshCw } from "lucide-react";
import { MdDateRange } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const Profile = () => {
  const [userData, setUserData] = useState({
    id: "",
    userName: "username",
    email: "user123@gmail.com",
    age: 0,
    disabilityType: "disability type",
    profilePictureUrl: "/images/profile.png",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    console.log("Fetching user profile...");

    try {
      const response = await apiClient.get("/UserProfile");
      console.log("API Response:", response.data);
      if (response && response.data) {
        setUserData({
          id: response.data.id || "",
          userName: response.data.userName || "username",
          email: response.data.email || "user123@gmail.com",
          age: response.data.age || 0,
          disabilityType:
            response.data.disabilityTypes &&
            response.data.disabilityTypes.length > 0
              ? response.data.disabilityTypes[0].name ||
                response.data.disabilityTypes[0] ||
                "disability type"
              : "disability type",
          profilePictureUrl:
            response.data.profilePictureUrl || "/images/profile.png",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error details:", err);
      if (err.message && err.message.includes("Network Error")) {
        setErrorType("cors");
        setError("CORS error: Cannot access the API from this domain.");
      } else if (err.response && err.response.status === 401) {
        setErrorType("auth");
        setError("Authentication error: Please log in again.");
      } else if (err.response && err.response.status === 500) {
        setErrorType("server");
        setError("Server error: Something went wrong on the server.");
      } else if (err.response && err.response.status === 404) {
        setErrorType("notfound");
        setError("Endpoint not found. Check the API path with the provider.");
      } else {
        setErrorType("unknown");
        setError("An error occurred while loading your profile.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleRetry = () => {
    fetchUserProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleEdit = () => {
    window.location.href = "/edit-profile";
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden profile-container">
      <header className="flex items-center px-6 py-4 border-b border-gray-200 profile-header">
        <h1 className="text-xl font-medium flex-1 text-center">Profile</h1>
      </header>

      <div className="p-6">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">Error</span>
            </div>
            <p className="text-red-600 mb-3">{error}</p>

            {errorType === "cors" && (
              <div className="text-sm text-red-600 mb-3 p-2 bg-red-100 rounded">
                <p className="font-medium">CORS Issue Detected</p>
                <p className="mt-1">
                  This is a Cross-Origin Resource Sharing restriction. Your
                  application running on localhost cannot access the API on a
                  different domain.
                </p>
                <p className="mt-1">Solutions:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Use a CORS proxy</li>
                  <li>Configure your Vite dev server as a proxy</li>
                  <li>Enable CORS on your backend server</li>
                </ul>
              </div>
            )}

            {errorType === "notfound" && (
              <div className="text-sm text-red-600 mb-3 p-2 bg-red-100 rounded">
                <p className="font-medium">Endpoint Not Found</p>
                <p className="mt-1">
                  The API endpoint was not found. Please verify the correct path
                  with the API provider.
                </p>
              </div>
            )}

            <button
              onClick={handleRetry}
              className="flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-md text-red-700 transition"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex justify-center mb-6">
              <div className="profile-avatar w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                <img
                  src={userData.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/fallback.png";
                  }}
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center py-3 border-b border-gray-200 info-item">
                <img
                  className="text-gray-500 ml-4 info-icon"
                  src="/images/FrameP.svg"
                  style={{ width: "20px" }}
                  alt="Username icon"
                />
                <span
                  className="text-gray-800 ml-4 info-text  "
                  style={{ marginLeft: "1rem", color: "black" }}
                >
                  {userData.userName}
                </span>
              </div>
              <div className="flex items-center py-3 border-b border-gray-200 info-item">
                <img
                  className="text-gray-500 ml-4 info-icon"
                  src="/images/FrameE.svg"
                  style={{ width: "20px" }}
                  alt="Email icon"
                />
                <span
                  className="text-gray-800 ml-4 info-text"
                  style={{ marginLeft: "1rem", color: "black" }}
                >
                  {userData.email}
                </span>
              </div>
              <div className="flex items-center py-3 border-b border-gray-200 info-item">
                <MdDateRange
                  className="text-gray-500 ml-4 info-icon"
                  style={{ width: "25px", color: "black", fontSize: "25px" }}
                  alt="Age icon"
                />
                <span
                  className="text-gray-800 ml-4 info-text"
                  style={{ marginLeft: "1rem", color: "black" }}
                >
                  {userData.age}
                </span>
              </div>
              <div className="flex items-center py-3 border-b border-gray-200 info-item">
                <img
                  className="text-gray-500 ml-4 info-icon"
                  src="/images/Frame.svg"
                  style={{ width: "25px" }}
                  alt="Disability icon"
                />
                <span
                  className="text-gray-800 ml-4 info-text"
                  style={{ marginLeft: "1rem", color: "black" }}
                >
                  {userData.disabilityType}
                </span>
              </div>
              <div
                className="flex items-center py-3 border-b border-gray-200 info-item"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/favorite-places")}
              >
                <FaHeart
                  className="text-gray-500 ml-4 info-icon"
                  style={{ width: "25px" }}
                  alt="Fav icon"
                />
                <span
                  className="text-gray-800 ml-4 info-text"
                  style={{ marginLeft: "1rem", color: "black" }}
                >
                  My Fav Places
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 action-buttons">
              <button
                onClick={handleEdit}
                className="action-button flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Edit size={18} className="mr-2 button-icon" />
                <span>EDIT</span>
              </button>
              <button
                onClick={handleLogout}
                className="action-button flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <LogOut size={18} className="mr-2 button-icon" />
                <span>LOG OUT</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
