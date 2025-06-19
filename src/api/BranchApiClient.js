// BranchApiClient.js
import apiClient from "./apiClient";

// Branch CRUD
export const getAllBranches = () => apiClient.get("/Branch");
export const getBranchById = (id) => apiClient.get(`/Branch/${id}`);
export const createBranch = (branch) => apiClient.post("/Branch", branch);
export const updateBranch = (id, branch) =>
  apiClient.put(`/Branch/${id}`, branch);
export const deleteBranch = (id) => apiClient.delete(`/Branch/${id}`);

// Opening Hours
export const createBranchOpeningHour = (openingHour) =>
  apiClient.post("/BranchOpeningHour", openingHour);

export const getBranchOpeningHours = (branchId) =>
  apiClient.get(`/BranchOpeningHour/by-branch/${branchId}`);

export const getOpeningHourById = (id) =>
  apiClient.get(`/BranchOpeningHour/${id}`);

// Photos
export const getBranchPhotos = (branchId) =>
  apiClient.get(`/BranchPhotos/branch/${branchId}`);

// Existing functions
export const getBranchReviews = (branchId, page = 1, pageSize = 100) =>
  apiClient.get(`/Reviews/branch/${branchId}`, { params: { page, pageSize } });

// New functions
export const createReview = (reviewData) =>
  apiClient.post("/Reviews/create", reviewData);
export const updateReview = (id, reviewData) =>
  apiClient.put(`/Reviews/${id}`, reviewData);
export const deleteReview = (id) => apiClient.delete(`/Reviews/${id}`);
