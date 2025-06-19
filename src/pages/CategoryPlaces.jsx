import React, { useEffect, useState } from "react";
import {
  getAllBranches,
  getBranchOpeningHours,
  getBranchPhotos,
  getBranchReviews,
  createReview,
  deleteReview,
} from "../api/BranchApiClient";
import { isOpenNow, formatTimeForDisplay, getDayName } from "../utils/utils";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import FilterModal from "../components/FilterModal";

function CategoryPlaces() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [reviewerProfiles, setReviewerProfiles] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [selectedReview, setSelectedReview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilterFeatures, setSelectedFilterFeatures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const navigate = useNavigate();

  const categoryMap = {
    1: "Restaurant",
    2: "Retail Stores",
    3: "Fitness",
    4: "Mosque",
    6: "Healthcare Facilities",
    7: "Clubs",
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllBranches();

      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setError("No branches found");
          setBranches([]);
        } else {
          const branchesWithData = await Promise.all(
            response.data.map(async (branch) => {
              let openingHoursData = [];
              let hoursErrorMessage = "";
              try {
                const hoursResponse = await getBranchOpeningHours(branch.id);
                openingHoursData = Array.isArray(hoursResponse.data)
                  ? hoursResponse.data.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  : [];
              } catch (err) {
                if (
                  err.response?.status === 404 &&
                  err.response?.data ===
                    "No opening hours found for this branch"
                ) {
                  openingHoursData = [
                    {
                      id: -1,
                      branchId: branch.id,
                      dayOfWeek: new Date().getDay(),
                      openingTime: "N/A",
                      closingTime: "N/A",
                      isClosed: true,
                    },
                  ];
                  hoursErrorMessage = `No opening hours found for branch ${branch.id}.`;
                } else {
                  hoursErrorMessage = `Failed to load hours: ${err.message}.`;
                }
              }

              let photosData = [];
              let photosErrorMessage = "";
              try {
                const photosResponse = await getBranchPhotos(branch.id);
                photosData = Array.isArray(photosResponse.data)
                  ? photosResponse.data
                  : [];
              } catch (err) {
                if (err.response?.status === 404) {
                  photosErrorMessage = `No photos found for branch ${branch.id}.`;
                } else {
                  photosErrorMessage = `Failed to load photos: ${err.message}.`;
                }
              }

              const featuresCount = branch.place?.features?.length || 0;
              let accessibilityLevel;
              if (featuresCount === 0) {
                accessibilityLevel = "not accessible";
              } else if (featuresCount <= 2) {
                accessibilityLevel = "partially accessible";
              } else {
                accessibilityLevel = "accessible";
              }

              return {
                ...branch,
                placeName: branch.place?.name || branch.address,
                accessibilityLevel,
                openingHours: openingHoursData,
                hoursError: hoursErrorMessage,
                photos: photosData,
                photosError: photosErrorMessage,
              };
            })
          );
          setBranches(branchesWithData);

          const urlParams = new URLSearchParams(window.location.search);
          const categoryIdParam = urlParams.get("categoryId");
          const branchCategories = [
            ...new Set(
              branchesWithData
                .map((b) => b.place?.categoryId)
                .filter((id) => id !== undefined)
            ),
          ];
          if (
            categoryIdParam &&
            branchCategories.includes(parseInt(categoryIdParam))
          ) {
            setSelectedCategoryId(parseInt(categoryIdParam));
          } else if (branchCategories.length > 0) {
            setSelectedCategoryId(branchCategories[0]);
          } else {
            setSelectedCategoryId(null);
          }
        }
      } else {
        setError("Invalid branches data received");
        setBranches([]);
      }
    } catch (err) {
      setError(
        `Failed to load branches: ${err.response?.data?.message || err.message}`
      );
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (branchId) => {
    try {
      setLoadingReviews(true);
      setReviewError("");
      const response = await getBranchReviews(branchId, 1, 100);
      const reviews = Array.isArray(response.data) ? response.data : [];
      setReviews(reviews);

      reviews.forEach((review) => {
        if (review.user?.id) {
          fetchReviewerProfile(review.user.id);
        }
      });
    } catch (err) {
      setReviewError(
        `Failed to load reviews: ${err.response?.data?.message || err.message}`
      );
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await apiClient.get("/FavoritePlace");
      const favoritesData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      const favoriteIds = favoritesData.map(
        (favorite) => favorite.branch?.id || favorite.branchId
      );
      setFavorites(favoriteIds);
      setFavoriteError("");
    } catch (err) {
      setFavoriteError(
        err.response
          ? `Failed to load favorites: ${
              err.response.data?.message || err.response.statusText
            }`
          : err.message || "Network error"
      );
    } finally {
      setLoadingFavorites(false);
    }
  };

  const toggleFavorite = async (locationId) => {
    try {
      setLoadingFavorites(true);
      if (favorites.includes(locationId)) {
        await apiClient.delete(`/FavoritePlace/${locationId}`);
        setFavorites((prev) => prev.filter((id) => id !== locationId));
      } else {
        try {
          await apiClient.post("/FavoritePlace", { branchId: locationId });
          setFavorites((prev) => [...prev, locationId]);
        } catch (err) {
          if (
            err.response?.status === 400 &&
            err.response?.data === "Branch already favorited by user"
          ) {
            setFavorites((prev) => [...prev, locationId]);
          } else {
            throw err;
          }
        }
      }
      setFavoriteError("");
    } catch (err) {
      setFavoriteError(
        err.response
          ? `Failed to update favorites: ${
              err.response.data?.message || err.response.statusText
            }`
          : err.message || "Network error"
      );
    } finally {
      setLoadingFavorites(false);
    }
  };

  const getAverageRating = (branchId) => {
    const branchReviews = reviews.filter(
      (review) => review.branchId === branchId
    );
    if (!branchReviews.length) return 0;
    const sum = branchReviews.reduce(
      (acc, review) => acc + (review.rating || 0),
      0
    );
    return (sum / branchReviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("★");
      } else if (i === fullStars && hasHalfStar) {
        stars.push("½");
      } else {
        stars.push("☆");
      }
    }
    return stars.join("");
  };

  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        branchId: selectedLocation.id,
        rating: newReview.rating,
        comment: newReview.comment,
      };
      await createReview(reviewData);
      setShowReviewModal(false);
      setNewReview({ rating: 0, comment: "" });
      fetchReviews(selectedLocation.id);
      setSuccessMessage("Review submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit review"
      );
    }
  };

  const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedReview?.id) throw new Error("No review selected");
      const reviewData = {
        branchId: selectedLocation.id,
        rating: newReview.rating,
        comment: newReview.comment,
      };
      await deleteReview(selectedReview.id);
      await createReview(reviewData);
      setShowReviewModal(false);
      setSelectedReview(null);
      setNewReview({ rating: 0, comment: "" });
      fetchReviews(selectedLocation.id);
      setSuccessMessage("Review updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update review"
      );
    }
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setNewReview({ rating: review.rating, comment: review.comment });
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(reviewId);
      fetchReviews(selectedLocation.id);
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete review"
      );
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newBooking = {
      locationId: selectedLocation.id,
      date: formData.get("bookingDate"),
      time: formData.get("bookingTime"),
    };
    setBookings((prev) => [...prev, newBooking]);
    setShowBookingModal(false);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get("/UserProfile");
      if (response?.data) {
        setUserProfile(response.data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUserProfile({});
    }
  };

  const fetchReviewerProfile = async (userId) => {
    if (!userId || reviewerProfiles[userId]) return;
    try {
      const response = await apiClient.get(`/UserProfile/${userId}`);
      if (response?.data) {
        setReviewerProfiles((prev) => ({
          ...prev,
          [userId]: response.data,
        }));
      }
    } catch (err) {
      console.error(`Error fetching reviewer profile for ${userId}:`, err);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchFavorites();
    fetchUserProfile();
  }, []);

  const getCategoryName = (categoryId) =>
    categoryMap[categoryId] || `Category ${categoryId}`;

  const getColorForAccessibility = (level) => {
    switch (level) {
      case "accessible":
        return "#28A745";
      case "partially accessible":
        return "#EDB106";
      case "not accessible":
        return "#B5000D";
      default:
        return "#0000FF";
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(parseInt(categoryId));
  };

  const handleApplyFilters = async (features) => {
    setSelectedFilterFeatures(features);
    if (features.length > 0) {
      try {
        setLoading(true);
        setError("");

        // Filter branches based on search terms in details
        const filteredBranches = branches.filter((branch) => {
          const branchDetails = branch.place?.details?.toLowerCase() || "";
          const branchFeatures = branch.place?.features || [];
          const featureNames = branchFeatures.map((f) =>
            f.featureName.toLowerCase()
          );

          // Check if any of the search terms appear in details or feature names
          return features.some((feature) => {
            const searchTerm = feature.toLowerCase();
            return (
              branchDetails.includes(searchTerm) ||
              featureNames.some((name) => name.includes(searchTerm))
            );
          });
        });

        if (filteredBranches.length > 0) {
          setBranches(filteredBranches);
        } else {
          setBranches([]);
          setError("No branches found matching the search terms.");
        }
      } catch (err) {
        console.error("Error filtering branches:", err);
        setError(
          `Failed to filter branches: ${
            err.response?.data?.message || err.message
          }`
        );
        setBranches([]);
      } finally {
        setLoading(false);
      }
    } else {
      // If no features selected, fetch all branches
      fetchBranches();
    }
  };

  // Filter branches by category and search term
  const filteredBranches = branches.filter((branch) => {
    // Category filter
    if (
      selectedCategoryId !== null &&
      branch.place?.categoryId !== selectedCategoryId
    ) {
      return false;
    }
    // Search filter
    if (searchTerm.trim() === "") return true;
    const term = searchTerm.toLowerCase();
    const inName = branch.placeName?.toLowerCase().includes(term);
    const inAddress = branch.address?.toLowerCase().includes(term);
    const inDetails = branch.place?.details?.toLowerCase().includes(term);
    const inFeatures = branch.place?.features?.some((f) =>
      f.featureName?.toLowerCase().includes(term)
    );
    return inName || inAddress || inDetails || inFeatures;
  });

  return (
    <div className="category-places-container">
      <header
        className="category-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <h1 className="category-title" style={{ margin: 0 }}>
          Places by Category
        </h1>
        <input
          type="text"
          placeholder="Search for any place..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            minWidth: 220,
          }}
        />
        <div
          className="category-controls"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <div className="category-selector-wrapper">
            <label htmlFor="category-selector" className="category-label">
              Select Category
            </label>
            <select
              id="category-selector"
              value={selectedCategoryId || ""}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-selector"
              disabled={loading || branches.length === 0}
              style={{ marginRight: "10px" }}
            >
              {loading ? (
                <option value="">Loading categories...</option>
              ) : branches.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                [
                  ...new Set(
                    branches
                      .map((b) => b.place?.categoryId)
                      .filter((id) => id !== undefined)
                  ),
                ].map((categoryId) => (
                  <option key={categoryId} value={categoryId}>
                    {getCategoryName(categoryId)} (
                    {
                      branches.filter((b) => b.place?.categoryId === categoryId)
                        .length
                    }{" "}
                    places)
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            onClick={() => setIsFilterModalVisible(true)}
            className="filter-button"
            style={{
              background: "#1b4965",
              color: "#fff",
              borderRadius: "20px",
              padding: "10px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              height: "38px",
              marginTop: "24px",
            }}
          >
            Filter
          </button>
        </div>
      </header>

      <main className="category-main">
        {loading ? (
          <p className="loading-text">Loading branches...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : selectedCategoryId !== null ? (
          <section className="category-section">
            <h2 className="category-section-title">
              {getCategoryName(selectedCategoryId)}
            </h2>
            <div className="branch-list">
              {filteredBranches.map((branch) => {
                const currentDay = new Date().getDay();
                const todayHours =
                  branch.openingHours?.find(
                    (hour) => hour.dayOfWeek === currentDay
                  ) || branch.openingHours?.[0];

                const isOpen = todayHours ? isOpenNow(todayHours) : false;

                const formattedHours =
                  todayHours?.openingTime && todayHours?.closingTime
                    ? `${formatTimeForDisplay(
                        todayHours.openingTime
                      )} - ${formatTimeForDisplay(todayHours.closingTime)}`
                    : "N/A";

                return (
                  <div
                    key={branch.id}
                    className={`branch-card ${
                      selectedLocation?.id === branch.id
                        ? "branch-card-selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedLocation(branch);
                      fetchReviews(branch.id);
                    }}
                  >
                    {/* Show all images for the branch */}
                    {branch.photos && branch.photos.length > 0 && (
                      <div
                        className="branch-images-list"
                        style={{
                          display: "flex",
                          gap: "4px",
                          overflowX: "auto",
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {branch.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo.photoUrl}
                            alt={`Photo ${idx + 1} of ${branch.address}`}
                            className="branch-image"
                            onClick={() => {
                              setLightboxImg(photo.photoUrl);
                              setLightboxOpen(true);
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/placeholder.png";
                            }}
                            style={{
                              maxWidth: 160,
                              maxHeight: 120,
                              borderRadius: 8,
                              objectFit: "cover",
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              transition: "transform 0.2s",
                              marginBottom: 4,
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform = "scale(1.07)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          />
                        ))}
                      </div>
                    )}
                    <div className="branch-content">
                      <h3 className="branch-title">{branch.placeName}</h3>
                      <div className="branch-info">
                        <p>
                          <span className="info-label">Address:</span>{" "}
                          {branch.address || "N/A"}
                        </p>
                        <p className="accessibility">
                          <span className="info-label">Accessibility:</span>{" "}
                          <span
                            style={{
                              color: getColorForAccessibility(
                                branch.accessibilityLevel
                              ),
                            }}
                          >
                            {branch.accessibilityLevel === "accessible"
                              ? "Fully Accessible"
                              : branch.accessibilityLevel ===
                                "partially accessible"
                              ? "Partially Accessible"
                              : "Not Accessible"}
                          </span>
                        </p>
                        <p>
                          <span className="info-label">Category:</span>{" "}
                          {getCategoryName(branch.place?.categoryId)}
                        </p>
                        <p>
                          <span className="info-label">Created:</span>{" "}
                          {branch.createdAt
                            ? new Date(branch.createdAt).toLocaleString()
                            : "N/A"}
                        </p>
                        <p>
                          <span className="info-label">Coordinates:</span>{" "}
                          {branch.place?.latitude && branch.place?.longitude
                            ? `${branch.place.latitude}, ${branch.place.longitude}`
                            : "N/A"}
                        </p>
                        <p>
                          <span className="info-label">Rating:</span>{" "}
                          {renderStars(getAverageRating(branch.id))} (
                          {getAverageRating(branch.id) || "No ratings"})
                        </p>
                        {branch.openingHours &&
                        branch.openingHours.length > 0 ? (
                          <p
                            className={`opening-hours ${
                              isOpen ? "open" : "closed"
                            }`}
                          >
                            <span className="info-label">
                              {getDayName(currentDay)}:
                            </span>{" "}
                            {formattedHours}{" "}
                            {!todayHours?.isClosed &&
                              (isOpen ? "(Open Now)" : "(Closed)")}
                          </p>
                        ) : branch.hoursError ? (
                          <p className="error-text">{branch.hoursError}</p>
                        ) : (
                          <p>Opening hours not available.</p>
                        )}
                        {branch.phone && (
                          <p>
                            <span className="info-label">Phone:</span>{" "}
                            <a href={`tel:${branch.phone}`}>{branch.phone}</a>
                          </p>
                        )}
                        {branch.website && (
                          <p>
                            <span className="info-label">Website:</span>{" "}
                            <a
                              href={branch.website}
                              className="link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit
                            </a>
                          </p>
                        )}
                        {branch.place?.details && (
                          <p>
                            <span className="info-label">Details:</span>{" "}
                            {branch.place.details}
                          </p>
                        )}
                        {branch.place?.features &&
                          branch.place.features.length > 0 && (
                            <div>
                              <span className="info-label">Features:</span>
                              <ul className="features-list">
                                {branch.place.features.map((feature, index) => (
                                  <li key={index}>{feature.featureName}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {branch.photosError && (
                          <p className="error-text">{branch.photosError}</p>
                        )}
                        {successMessage && (
                          <p className="success-message">{successMessage}</p>
                        )}
                      </div>
                      <button
                        className={`favorite-button ${
                          loadingFavorites ? "loading" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const token = localStorage.getItem("token");
                          if (!token) {
                            setFavoriteError(
                              "Please log in to manage favorites"
                            );
                            return;
                          }
                          toggleFavorite(branch.id);
                        }}
                        disabled={
                          loadingFavorites || !localStorage.getItem("token")
                        }
                        title={
                          !localStorage.getItem("token")
                            ? "Please log in to manage favorites"
                            : ""
                        }
                      >
                        {loadingFavorites
                          ? "Loading..."
                          : favorites.includes(branch.id)
                          ? "❤️ Remove"
                          : "♡ Add"}
                      </button>
                      {favoriteError && (
                        <p className="error-text">{favoriteError}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : branches.length > 0 && selectedCategoryId === null ? (
          <p className="info-text">Select a category to view places.</p>
        ) : (
          <p className="info-text">No places found.</p>
        )}
      </main>

      {selectedLocation && (
        <aside className="location-details-panel2">
          <button
            className="close-button"
            onClick={() => setSelectedLocation(null)}
            aria-label="Close details"
          >
            ×
          </button>
          <h3 className="location-title">{selectedLocation.placeName}</h3>
          {selectedLocation.photos && selectedLocation.photos.length > 0 && (
            <div
              className="sidebar-images-list"
              style={{
                display: "flex",
                gap: "4px",
                overflowX: "auto",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {selectedLocation.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo.photoUrl}
                  alt={`Photo ${idx + 1} of ${selectedLocation.address}`}
                  className="location-image"
                  onClick={() => {
                    setLightboxImg(photo.photoUrl);
                    setLightboxOpen(true);
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder.png";
                  }}
                  style={{
                    maxWidth: 160,
                    maxHeight: 120,
                    borderRadius: 8,
                    objectFit: "cover",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s",
                    marginBottom: 4,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.07)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
              ))}
            </div>
          )}
          <div className="location-info">
            <div className="info-group">
              <h4>Address</h4>
              <p className="sidebar-location-address">
                {selectedLocation.address}
              </p>
            </div>
            <div className="info-group">
              <button
                className="action-button add-review-button"
                onClick={() => {
                  setSelectedReview(null);
                  setShowReviewModal(true);
                }}
              >
                Add Review
              </button>
            </div>
            <div className="info-group">
              <h4>Reviews ({reviews.length || 0})</h4>
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviewError ? (
                <p className="error-text">{reviewError}</p>
              ) : reviews.length > 0 ? (
                <ul className="reviews-list">
                  {reviews.map((review) => {
                    const reviewerProfile = reviewerProfiles[review.user?.id];
                    const profileImageUrl =
                      reviewerProfile?.profilePictureUrl ||
                      review.user?.profilePictureUrl ||
                      "/images/profile.png";
                    return (
                      <li key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <img
                              src={profileImageUrl}
                              alt="Reviewer profile"
                              className="reviewer-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/profile.png";
                              }}
                            />
                            <span
                              className="reviewer-name"
                              onClick={() => {
                                if (review.user?.id) {
                                  navigate("/chat", {
                                    state: { targetUserId: review.user.id },
                                  });
                                }
                              }}
                            >
                              {reviewerProfile?.userName ||
                                review.user?.userName ||
                                "Anonymous"}
                            </span>
                            <span className="review-rating">
                              {renderStars(review.rating)}
                            </span>
                          </div>
                          <small className="review-date">
                            {review.date || review.createdAt
                              ? new Date(
                                  review.date || review.createdAt
                                ).toLocaleDateString()
                              : "Unknown date"}
                          </small>
                        </div>
                        <p className="review-comment">
                          {review.comment || "No comment provided"}
                        </p>
                        {userProfile && review.user?.id === userProfile.id && (
                          <div className="review-actions">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="action-button edit-button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="action-button delete-button"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No reviews available.</p>
              )}
            </div>
            <div className="info-group">
              <h4>Book a Visit</h4>
              <button
                className="action-button book-now-button"
                onClick={() => setShowBookingModal(true)}
              >
                Book Now
              </button>
              <h4 className="sub-heading">Your Bookings</h4>
              {bookings.filter((b) => b.locationId === selectedLocation.id)
                .length > 0 ? (
                <ul className="bookings-list">
                  {bookings
                    .filter((b) => b.locationId === selectedLocation.id)
                    .map((booking, idx) => (
                      <li key={idx}>
                        {booking.date} at {formatTimeForDisplay(booking.time)}
                      </li>
                    ))}
                </ul>
              ) : (
                <p>No bookings yet.</p>
              )}
            </div>
          </div>
        </aside>
      )}

      {showReviewModal && selectedLocation && (
        <div className="modal-wrapper">
          <div
            className="modal-overlay"
            onClick={() => setShowReviewModal(false)}
          ></div>
          <div className="modal-content review-modal">
            <h3 className="modal-title">
              {selectedReview ? "Edit Review" : "Add Review"} for{" "}
              {selectedLocation.placeName}
            </h3>
            <form
              onSubmit={
                selectedReview ? handleUpdateReviewSubmit : handleReviewSubmit
              }
            >
              <div className="form-group">
                <label className="form-label">Rating (1-5)</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span
                      key={num}
                      className={`star ${
                        newReview.rating >= num ? "filled" : ""
                      }`}
                      onClick={() => handleStarClick(num)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {newReview.rating === 0 && (
                  <small className="error-text">Please select a rating</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Share your experience..."
                  className="form-textarea"
                  rows="4"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className="action-button submit-button"
                  disabled={newReview.rating === 0}
                >
                  {selectedReview ? "Update Review" : "Submit Review"}
                </button>
                <button
                  type="button"
                  className="action-button cancel-button"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     

      {/* Filter Modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={selectedFilterFeatures}
      />

      {/* Lightbox Modal for images */}
      {lightboxOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                fontSize: 22,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={lightboxImg}
              alt="Preview"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                borderRadius: 10,
                boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                background: "#fff",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPlaces;
