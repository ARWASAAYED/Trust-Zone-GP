import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import {
  FaEnvelope,
  FaBirthdayCake,
  FaWheelchair,
  FaUser,
  FaPaperPlane,
} from "react-icons/fa";
import apiClient from "../api/apiClient";

function ReviewerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [reviewerProfile, setReviewerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewerProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/UserProfile/${userId}`);
        setReviewerProfile(response.data);
      } catch (err) {
        console.error("Error fetching reviewer profile:", err);
        setError("Failed to load reviewer profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchReviewerProfile();
    }
  }, [userId]);

  const handleSendMessage = () => {
    if (reviewerProfile?.id) {
      navigate("/chat", { state: { targetUserId: reviewerProfile.id } });
    } else {
      alert("Cannot start a chat: Reviewer ID is missing.");
    }
  };

  if (isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  if (!reviewerProfile) {
    return (
      <Container className="text-center mt-5">
        <div className="alert alert-warning" role="alert">
          Reviewer profile not found.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm rounded-lg">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <img
                  src={
                    reviewerProfile.profilePictureUrl || "/images/profile.png"
                  }
                  alt={`${reviewerProfile.userName}'s profile`}
                  className="rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    border: "3px solid #5FA8D3",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/profile.png";
                  }}
                />
                <h2
                  className="mb-1"
                  style={{ color: "#333", fontWeight: "600" }}
                >
                  {reviewerProfile.userName || "Unknown User"}
                </h2>
                {reviewerProfile.email && (
                  <p className="text-muted mb-0">
                    <FaEnvelope className="me-2" />
                    {reviewerProfile.email}
                  </p>
                )}
              </div>

              <hr className="my-4" />

              <div className="profile-details">
                <h4 className="mb-3" style={{ color: "#5FA8D3" }}>
                  About
                </h4>
                {reviewerProfile.age && (
                  <p className="mb-2">
                    <FaBirthdayCake className="me-2 text-primary" />
                    <strong>Age:</strong> {reviewerProfile.age}
                  </p>
                )}
                {reviewerProfile.disabilityType && (
                  <p className="mb-2">
                    <FaWheelchair className="me-2 text-info" />
                    <strong>Disability Type:</strong>{" "}
                    {reviewerProfile.disabilityType}
                  </p>
                )}
                {!reviewerProfile.age && !reviewerProfile.disabilityType && (
                  <p className="text-muted">No additional details available.</p>
                )}
              </div>

              <div className="d-grid gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  className="d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#5FA8D3", borderColor: "#5FA8D3" }}
                >
                  <FaPaperPlane className="me-2" /> Send Message
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ReviewerProfile;
