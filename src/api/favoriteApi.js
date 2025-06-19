import apiClient from "./apiClient";

export const fetchFavoriteBranchIds = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  const response = await apiClient.get("/FavoritePlace");
  const favoritesData = Array.isArray(response.data)
    ? response.data
    : [response.data];
  return favoritesData.map(
    (favorite) => favorite.branch?.id || favorite.branchId
  );
};
