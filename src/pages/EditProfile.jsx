import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronDown, Camera } from "lucide-react";
import apiClient from "../api/apiClient";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    age: 0,
    disabilityType: "",
    id: "",
    isActive: true,
    registrationDate: "",
    profilePictureUrl: "/images/profile.png",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get("/UserProfile");
        const data = response.data;
        setFormData({
          userName: data.userName || "",
          email: data.email || "",
          password: "",
          age: data.age || 0,
          disabilityType:
            data.disabilityTypes && data.disabilityTypes.length > 0
              ? data.disabilityTypes[0].name || data.disabilityTypes[0] || ""
              : "",
          id: data.id || "",
          isActive: data.isActive || true,
          registrationDate: data.registrationDate || "",
          profilePictureUrl: data.profilePictureUrl || "/images/profile.png",
        });
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response ? err.response.data : err.message
        );
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    e.preventDefault(); // Prevent default form submission
    e.stopPropagation(); // Stop event propagation

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    try {
      // Get SAS token for upload
      const sasResponse = await apiClient.get(
        "/UserProfile/generateProfilePictureUploadSas"
      );
      const sasUrl = sasResponse.data;
      console.log("SAS URL:", sasUrl);

      // Extract base URL and SAS token
      const [baseUrl, sasToken] = sasUrl.split("?");
      if (!baseUrl || !sasToken) {
        throw new Error("Invalid SAS URL format");
      }

      // Use the exact same URL from the SAS token
      const blobUrl = sasUrl;
      console.log("Using SAS URL directly:", blobUrl);

      // Get current date in RFC1123 format
      const date = new Date().toUTCString();

      // Upload file to blob storage
      const uploadResponse = await fetch(blobUrl, {
        method: "PUT",
        body: file,
        headers: {
          "x-ms-blob-content-type": file.type,
          "x-ms-blob-type": "BlockBlob",
          "Content-Length": file.size,
          "x-ms-version": "2020-04-08",
          "x-ms-date": date,
          "x-ms-blob-content-disposition": `inline; filename="${file.name}"`,
          "x-ms-blob-cache-control": "max-age=31536000",
          "x-ms-meta-m1": "v1",
          "x-ms-meta-m2": "v2",
          Origin: window.location.origin,
          Accept: "*/*",
        },
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
          url: blobUrl,
          baseUrl,
          sasToken,
          headers: {
            "x-ms-blob-content-type": file.type,
            "x-ms-blob-type": "BlockBlob",
            "Content-Length": file.size,
            "x-ms-version": "2020-04-08",
            "x-ms-date": date,
            "x-ms-blob-content-disposition": `inline; filename="${file.name}"`,
            "x-ms-blob-cache-control": "max-age=31536000",
            "x-ms-meta-m1": "v1",
            "x-ms-meta-m2": "v2",
            Origin: window.location.origin,
            Accept: "*/*",
          },
        });
        throw new Error(
          `Upload failed with status: ${uploadResponse.status} - ${errorText}`
        );
      }

      console.log("Upload successful");

      // Extract the filename from the SAS URL
      const filename = baseUrl.split("/").pop();

      // Save the profile picture URL in the database
      try {
        const saveResponse = await apiClient.put(
          `/UserProfile/ProfilePicture/${filename}`
        );
        console.log("Save response:", saveResponse.data);

        // Update local state with new profile picture
        const profilePictureResponse = await apiClient.get(
          "/UserProfile/profile-picture"
        );
        const newProfilePictureUrl = profilePictureResponse.data;
        console.log("New profile picture URL:", newProfilePictureUrl);

        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: newProfilePictureUrl,
        }));

        // Show success message
        alert("Profile picture uploaded successfully!");

        // Clear the file input
        e.target.value = "";
      } catch (error) {
        console.error("Error saving profile picture reference:", error);
        if (error.response && error.response.status === 500) {
          // If we get a 500 error but the upload was successful, show a different message
          alert(
            "Profile picture uploaded but there was an issue saving the reference. The picture should still be available."
          );
        } else {
          alert("Failed to save profile picture reference. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error in profile picture upload process:", error);
      // More specific error handling for upload
      if (error.message.includes("403")) {
        alert(
          "Permission denied to upload profile picture. Please check your account permissions."
        );
      } else if (
        error.message.includes("status") &&
        error.message.includes("-")
      ) {
        // Extract status code if available in the error message
        const statusMatch = error.message.match(/status: (\d+)/);
      } else {
        alert(
          "An unexpected error occurred during profile picture upload. Please try again."
        );
      }
      // Clear the file input on error
      e.target.value = "";
    }
  };

  // Add a separate click handler for the camera button
  const handleCameraClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Invalid email format");
      }
      if (formData.password && formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Prepare the update data
      const updateData = {
        id: formData.id,
        userName: formData.userName,
        email: formData.email,
        disabilityTypes: formData.disabilityType
          ? [
              {
                id: 1,
                name: formData.disabilityType,
              },
            ]
          : [],
        isActive: formData.isActive,
        age: parseInt(formData.age) || 0,
        registrationDate: formData.registrationDate || new Date().toISOString(),
        profilePictureUrl: formData.profilePictureUrl || null,
        coverPictureUrl: null,
      };

      // Only include password if it's not empty
      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log("Updating profile with data:", updateData);

      // Try to update the profile with retry logic
      let retryCount = 0;
      const maxRetries = 2;
      let response;

      while (retryCount <= maxRetries) {
        try {
          response = await apiClient.put("/UserProfile", updateData);
          console.log("Profile update response:", {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
          });
          break; // If successful, break the retry loop
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw error; // If we've exhausted retries, throw the error
          }
          console.log(`Retry attempt ${retryCount} of ${maxRetries}`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }

      // If we get here, the update was successful
      console.log(
        "Profile update successful, proceeding with disability update"
      );

      // If profile update is successful, try to update disability types separately
      let disabilityUpdateSuccess = true;
      if (formData.disabilityType) {
        try {
          const disabilityResponse = await apiClient.put(
            `/UserDisabilities/user/${formData.id}`,
            {
              disabilityTypes: [
                {
                  id: 1,
                  name: formData.disabilityType,
                },
              ],
            }
          );
          console.log("Disability types update response:", {
            status: disabilityResponse.status,
            statusText: disabilityResponse.statusText,
            data: disabilityResponse.data,
          });
        } catch (error) {
          console.error("Error updating disability types:", error);
          disabilityUpdateSuccess = false;
        }
      }

      // Show appropriate success message
      if (disabilityUpdateSuccess) {
        alert("Profile updated successfully!");
      } else {
        alert(
          "Profile updated but there was an issue updating disability types. You can try updating them again later."
        );
      }

      // Redirect to Profile page to refetch data
      window.location.href = "/profile";
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response
          ? {
              data: error.response.data,
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
            }
          : error.message
      );

      // Show more specific error message based on response status
      if (error.response) {
        switch (error.response.status) {
          case 400:
            alert(
              "Invalid data provided. Please check your input and try again."
            );
            break;
          case 401:
            alert("Please log in again to update your profile.");
            break;

          default:
           break;
        }
      } else if (error.message === "Invalid email format") {
        alert("Please enter a valid email address.");
      } else if (
        error.message === "Password must be at least 6 characters long"
      ) {
        alert("Password must be at least 6 characters long.");
      } else {
        alert(
          "An unexpected error occurred during profile update. Please try again."
        );
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden edit-profile-container">
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-gray-200 edit-profile-header">
        <button
          className="mr-4 hover:bg-gray-100 p-1 rounded-full back-button"
          onClick={() => (window.location.href = "/profile")}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-medium flex-1 text-center">Edit Profile</h1>
      </header>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Profile Photo */}
        <div className="flex justify-center mb-6">
          <div className="profile-image-container relative">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden profile-image">
              <img
                src={formData.profilePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/fallback.png";
                }}
              />
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md camera-button"
              onClick={handleCameraClick}
            >
              <Camera size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Username */}
          <div className="form-control-p ms-3 me-3">
            <label
              htmlFor="userName"
              className="form-label block text-sm font-medium text-gray-700 mb-1 ms-1"
            >
              Username
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div className="form-control-p ms-3 me-3">
            <label
              htmlFor="email"
              className="form-label block text-sm font-medium text-gray-700 mb-1 ms-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div className="form-control-p ms-3 me-3">
            <label
              htmlFor="password"
              className="form-label block text-sm font-medium text-gray-700 mb-1 ms-1"
            >
              Password (leave blank to keep unchanged)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Age */}
          <div className="form-control-p ms-3 me-3">
            <label
              htmlFor="age"
              className="form-label block text-sm font-medium text-gray-700 mb-1 ms-1"
            >
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          {/* Disability Type */}
          <div className="form-control-p ms-3 me-3">
            <label
              htmlFor="disabilityType"
              className="form-label block text-sm font-medium text-gray-700 mb-1 ms-1"
            >
              Disability Type
            </label>
            <div className="relative select-wrapper">
              <select
                id="disabilityType"
                name="disabilityType"
                value={formData.disabilityType}
                onChange={handleChange}
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="mobility">Mobility</option>
                <option value="vision">Vision</option>
                <option value="hearing">Hearing</option>
                <option value="cognitive">Cognitive</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none select-icon">
                <ChevronDown size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            type="submit"
            className="save-button w-full bg-blue-100 text-blue-800 font-medium py-2 px-4 rounded-md hover:bg-blue-200 transition-colors"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
