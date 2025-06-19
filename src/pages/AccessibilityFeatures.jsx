import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

const AccessibilityFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newFeature, setNewFeature] = useState({
    featureName: "",
    description: ""
  });
  const [editingFeature, setEditingFeature] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all features on component mount
  useEffect(() => {
    fetchFeatures();
  }, []);

  // Function to fetch all features
  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/AccessibilityFeatures");
      console.log("Fetched features:", response.data); // Debug: log the structure of features
      setFeatures(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching features:", err);
      setError(`Failed to load accessibility features: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for new feature form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeature({
      ...newFeature,
      [name]: value
    });
  };

  // Handle input changes for editing feature
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingFeature({
      ...editingFeature,
      [name]: value
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Submit new feature
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newFeature.featureName || !newFeature.description) {
      setError("Feature name and description are required");
      return;
    }
    
    try {
      setLoading(true);
      await apiClient.post("/AccessibilityFeatures", newFeature);
      setNewFeature({ featureName: "", description: "" });
      await fetchFeatures();
      setError("");
    } catch (err) {
      console.error("Error adding feature:", err);
      setError(`Failed to add feature: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Start editing a feature
  const startEditing = (feature) => {
    // Log the feature to check its structure
    console.log("Feature to edit:", feature);
    
    // Check if feature exists
    if (!feature) {
      console.error("Cannot edit feature: Feature is null or undefined");
      setError("Cannot edit this feature: Invalid feature object");
      return;
    }
    
    // Find the correct ID property (might be ID, id, or featureId)
    const featureId = feature.id || feature.ID || feature.featureId;
    
    if (!featureId) {
      console.error("Cannot edit feature: Missing ID", feature);
      setError("Cannot edit this feature: Missing ID");
      return;
    }
    
    // Create a deep copy with the ID property explicitly set
    setEditingFeature({
      ...feature,
      id: featureId
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingFeature(null);
  };

  // Save edited feature
  const saveEdit = async () => {
    // Validate the feature ID is present
    if (!editingFeature) {
      setError("Cannot update feature: Missing feature data");
      return;
    }
    
    const featureId = editingFeature.id || editingFeature.ID || editingFeature.featureId;
    
    if (!featureId) {
      setError("Cannot update feature: Missing ID");
      console.error("Missing ID in editingFeature:", editingFeature);
      return;
    }
    
    if (!editingFeature.featureName || !editingFeature.description) {
      setError("Feature name and description are required");
      return;
    }
    
    try {
      setLoading(true);
      
      // Log the request information for debugging
      console.log(`Updating feature with ID: ${featureId}`);
      
      // Create a payload with just the required fields
      const updatePayload = {
        featureName: editingFeature.featureName,
        description: editingFeature.description
      };
      
      console.log("Update payload:", updatePayload);
      
      // Make the API request
      const response = await apiClient.put(`/AccessibilityFeatures/${featureId}`, updatePayload);
      
      console.log("Update response:", response.data);
      
      // Clear editing state
      setEditingFeature(null);
      
      // Refetch all features to ensure UI is in sync
      await fetchFeatures();
      
      setError("");
    } catch (err) {
      console.error("Error updating feature:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        
        // Check for validation errors in the response
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError(`Failed to update feature: ${err.response.data?.title || err.message}`);
        }
      } else {
        setError(`Failed to update feature: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a feature
  const deleteFeature = async (feature) => {
    // Get the feature ID, handling different possible property names
    const featureId = feature.id || feature.ID || feature.featureId;
    
    if (!featureId) {
      setError("Cannot delete feature: Missing ID");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this feature?")) return;
    
    try {
      setLoading(true);
      await apiClient.delete(`/AccessibilityFeatures/${featureId}`);
      
      // Update local state to remove the deleted feature
      setFeatures(prevFeatures => 
        prevFeatures.filter(f => {
          const id = f.id || f.ID || f.featureId;
          return id !== featureId;
        })
      );
      setError("");
    } catch (err) {
      console.error("Error deleting feature:", err);
      setError(`Failed to delete feature: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get ID from feature object
  const getFeatureId = (feature) => {
    return feature.id || feature.ID || feature.featureId;
  };

  // Filter features based on search term
  const filteredFeatures = features.filter(feature => 
    feature.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Accessibility Features</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card mb-4">
        <div className="card-header">Add New Feature</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="featureName" className="form-label">Feature Name</label>
              <input
                type="text"
                className="form-control"
                id="featureName"
                name="featureName"
                value={newFeature.featureName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={newFeature.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Feature"}
            </button>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Available Features</span>
          <div className="search-container">
            <input
              type="text"
              className="form-control"
              placeholder="Search features..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: "200px" }}
            />
          </div>
        </div>
        <div className="card-body">
          {loading && <p>Loading features...</p>}
          
          {!loading && filteredFeatures.length === 0 && (
            <p>No accessibility features found.</p>
          )}
          
          {filteredFeatures.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Feature Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeatures.map(feature => {
                    const featureId = getFeatureId(feature);
                    return (
                      <tr key={featureId || Math.random().toString()}>
                        {editingFeature && getFeatureId(editingFeature) === featureId ? (
                          <>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                name="featureName"
                                value={editingFeature.featureName || ""}
                                onChange={handleEditChange}
                              />
                            </td>
                            <td>
                              <textarea
                                className="form-control"
                                name="description"
                                value={editingFeature.description || ""}
                                onChange={handleEditChange}
                              />
                            </td>
                            <td>
                              <button 
                                className="btn btn-success btn-sm me-2"
                                onClick={saveEdit}
                                disabled={loading}
                              >
                                {loading ? "Saving..." : "Save"}
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{feature.featureName}</td>
                            <td>{feature.description}</td>
                            <td>
                              <button 
                                className="btn btn-primary btn-sm me-2"
                                onClick={() => startEditing(feature)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteFeature(feature)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityFeatures;