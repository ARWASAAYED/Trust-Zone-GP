import React, { useState, useEffect } from "react";
import { Modal, Button, Tag, Divider, theme } from "antd";
import { CloseOutlined, RightOutlined, DownOutlined } from "@ant-design/icons";

const { CheckableTag } = Tag;

const FilterModal = ({
  isVisible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState(
    currentFilters || []
  );
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setSelectedFeatures(currentFilters || []);
  }, [currentFilters]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleTagChange = (feature, checked) => {
    setSelectedFeatures((prev) => {
      if (checked) {
        return [...prev, feature];
      } else {
        return prev.filter((f) => f !== feature);
      }
    });
  };

  const handleApply = () => {
    onApplyFilters(selectedFeatures);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedFeatures([]);
  };

  // Example filter categories and features - these would ideally come from an API
  const filterCategories = {
    Entrance: [
      "Alternative Entrance",
      "Accessible Parking",
      "Outdoor Access Only",
      "Ramp",
      "Barrier-Free Entrance",
      "Automatic Door",
    ],
    General: [
      "Handrails",
      "Hearing Loop",
      "Large Print",
      "Lighting - Bright",
      "Lighting - Low",
      "Lowered Counters",
      "Quiet",
      "Scent Free",
      "Service Animal Friendly",
      "Accessible Seating",
      "Spacious",
      "Stair Lift",
      "Sign Language",
      "Auditory Signals",
      "Braille",
      "Customer Service",
      "Digital Menu",
      "Elevator",
      "Tactile Surfaces",
    ],
    Restroom: ["Accessible Stall", "Grab Bars", "Unisex Restroom"],
    Seating: ["Fixed Seating", "Moveable Seating"],
    Service: ["Table Service", "Counter Service"],
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Modal
      title="Filter"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="clear" onClick={handleClearAll}>
          Clear All
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={handleApply}
          style={{
            background: "#1b4965",
            color: "#fff",
            borderRadius: "20px",
            padding: "10px 24px",
            fontSize: "1rem",
            fontWeight: 600,
            border: "none",
          }}
        >
          Apply Filters
        </Button>,
      ]}
      closeIcon={<CloseOutlined />}
      centered
      width={400}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      style={{ top: 50 }}
    >
      {Object.entries(filterCategories).map(([category, features]) => (
        <div key={category} style={{ marginBottom: "16px" }}>
          <Divider orientation="left">
            <span
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => toggleCategory(category)}
            >
              {expandedCategories[category] ? (
                <DownOutlined />
              ) : (
                <RightOutlined />
              )}
              <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
                {category}
              </span>
            </span>
          </Divider>
          {expandedCategories[category] && (
            <div style={{ marginTop: "8px" }}>
              {features.map((feature) => (
                <CheckableTag
                  key={feature}
                  checked={selectedFeatures.includes(feature)}
                  onChange={(checked) => handleTagChange(feature, checked)}
                  style={{ marginBottom: "8px", marginRight: "8px" }}
                >
                  {feature}
                </CheckableTag>
              ))}
            </div>
          )}
        </div>
      ))}
    </Modal>
  );
};

export default FilterModal;
