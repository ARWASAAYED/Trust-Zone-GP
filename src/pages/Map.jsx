import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import ErrorBoundary from "../components/ErrorBoundary";
import partiallyAccessibleIconSVG from "/images/partiallyAccessible.svg";
import accessibleIconSVG from "/images/accessible.svg";
import notAccessibleIconSVG from "/images/notAccessible.svg";
// import locations from "../data/Place_details.json"; // Removed as it's unused
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import {
  getAllBranches,
  getBranchOpeningHours,
  getBranchPhotos,
  getBranchReviews,
  createReview,
  deleteReview,
} from "../api/BranchApiClient";
import { isOpenNow, formatTimeForDisplay, getDayName } from "../utils/utils";
import { RiMailSendFill } from "react-icons/ri";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import FilterModal from "../components/FilterModal";
import { fetchFavoriteBranchIds } from "../api/favoriteApi";

const accessibleIcon = L.divIcon({
  className: "custom-pin",
  html: `<img src="${accessibleIconSVG}" alt="Accessible location" />`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

const partiallyAccessibleIcon = L.divIcon({
  className: "custom-pin",
  html: `<img src="${partiallyAccessibleIconSVG}" alt="Partially accessible location" />`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

const notAccessibleIcon = L.divIcon({
  className: "custom-pin",
  html: `<img src="${notAccessibleIconSVG}" alt="Not accessible location" />`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

const placeIcon = L.divIcon({
  className: "place-pin",
  html: `<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

function Map() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    locationTypes: [],
    accessibilityLevels: [],
  });
  // const [searchTerm, setSearchTerm] = useState(""); // Removed as it's unused
  const [placeSearchTerm, setPlaceSearchTerm] = useState("");
  // const [isSearching, setIsSearching] = useState(false); // Removed as it's unused
  const [isPlaceSearching, setIsPlaceSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [bookings, setBookings] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const markersRef = useRef({});
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState("");
  const [openingHours, setOpeningHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [hoursError, setHoursError] = useState("");
  const [branchPhotos, setBranchPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState("");
  const [branchReviews, setBranchReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchedPlaces, setSearchedPlaces] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loadingUserReviews, setLoadingUserReviews] = useState(false);
  const [userReviewsError, setUserReviewsError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [reviewerProfiles, setReviewerProfiles] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const reviewRefs = useRef({});

  // New state and logic for mobile sidebar visibility and interactions
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768); // Initial check

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // This effect manages sidebar visibility based on selectedLocation and mobile view
  useEffect(() => {
    if (isMobileView && selectedLocation) {
      setSidebarVisible(false); // Hide sidebar on mobile if location details are open
    } else if (!isMobileView) {
      // On desktop, the sidebar should default to visible, unless manually collapsed.
      setSidebarVisible(true);
    }
  }, [isMobileView, selectedLocation]);

  const categoryMap = {
    1: "Restaurant",
    2: "Retail Stores",
    3: "Fitness",
    4: "Mosque",
    6: "Healthcare Facilities",
    7: "Clubs",
    // 5: "Healthcare", // removed
    // 8: "Entertainment", // removed
    // 9: "Shopping", // removed
    // "-1": "Unknown", // removed
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: true,
        }).setView([28.1099, 30.7503], 7);
        mapInstanceRef.current = map;

        L.control
          .zoom({
            position: "topright",
          })
          .addTo(map);

        const tileLayerUrl = isDarkMode
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileLayerUrl, {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        fetchBranches();
      } catch (error) {
        console.error("Error initializing map:", error);
        setBranchError("Failed to initialize map");
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDarkMode]);

  useEffect(() => {
    const applyAllFiltersClientSide = async () => {
      console.log("Applying client-side filters and updating markers");

      let branchesToDisplay = [...branches];

      if (selectedCategoryId && selectedCategoryId !== "") {
        branchesToDisplay = branchesToDisplay.filter(
          (branch) =>
            branch.place?.categoryId?.toString() === selectedCategoryId ||
            (selectedCategoryId === "-1" && !branch.place?.categoryId)
        );
      }

      if (filters.accessibilityLevels.length > 0) {
        branchesToDisplay = branchesToDisplay.filter((branch) =>
          filters.accessibilityLevels.includes(
            (branch.accessibilityLevel || "not accessible").toLowerCase()
          )
        );
      }

      // if (searchTerm.trim()) { // Commented out as searchTerm is removed
      //   const lowerSearchTerm = searchTerm.trim().toLowerCase();
      //   branchesToDisplay = branchesToDisplay.filter(
      //     (branch) =>
      //       branch.address?.toLowerCase().includes(lowerSearchTerm) ||
      //       branch.place?.categoryId?.toString().includes(lowerSearchTerm) ||
      //       branch.place?.details?.toLowerCase().includes(lowerSearchTerm) ||
      //       branch.place?.features?.some((feature) =>
      //         feature.featureName.toLowerCase().includes(lowerSearchTerm)
      //       ) ||
      //       branch.name?.toLowerCase().includes(lowerSearchTerm)
      //   );
      // }

      const allItemsToDisplay = [...branchesToDisplay, ...searchedPlaces];

      if (mapInstanceRef.current) {
        await updateMarkersWithBranches(allItemsToDisplay);
      }
    };

    applyAllFiltersClientSide();
  }, [
    branches,
    selectedCategoryId,
    filters.accessibilityLevels,
    // searchTerm, // Removed as it's unused
    searchedPlaces,
  ]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const favoriteIds = await fetchFavoriteBranchIds();
      setFavorites(favoriteIds);
      setFavoriteError("");
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setFavoriteError(
        err.response
          ? `Failed to load favorites: ${
              err.response.data?.message || err.response.statusText
            }`
          : err.message || "Failed to load favorites: Network error"
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
      console.error("Error toggling favorite:", err);
      setFavoriteError(
        err.response
          ? `Failed to ${
              favorites.includes(locationId) ? "remove from" : "add to"
            } favorites: ${
              err.response.data?.message || err.response.statusText
            }`
          : err.message || "Failed to update favorites: Network error"
      );
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavoriteError("Please log in to manage favorites");
      setUserReviewsError("Please log in to see your reviews");
    } else {
      fetchFavorites();
      fetchUserReviews();
    }
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoadingUserReviews(true);
      setUserReviewsError("");
      const response = await apiClient.get("/Reviews/user-reviews");
      console.log("Fetched user reviews:", response.data);
      setUserReviews(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching user reviews:", err);
      setUserReviewsError(
        `Failed to load your reviews: ${
          err.response?.data?.message || err.message
        }`
      );
      setUserReviews([]);
    } finally {
      setLoadingUserReviews(false);
    }
  };

  const fetchOpeningHours = async (branchId) => {
    try {
      setLoadingHours(true);
      setHoursError("");

      if (!branchId || isNaN(branchId)) {
        throw new Error("Invalid branch ID provided");
      }

      console.log(`Fetching opening hours for branchId: ${branchId}`);

      const response = await getBranchOpeningHours(branchId);
      const data = response.data;

      if (!data) {
        console.warn(`No data received for branch ${branchId}`);
        setOpeningHours([
          {
            id: -1,
            branchId: branchId,
            dayOfWeek: new Date().getDay(),
            openingTime: "N/A",
            closingTime: "N/A",
            isClosed: true,
          },
        ]);
        setHoursError(
          `Failed to load opening hours for branch ${branchId}: No data found.`
        );
        return;
      }

      if (Array.isArray(data)) {
        if (data.length > 0) {
          const sortedHours = data.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
          setOpeningHours(sortedHours);
        } else {
          console.warn(
            `Empty array of opening hours received for branch ${branchId}`
          );
          setOpeningHours([
            {
              id: -1,
              branchId: branchId,
              dayOfWeek: new Date().getDay(),
              openingTime: "N/A",
              closingTime: "N/A",
              isClosed: true,
            },
          ]);
          setHoursError(
            `Failed to load opening hours for branch ${branchId}: No data found.`
          );
        }
      } else {
        console.log(
          `Received single opening hour object for branch ${branchId}:`,
          data
        );
        setOpeningHours([data]);
      }
    } catch (err) {
      console.error(`Error fetching hours for branch ${branchId}:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      if (
        err.response?.status === 404 &&
        err.response?.data === "No opening hours found for this branch"
      ) {
        console.log(
          `No opening hours found for branch ${branchId}. Returning default structure.`
        );
        setOpeningHours([
          {
            id: -1,
            branchId: branchId,
            dayOfWeek: new Date().getDay(),
            openingTime: "N/A",
            closingTime: "N/A",
            isClosed: true,
          },
        ]);
        setHoursError(
          `Failed to load opening hours for branch ${branchId}: No data found.`
        );
      } else {
        setOpeningHours([]);
        setHoursError(
          `Failed to load opening hours for branch ${branchId}: ${
            err.response?.data || err.message
          }.`
        );
      }
    } finally {
      setLoadingHours(false);
    }
  };

  const fetchBranchPhotos = async (branchId) => {
    try {
      setLoadingPhotos(true);
      setPhotosError("");

      if (!branchId || isNaN(branchId)) {
        throw new Error("Invalid branch ID provided");
      }

      console.log(`Fetching photos for branchId: ${branchId}`);

      const response = await getBranchPhotos(branchId);
      const data = response.data;

      if (!data) {
        console.warn(`No photos received for branch ${branchId}`);
        setBranchPhotos([]);
        setPhotosError(
          `Failed to load photos for branch ${branchId}: No data found.`
        );
        return;
      }

      if (Array.isArray(data)) {
        if (data.length > 0) {
          setBranchPhotos(data);
        } else {
          console.warn(`Empty array of photos received for branch ${branchId}`);
          setBranchPhotos([]);
          setPhotosError(`No photos available for branch ${branchId}.`);
        }
      } else {
        console.log(
          `Received single photo object for branch ${branchId}:`,
          data
        );
        setBranchPhotos([data]);
      }
    } catch (err) {
      console.error(`Error fetching photos for branch ${branchId}:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      if (err.response?.status === 404) {
        console.log(
          `No photos found for branch ${branchId}. Setting empty array.`
        );
        setBranchPhotos([]);
        setPhotosError(
          `Failed to load photos for branch ${branchId}: No data found.`
        );
      } else {
        setBranchPhotos([]);
        setPhotosError(
          `Failed to load photos for branch ${branchId}: ${
            err.response?.data || err.message
          }.`
        );
      }
    } finally {
      setLoadingPhotos(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      setBranchError("");
      setHoursError("");
      setPhotosError("");
      console.log("Fetching branches...");
      const response = await getAllBranches();
      console.log("Branches response:", response);

      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setBranchError("No branches found");
        } else {
          const branchesWithData = await Promise.all(
            response.data.map(async (branch) => {
              let openingHoursData = [];
              let hoursErrorMessage = "";
              try {
                const hoursResponse = await getBranchOpeningHours(branch.id);
                console.log(
                  `Hours for branch ${branch.id}:`,
                  hoursResponse.data
                );
                openingHoursData = Array.isArray(hoursResponse.data)
                  ? hoursResponse.data.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  : [];
              } catch (err) {
                console.error(`Error fetching hours for branch ${branch.id}:`, {
                  message: err.message,
                  status: err.response?.status,
                  data: err.response?.data,
                });
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
                  hoursErrorMessage = `Failed to load opening hours for branch ${branch.id}: No data found.`;
                } else {
                  hoursErrorMessage = `Failed to load hours for branch ${branch.id}: ${err.message}.`;
                }
              }

              let photosData = [];
              let photosErrorMessage = "";
              try {
                const photosResponse = await getBranchPhotos(branch.id);
                console.log(
                  `Photos for branch ${branch.id}:`,
                  photosResponse.data
                );
                photosData = Array.isArray(photosResponse.data)
                  ? photosResponse.data
                  : [];
              } catch (err) {
                console.error(
                  `Error fetching photos for branch ${branch.id}:`,
                  {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                  }
                );
                if (err.response?.status === 404) {
                  photosErrorMessage = `Failed to load photos for branch ${branch.id}: No data found.`;
                } else {
                  photosErrorMessage = `Failed to load photos for branch ${branch.id}: ${err.message}.`;
                }
              }

              return {
                ...branch,
                openingHours: openingHoursData,
                hoursError: hoursErrorMessage,
                photos: photosData,
                photosError: photosErrorMessage,
              };
            })
          );
          setBranches(branchesWithData);

          if (mapInstanceRef.current) {
            await updateMarkersWithBranches(branchesWithData);
          }
        }
      } else {
        console.error("Invalid branches data:", response.data);
        setBranchError("Invalid branches data received from server");
      }
    } catch (err) {
      console.error("Error fetching branches:", {
        message: err.message,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            }
          : null,
      });
      setBranchError(
        `Failed to load branches: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoadingBranches(false);
    }
  };

  const updateMarkersWithBranches = async (items) => {
    if (!mapInstanceRef.current) return;

    console.log("Updating markers with items:", items);
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    for (const item of items) {
      try {
        let lat,
          lng,
          icon,
          isBranch = false;
        if (item.place?.latitude && item.place?.longitude) {
          lat = parseFloat(item.place.latitude);
          lng = parseFloat(item.place.longitude);
          isBranch = true;

          // Get the number of features
          const featuresCount = item.place?.features?.length || 0;

          // Determine accessibility level based on number of features
          let accessibilityLevel;
          if (featuresCount === 0) {
            accessibilityLevel = "not accessible";
          } else if (featuresCount <= 2) {
            accessibilityLevel = "partially accessible";
          } else {
            accessibilityLevel = "accessible";
          }

          // Log the accessibility level for debugging
          console.log(
            `Branch ${item.id}: featuresCount=${featuresCount}, accessibilityLevel=${accessibilityLevel}`
          );

          // Update item's accessibility level
          item.accessibilityLevel = accessibilityLevel;

          // Use accessibility icon (removed photo override)
          switch (accessibilityLevel) {
            case "accessible":
              icon = accessibleIcon;
              break;
            case "partially accessible":
              icon = partiallyAccessibleIcon;
              break;
            case "not accessible":
            default:
              icon = notAccessibleIcon;
              break;
          }
        } else if (item.lat && item.lon) {
          lat = parseFloat(item.lat);
          lng = parseFloat(item.lon);
          icon = placeIcon; // Keep blue pin for searched places
        }

        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          const marker = L.marker([lat, lng], {
            icon: icon,
            alt: `${
              item.place?.name ||
              item.address ||
              item.display_name ||
              "Unknown location"
            } - ${
              isBranch
                ? item.accessibilityLevel || "not accessible"
                : "searched place"
            }`,
          });

          marker.itemData = item;
          marker.isBranch = isBranch;

          marker.on("click", () => {
            setSelectedLocation(item);
            console.log(
              "Selected item:",
              item.id || item.osm_id,
              "isBranch:",
              isBranch
            );
          });

          marker.addTo(mapInstanceRef.current);
          markersRef.current[item.id || `searched_${item.osm_id}`] = marker;
        } else {
          console.warn(
            `Invalid coordinates for item ${item.id || item.osm_id}:`,
            { lat, lng }
          );
        }
      } catch (error) {
        console.error(
          `Error adding marker for item ${item.id || item.osm_id}:`,
          error
        );
      }
    }

    await updateMarkerVisibility();
    if (Object.keys(markersRef.current).length > 0) {
      const bounds = L.latLngBounds(
        Object.values(markersRef.current).map((marker) => marker.getLatLng())
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const updateMarkerVisibility = async () => {
    console.log("Updating marker visibility...");
  };

  const handlePlaceSearch = async () => {
    if (!placeSearchTerm.trim()) {
      alert("Please enter a place to search!");
      return;
    }

    try {
      setIsPlaceSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          placeSearchTerm
        )}`
      );
      const data = await response.json();

      if (data.length === 0) {
        alert(`No results found for "${placeSearchTerm}"`);
        return;
      }

      const place = data[0];
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      const placeName = place.display_name;

      // Add searched place to state
      const newSearchedPlace = {
        id: `searched_${place.osm_id}`,
        lat: lat,
        lon: lon,
        display_name: placeName,
        address: place.display_name, // Use display_name as a proxy for address
      };
      setSearchedPlaces((prev) => [...prev, newSearchedPlace]);
      await updateMarkersWithBranches([...searchedPlaces, newSearchedPlace]);

      // Center the map on the new marker
      mapInstanceRef.current.setView([lat, lon], 13);
    } catch (error) {
      console.error("Error searching place:", error);
      alert("An error occurred while searching. Please try again.");
    } finally {
      setIsPlaceSearching(false);
    }
  };

  useEffect(() => {
    if (selectedLocation?.id) {
      setHoursError("");
      setPhotosError("");
      setReviewsError("");
      fetchOpeningHours(selectedLocation.id);
      fetchBranchPhotos(selectedLocation.id);
      fetchBranchReviews(selectedLocation.id);
    } else {
      setOpeningHours([]);
      setHoursError("No branch selected.");
      setBranchPhotos([]);
      setPhotosError("No branch selected.");
      setBranchReviews([]);
      setReviewsError("No branch selected.");
    }
  }, [selectedLocation]);

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const placeSearchInputClass = `search-input ${
    isPlaceSearching ? "searching" : ""
  }`;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .search-input.searching {
        background-color: #f8f9fa;
      }
      .search-container {
        position: relative;
      }
      .search-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
      @keyframes spin {
        0% { transform: translateY(-50%) rotate(0deg); }
        100% { transform: translateY(-50%) rotate(360deg); }
      }
      .profile-section {
        margin: 10px 0;
        padding: 10px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.1);
      }
      .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .profile-photo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
      }
      .user-profile span {
        color: #fff;
        font-weight: 500;
      }
      .custom-pin {
        display: block !important;
        width: 30px !important;
        height: 40px !important;
        background: transparent !important;
      }
      .custom-pin img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const fetchBranchReviews = async (branchId) => {
    try {
      setLoadingReviews(true);
      setReviewsError("");
      const response = await getBranchReviews(branchId, 1, 100); // Request up to 100 reviews
      console.log("Fetched reviews:", response.data);
      const reviews = Array.isArray(response.data) ? response.data : [];
      setBranchReviews(reviews);

      // Fetch profiles for all reviewers
      reviews.forEach((review) => {
        console.log(`Reviewer user data for review ${review.id}:`, review.user);
        if (review.user?.id) {
          fetchReviewerProfile(review.user.id);
        }
      });
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviewsError(
        `Failed to load reviews: ${err.response?.data?.message || err.message}`
      );
      setBranchReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getAverageRating = () => {
    if (!branchReviews || branchReviews.length === 0) return 0;
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

  const showAllLocations = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        Object.values(markersRef.current).map((marker) => marker.getLatLng())
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const closeLocationDetails = () => {
    setSelectedLocation(null);
  };

  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const [successMessage, setSuccessMessage] = useState("");

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const reviewData = {
        branchId: selectedLocation.id,
        rating: newReview.rating,
        comment: newReview.comment,
      };
      await createReview(reviewData);
      setShowReviewModal(false);
      setNewReview({ rating: 0, comment: "" });
      fetchBranchReviews(selectedLocation.id);
      setSuccessMessage("Review submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!selectedReview?.id) throw new Error("No review selected for update");
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
      fetchBranchReviews(selectedLocation.id);
      setSuccessMessage("Review updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setIsLoading(false);
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
      fetchBranchReviews(selectedLocation.id);
    } catch (error) {
      console.error("Error deleting review:", error);
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

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get("/UserProfile");
        console.log("Response from /UserProfile:", response);
        if (response && response.data) {
          setUserProfile(response.data);
        }
      } catch (err) {
        console.error("Error fetching user profile in Map:", err);
        setUserProfile({}); // Set to an empty object on error to avoid null issues
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch reviewer profiles
  const fetchReviewerProfile = async (userId) => {
    if (!userId || reviewerProfiles[userId]) return; // Skip if already fetched or no userId

    try {
      console.log(`Fetching reviewer profile for userId: ${userId}`);
      const response = await apiClient.get(`/UserProfile/${userId}`);
      console.log(`Response from /UserProfile/${userId}:`, response.data);
      if (response && response.data) {
        setReviewerProfiles((prev) => ({
          ...prev,
          [userId]: response.data,
        }));
      }
    } catch (err) {
      console.error(`Error fetching reviewer profile for ${userId}:`, err);
    }
  };

  // Scroll to selected review when selectedReviewId changes
  useEffect(() => {
    if (reviewRefs.current[selectedReview?.id]) {
      reviewRefs.current[selectedReview.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedReview]);

  return (
    <ErrorBoundary>
      <div
        className={`enhanced-map-container ${isDarkMode ? "dark-mode" : ""}`}
      >
        {/* Sidebar */}
        <div
          className="map-sidebar"
          style={{
            transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
            position: "absolute",
            left: 0,
            height: "100%",
            width: "300px",
            transition: "transform 0.3s ease-in-out",
            zIndex: 999, // Below location details panel
            display: isMobileView && selectedLocation ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <div className="sidebar-header">
            <h2>Accessible Places</h2>
            <p>Find accessible locations in Egypt</p>
            <button onClick={toggleDarkMode} className="dark-mode-toggle">
              {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
            {/* Sidebar Toggle Button - now inside and relative to sidebar */}
            {/* Button removed as per user request */}
          </div>

          {/* Sidebar content */}
          {sidebarVisible && (
            <>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search for any place (e.g., Cairo)..."
                  value={placeSearchTerm}
                  onChange={(e) => setPlaceSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handlePlaceSearch()}
                  className={placeSearchInputClass}
                  aria-label="Search for any place"
                />
                {isPlaceSearching && <div className="search-spinner"></div>}
              </div>

              <div className="filters-section">
                <div className="filters-header">
                  <h3>Categories</h3>
                  <button onClick={showAllLocations} className="clear-filters">
                    Show All
                  </button>
                </div>

                <div className="filter-group">
                  <h4>Select Category</h4>
                  <select
                    id="category-selector"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="category-selector"
                  >
                    <option value="">All Categories</option>
                    {Object.entries(categoryMap).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <h4>Accessibility</h4>
                  <div className="filter-options">
                    {[
                      "accessible",
                      "partially accessible",
                      "not accessible",
                    ].map((level) => (
                      <label key={level} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.accessibilityLevels.includes(level)}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              accessibilityLevels:
                                prev.accessibilityLevels.includes(level)
                                  ? prev.accessibilityLevels.filter(
                                      (l) => l !== level
                                    )
                                  : [...prev.accessibilityLevels, level],
                            }))
                          }
                        />
                        <span
                          className="color-indicator"
                          style={{
                            backgroundColor: getColorForAccessibility(level),
                          }}
                        ></span>
                        <span>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Favorite Places</h4>
                  {favoriteError && (
                    <div className="error-message">{favoriteError}</div>
                  )}
                  <div className="locations-scroll">
                    {loadingFavorites ? (
                      <p>Loading favorites...</p>
                    ) : favorites.length === 0 ? (
                      <p className="no-results">No favorite places yet.</p>
                    ) : (
                      favorites.map((favId) => {
                        const loc = branches.find((b) => b.id === favId);
                        if (!loc) return null;
                        return (
                          <div
                            key={loc.id}
                            className={`location-item ${
                              selectedLocation?.id === loc.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedLocation(loc)}
                          >
                            <div
                              className="location-marker"
                              style={{
                                backgroundColor: getColorForAccessibility(
                                  loc.accessibilityLevel
                                ),
                              }}
                            ></div>
                            <div className="location-details">
                              <h5>
                                {loc.place?.name ||
                                  loc.address ||
                                  loc.display_name}
                              </h5>
                              <p>
                                {loc.place?.categoryId
                                  ? categoryMap[loc.place.categoryId]
                                  : "Unknown type"}
                              </p>
                              <small>
                                {loc.address || loc.display_name || ""}
                              </small>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="user-reviews-section">
                    <h3>Your Reviews ({userReviews.length})</h3>
                    {console.log(
                      "UserProfile profilePictureUrl for Your Reviews:",
                      userProfile?.profilePictureUrl
                    )}
                    {userReviewsError && (
                      <div className="error-message">{userReviewsError}</div>
                    )}
                    {loadingUserReviews ? (
                      <p>Loading your reviews...</p>
                    ) : userReviews.length > 0 ? (
                      <ul className="user-reviews-list">
                        {userReviews.map((review) => (
                          <li key={review.id} className="user-review-item">
                            <div className="review-header">
                              <div className="reviewer-info">
                                <img
                                  src={
                                    userProfile?.profilePictureUrl ||
                                    "/images/profile.png"
                                  }
                                  alt="Your profile"
                                  className="reviewer-avatar"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/profile.png";
                                  }}
                                />
                                <span>{renderStars(review.rating)}</span>
                              </div>
                              <small>
                                {review.date || review.createdAt
                                  ? new Date(
                                      review.date || review.createdAt
                                    ).toLocaleDateString()
                                  : "Unknown date"}
                              </small>
                            </div>
                            <p>{review.comment || "No comment provided"}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-results">
                        You haven't submitted any reviews yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="locations-list">
                  <h4>Places ({Object.keys(markersRef.current).length})</h4>
                  {branchError && (
                    <div className="error-message">{branchError}</div>
                  )}
                  {loadingBranches ? (
                    <p>Loading branches...</p>
                  ) : (
                    <div className="locations-scroll">
                      {Object.values(markersRef.current).map((marker) => {
                        const { itemData, isBranch } = marker;
                        if (!itemData) return null;
                        return (
                          <div
                            key={itemData.id || `searched_${itemData.osm_id}`}
                            className={`location-item ${
                              selectedLocation?.id ===
                              (itemData.id || `searched_${itemData.osm_id}`)
                                ? "selected"
                                : ""
                            }
                        }`}
                            onClick={() => setSelectedLocation(itemData)}
                          >
                            <div
                              className="location-marker"
                              style={{
                                backgroundColor: isBranch
                                  ? getColorForAccessibility(
                                      itemData.accessibilityLevel ||
                                        "not accessible"
                                    )
                                  : "#0000FF",
                              }}
                            ></div>
                            <div className="location-details">
                              <h5>
                                {itemData.place?.name ||
                                  itemData.address ||
                                  itemData.display_name ||
                                  "Unknown location"}
                              </h5>
                              <p>
                                {isBranch
                                  ? itemData.place?.categoryId || "Unknown type"
                                  : "Searched Place"}
                              </p>
                              <small>
                                {isBranch ? itemData.place?.details || "" : ""}
                              </small>
                              <div className="location-rating">
                                {isBranch &&
                                  renderStars(
                                    getAverageRating(itemData.id)
                                  )}{" "}
                                (
                                {isBranch
                                  ? getAverageRating(itemData.id) ||
                                    "No ratings"
                                  : "N/A"}
                                )
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(markersRef.current).length === 0 && (
                        <p className="no-results">No locations found</p>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={showAllLocations} className="show-all-btn">
                  Show All On Map
                </button>
              </div>
            </>
          )}
        </div>{" "}
        {/* Closing tag for map-sidebar */}
        {/* Map Container */}
        <div
          className="map-container"
          ref={mapContainerRef}
          style={{
            marginLeft: sidebarVisible && !isMobileView ? "300px" : "0px",
            transition: "margin-left 0.3s ease-in-out",
            width: "100%",
            height: "100%",
            flexGrow: 1,
          }}
        ></div>
        {/* Location Details Panel */}
        {selectedLocation && (
          <div className="location-details-panel">
            <button
              className="close-button"
              onClick={closeLocationDetails}
              aria-label="Close details"
            >
              ×
            </button>
            <h3>
              {selectedLocation.place?.name ||
                selectedLocation.address ||
                selectedLocation.display_name}
            </h3>
            {selectedLocation.photo && (
              <div className="location-photo">
                <img
                  src={selectedLocation.photo}
                  alt={`Photo of ${
                    selectedLocation.place?.name ||
                    selectedLocation.address ||
                    selectedLocation.display_name
                  }`}
                  className="location-image"
                  loading="lazy"
                />
              </div>
            )}
            <div className="location-accessibility">
              <span className="accessibility-label">
                {selectedLocation.accessibilityLevel === "partially accessible"
                  ? "Partially Accessible"
                  : selectedLocation.accessibilityLevel === "accessible"
                  ? "Fully Accessible"
                  : selectedLocation.accessibilityLevel === "not accessible"
                  ? "Not Accessible"
                  : "Searched Place"}
              </span>
              <button
                className={`favorite-button ${
                  loadingFavorites ? "loading" : ""
                }`}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token || !selectedLocation.id) {
                    setFavoriteError(
                      "Please log in to manage favorites or select a branch"
                    );
                    return;
                  }
                  toggleFavorite(selectedLocation.id);
                }}
                disabled={
                  loadingFavorites ||
                  !localStorage.getItem("token") ||
                  !selectedLocation.id
                }
                title={
                  !localStorage.getItem("token") || !selectedLocation.id
                    ? "Please log in to manage favorites or select a branch"
                    : ""
                }
              >
                {loadingFavorites
                  ? "Loading..."
                  : favorites.includes(selectedLocation.id)
                  ? "❤️ Remove from Favorites"
                  : "♡ Add to Favorites"}
              </button>
              {favoriteError && (
                <div className="error-message">{favoriteError}</div>
              )}
            </div>
            <div className="info-group">
              <h4>Branch Photos</h4>
              {loadingPhotos ? (
                <p>Loading photos...</p>
              ) : selectedLocation?.photosError ? (
                <p className="error-message">{selectedLocation.photosError}</p>
              ) : photosError ? (
                <p className="error-message">{photosError}</p>
              ) : branchPhotos.length > 0 ? (
                <div className="branch-photos-list">
                  {branchPhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.photoUrl}
                      alt={`Photo ${index + 1} for branch ${
                        selectedLocation.id
                      }`}
                      className="branch-photo"
                      style={{ maxWidth: "100%", margin: "5px 0" }}
                    />
                  ))}
                </div>
              ) : (
                <p className="error-message">
                  No photos available for this branch.
                </p>
              )}
            </div>

            <div className="location-info">
              <div className="info-group">
                <h4>Address</h4>
                <p>
                  {selectedLocation.address ||
                    selectedLocation.display_name ||
                    "No address available"}
                </p>
              </div>
              <div className="info-group">
                <h4>Created At</h4>
                <p>
                  {selectedLocation.createdAt
                    ? new Date(selectedLocation.createdAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>
              <div className="info-group">
                <h4>Features</h4>
                {selectedLocation.place?.features &&
                selectedLocation.place.features.length > 0 ? (
                  <ul className="features-list">
                    {selectedLocation.place.features.map((feature, index) => (
                      <li key={index}>
                        <p>{feature.featureName}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No features available</p>
                )}
              </div>
              <div className="info-group">
                <h4>Category</h4>
                <p>
                  {selectedLocation.place?.categoryId
                    ? `Category: ${selectedLocation.place.categoryId}`
                    : "No category available"}
                </p>
              </div>
              <div className="info-group">
                <h4>Coordinates</h4>
                <p>
                  {selectedLocation.place?.latitude &&
                  selectedLocation.place?.longitude
                    ? `Latitude: ${selectedLocation.place.latitude}, Longitude: ${selectedLocation.place.longitude}`
                    : selectedLocation.lat && selectedLocation.lon
                    ? `Latitude: ${selectedLocation.lat}, Longitude: ${selectedLocation.lon}`
                    : "No coordinates available"}
                </p>
              </div>
              <div className="info-group">
                <h4>Details</h4>
                <p>
                  {selectedLocation.place?.details ||
                    "No additional details available"}
                </p>
              </div>

              <div className="info-group">
                <h4>Operating Hours</h4>
                {loadingHours ? (
                  <p>Loading hours...</p>
                ) : selectedLocation?.hoursError || hoursError ? (
                  <p className="error-message">
                    {selectedLocation?.hoursError || hoursError}
                  </p>
                ) : openingHours.length > 0 && openingHours[0].id !== -1 ? (
                  (() => {
                    const currentDay = new Date().getDay();
                    const todayHours =
                      openingHours.find(
                        (hour) => hour.dayOfWeek === currentDay
                      ) || openingHours[0];
                    const isOpen = todayHours ? isOpenNow(todayHours) : false;
                    const formattedHours =
                      todayHours?.openingTime && todayHours?.closingTime
                        ? `${formatTimeForDisplay(
                            todayHours.openingTime
                          )} - ${formatTimeForDisplay(todayHours.closingTime)}`
                        : "N/A";

                    return (
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
                    );
                  })()
                ) : (
                  <p className="error-message">
                    No operating hours available for this branch.
                  </p>
                )}
              </div>
              {(selectedLocation.phone || selectedLocation.phone_number) && (
                <div className="info-group">
                  <h4>Contact</h4>
                  <p>
                    <a
                      href={`tel:${
                        selectedLocation.phone || selectedLocation.phone_number
                      }`}
                    >
                      {selectedLocation.phone || selectedLocation.phone_number}
                    </a>
                  </p>
                </div>
              )}
              {selectedLocation.website && (
                <div className="info-group">
                  <h4>Website</h4>
                  <p>
                    <a
                      href={selectedLocation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit website
                    </a>
                  </p>
                </div>
              )}
              <div className="info-group">
                <h4>Rating</h4>
                {loadingReviews ? (
                  <p>Loading rating...</p>
                ) : reviewsError ? (
                  <p className="error-message">{reviewsError}</p>
                ) : (
                  <p>
                    {renderStars(getAverageRating())} (
                    {getAverageRating() || "No ratings yet"})
                  </p>
                )}
                {successMessage && (
                  <p className="success-message">{successMessage}</p>
                )}
                <button
                  className="add-review-btn"
                  onClick={() => {
                    setSelectedReview(null);
                    setShowReviewModal(true);
                  }}
                >
                  Add Review
                </button>
              </div>
              <div className="info-group">
                <h4>Reviews ({branchReviews.length || 0})</h4>
                {loadingReviews ? (
                  <p>Loading reviews...</p>
                ) : reviewsError ? (
                  <p className="error-message">{reviewsError}</p>
                ) : branchReviews.length > 0 ? (
                  <ul className="reviews-list">
                    {console.log("Rendering branchReviews:", branchReviews)}{" "}
                    {branchReviews.map((review) => {
                      console.log(
                        `Review ID: ${review.id}, Reviewer User ID: ${review.user?.id}, User Profile ID: ${userProfile?.id}`
                      );
                      const reviewerProfile = reviewerProfiles[review.user?.id];
                      const profileImageUrl =
                        reviewerProfile?.profilePictureUrl ||
                        review.user?.profilePictureUrl ||
                        "/images/profile.png";
                      console.log(
                        `Attempting to load image for reviewer ${
                          review.user?.userName ||
                          review.user?.id ||
                          "Anonymous"
                        }:`,
                        profileImageUrl
                      );
                      return (
                        <li
                          key={review.id}
                          ref={(el) => (reviewRefs.current[review.id] = el)}
                          className={`review-item ${
                            selectedReview?.id === review.id
                              ? "highlighted-review"
                              : ""
                          }`}
                        >
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
                              <div
                                style={{
                                  cursor: "pointer",
                                  display: "inline-block",
                                }}
                                onClick={() => {
                                  if (review.user?.id) {
                                    navigate(
                                      `/reviewer-profile/${review.user.id}`
                                    );
                                  } else {
                                    console.warn(
                                      "Reviewer user ID not available."
                                    );
                                  }
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    marginRight: "8px",
                                  }}
                                >
                                  {reviewerProfile?.userName ||
                                    review.user?.userName ||
                                    "Anonymous"}
                                </span>
                                <span>{renderStars(review.rating)}</span>
                              </div>
                              {review.user?.id &&
                                userProfile?.id !== review.user.id && (
                                  <button
                                    className="me-3"
                                    onClick={() => {
                                      navigate("/chat", {
                                        state: { targetUserId: review.user.id },
                                      });
                                    }}
                                    style={{
                                      borderRadius: "5px",
                                      padding: "4px",
                                      background: "#1b4965",
                                      color: "white",
                                      fontSize: "0.9rem",
                                      border: "none",
                                      marginLeft: "8px",
                                      height: "28px",
                                      width: "28px",
                                      lineHeight: "1",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    title="Send Message"
                                  >
                                    <RiMailSendFill />
                                  </button>
                                )}
                            </div>
                            <small className="review-date">
                              {review.date || review.createdAt
                                ? new Date(
                                    review.date || review.createdAt
                                  ).toLocaleDateString()
                                : "Unknown date"}
                            </small>
                          </div>
                          <p>{review.comment || "No comment provided"}</p>
                          {userProfile &&
                            review.user?.id === userProfile.id && (
                              <div className="review-actions">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  disabled={isLoading}
                                  className="me-3"
                                  style={{
                                    borderRadius: "5px",
                                    padding: "4px",
                                    background: "#1b4965",
                                    color: "white",
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  disabled={isLoading}
                                  className=""
                                  style={{
                                    borderRadius: "5px",
                                    padding: "4px",
                                    background: "#a23701",
                                    color: "white",
                                  }}
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
                  <p>No reviews yet. Be the first to review!</p>
                )}
              </div>
              <div className="info-group">
                <h4>Book a Visit</h4>
                <button
                  className="book-now-btn"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Now
                </button>
              </div>
              <div className="info-group">
                <h4>Your Bookings</h4>
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
          </div>
        )}
        {showReviewModal && selectedLocation && (
          <>
            <div
              className="modal-overlay"
              onClick={() => setShowReviewModal(false)}
            ></div>
            <div className="review-modal">
              <h3>
                {selectedReview ? "Edit Review" : "Add Review"} for{" "}
                {selectedLocation.place?.name ||
                  selectedLocation.address ||
                  selectedLocation.display_name}
              </h3>
              <form
                onSubmit={
                  selectedReview ? handleUpdateReviewSubmit : handleReviewSubmit
                }
              >
                <div className="form-group">
                  <label>Rating (1-5)</label>
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
                    <small className="text-danger">
                      Please select a rating
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Share your experience..."
                    rows="4"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={newReview.rating === 0 || isLoading}
                >
                  {selectedReview ? "Update Review" : "Submit Review"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowReviewModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </div>
          </>
        )}
        {showBookingModal && selectedLocation && (
          <>
            <div
              className="modal-overlay"
              onClick={() => setShowBookingModal(false)}
            ></div>
            <div className="booking-modal">
              <h3>
                Book a Visit to{" "}
                {selectedLocation.place?.name ||
                  selectedLocation.address ||
                  selectedLocation.display_name}
              </h3>
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="bookingDate"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" name="bookingTime" required />
                </div>
                <button type="submit" className="submit-btn">
                  Confirm Booking
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

const getColorForAccessibility = (level) => {
  switch (level) {
    case "accessible":
      return "#28A745";
    case "partially accessible":
      return "#EDB106";
    case "not accessible":
      return "#B5000D";
    default:
      return "#0000FF"; // Blue for searched places
  }
};

export default Map;
