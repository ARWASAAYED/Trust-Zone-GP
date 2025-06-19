import React, { useEffect, useState } from "react";
// import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { fetchFavoriteBranchIds } from "../api/favoriteApi";
import {
  getAllBranches,
  getBranchReviews,
  getBranchPhotos,
} from "../api/BranchApiClient";
import "./FavoritePlaces.css";

console.log("FavoritePlaces component mounted");

function FavoritePlaces() {
  console.log("FavoritePlaces function body running");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError("");
        const favoriteIds = await fetchFavoriteBranchIds();
        const branchesResponse = await getAllBranches();
        const allBranches = Array.isArray(branchesResponse.data)
          ? branchesResponse.data
          : [];
        let favoriteBranches = allBranches.filter((branch) =>
          favoriteIds.includes(branch.id)
        );
        // Fetch reviews and photos for each favorite branch
        favoriteBranches = await Promise.all(
          favoriteBranches.map(async (branch) => {
            let reviews = [];
            let photos = [];
            try {
              const reviewsResponse = await getBranchReviews(branch.id, 1, 100);
              reviews = Array.isArray(reviewsResponse.data)
                ? reviewsResponse.data
                : [];
            } catch {
              /* ignore reviews error */
            }
            try {
              const photosResponse = await getBranchPhotos(branch.id);
              photos = Array.isArray(photosResponse.data)
                ? photosResponse.data
                : [];
            } catch {
              /* ignore photos error */
            }
            return {
              ...branch,
              reviews,
              photos,
            };
          })
        );
        if (mounted) setFavorites(favoriteBranches);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load favorites."
          );
          setFavorites([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchFavorites();
    return () => {
      mounted = false;
    };
  }, []);

  console.log("FavoritePlaces about to return JSX");

  // Helper to get average rating (from CategoryPlaces.jsx logic)
  const getAverageRating = (branch) => {
    if (!branch.reviews || branch.reviews.length === 0) return "-";
    const sum = branch.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / branch.reviews.length).toFixed(1);
  };

  // Render stars as in CategoryPlaces.jsx
  const renderStars = (rating) => {
    if (rating === "-" || rating === undefined) return "☆☆☆☆☆";
    const num = parseFloat(rating);
    const stars = [];
    const fullStars = Math.floor(num);
    const hasHalfStar = num % 1 >= 0.5;
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

  // Helper to get accessibility label (no 'Unknown')
  const getAccessibilityLabel = (level) => {
    if (!level) return "-";
    if (level === "accessible") return "fully accessible";
    if (level === "partially accessible") return "partially accessible";
    if (level === "not accessible") return "not accessible";
    return "-";
  };

  return (
    <div className="favorite-places-root">
      <div className="favorite-places-container">
        <h1 className="favorite-places-title" style={{color:'#23405b'}}>Your Favorite Places</h1>
        <div className="favorite-places-content">
          {loading ? (
            <div className="favorite-places-state favorite-places-loading">
              <p>Loading favorites...</p>
            </div>
          ) : error ? (
            <div className="favorite-places-state favorite-places-error">
              <p>{error}</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="favorite-places-state favorite-places-empty">
              <p>You have no favorite places yet.</p>
            </div>
          ) : (
            <div className="favorite-places-list">
              {favorites.map((branch) => {
                const avg = getAverageRating(branch);
                return (
                  <div
                    key={branch.id}
                    className="favorite-place-card"
                    onClick={() => navigate(`/map?branchId=${branch.id}`)}
                  >
                    {/* Images gallery */}
                    <div className="favorite-place-gallery">
                      {(branch.photos && branch.photos.length > 0
                        ? branch.photos
                        : [{ photoUrl: "/images/placeholder.png" }]
                      ).map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo.photoUrl}
                          alt={
                            branch.place?.name ||
                            branch.address ||
                            "Place image"
                          }
                          className="favorite-place-gallery-img"
                        />
                      ))}
                    </div>
                    <div className="favorite-place-info">
                      <div className="favorite-place-name">
                        {branch.place?.name || branch.address || "-"}
                      </div>
                      <div className="favorite-place-address">
                        {branch.address || "-"}
                      </div>
                      <div className="favorite-place-access">
                        {getAccessibilityLabel(branch.accessibilityLevel)}
                      </div>
                    </div>
                    <div className="favorite-place-rating">
                      <span>{avg}</span>
                      <span className="favorite-place-stars">
                        {renderStars(avg)}
                      </span>
                      <span className="favorite-place-totalrate">
                        ({branch.reviews ? branch.reviews.length : 0})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoritePlaces;
