import React from "react";
import { Container, Row, Col, Accordion } from "react-bootstrap";

const FAQ = () => {
  return (
    <>
      {/* Hero Section */}
      <div
        className="container-fluid text-white py-5"
        style={{
          backgroundColor: "#1a3c6d",
          backgroundImage: 'url("https://via.placeholder.com/1200x400?text=FAQ+Hero+Image")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "400px",
          position: "relative",
        }}
      >
        <div className="container text-center py-5">
          <h1 className="display-3 fw-bold">FAQ</h1>
          <hr className="w-25 mx-auto border-2 border-white" />
          <p className="lead mt-3">
            Frequently Asked Questions<br />
            Get answers to common queries about AccessNow
          </p>
        </div>
      </div>

      {/* FAQ Content Section */}
      <div className="container-fluid bg-light py-5">
        <div className="container">
          <Row className="justify-content-center">
            <Col md={10}>
              <div className="text-center mb-5">
                <h2 className="fw-bold">Have Questions? We’ve Got Answers</h2>
                <p className="text-muted">
                  Explore our FAQs to find helpful information about using AccessNow.
                </p>
              </div>
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>How do I download the AccessNow app?</Accordion.Header>
                  <Accordion.Body>
                    You can download the AccessNow app from the App Store (iOS) or Google Play Store (Android). Search for "AccessNow" and follow the installation instructions.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>What is a MapMission?</Accordion.Header>
                  <Accordion.Body>
                    A MapMission is a community-driven initiative to map accessibility features at various locations. Gather a team, choose a location, and use the app to contribute data.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>How do I add a review?</Accordion.Header>
                  <Accordion.Body>
                    Open the AccessNow app, select a location, and choose "Add Review." Rate the accessibility, add photos, and select relevant tags to share your experience.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>Who can see my reviews?</Accordion.Header>
                  <Accordion.Body>
                    Your reviews are visible to all AccessNow users to help build a comprehensive accessibility map. You can remain anonymous if preferred.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                  <Accordion.Header>How can I get support?</Accordion.Header>
                  <Accordion.Body>
                    For support, email us at <a href="mailto:hello@accessnow.ca">hello@accessnow.ca</a> or visit our Support page for additional resources.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                  <Accordion.Header>How do I add a location to my favorites?</Accordion.Header>
                  <Accordion.Body>
                    Log in to the AccessNow app, select a location on the map, and click the "Add to Favorites" button (heart icon). You need to be logged in with a token to manage favorites.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                  <Accordion.Header>What do the accessibility colors mean?</Accordion.Header>
                  <Accordion.Body>
                    The map uses colored pins to indicate accessibility: Green (Accessible) for barrier-free locations, Yellow (Partially Accessible) for limited access, and Red (Not Accessible) for inaccessible places.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="7">
                  <Accordion.Header>How can I book a visit to a location?</Accordion.Header>
                  <Accordion.Body>
                    Select a location on the map, click "Book Now," and fill out the date and time in the booking modal. Confirm to add it to your bookings list.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="8">
                  <Accordion.Header>Why can’t I see some locations on the map?</Accordion.Header>
                  <Accordion.Body>
                    Locations may not appear due to applied filters (e.g., accessibility levels or location types) or search terms. Clear filters or use "Show All On Map" to view all locations.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="9">
                  <Accordion.Header>How do I update or delete my review?</Accordion.Header>
                  <Accordion.Body>
                    In the location details, find your review, click "Edit" to update it, or "Delete" to remove it. Confirm the deletion when prompted.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="10">
                  <Accordion.Header>What should I do if photos or hours don’t load?</Accordion.Header>
                  <Accordion.Body>
                    If photos or operating hours fail to load, it may be due to a network issue or missing data. Try refreshing the app or contact support at <a href="mailto:hello@accessnow.ca">hello@accessnow.ca</a>.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="11">
                  <Accordion.Header>How do I switch between light and dark mode?</Accordion.Header>
                  <Accordion.Body>
                    Click the "Switch to Dark Mode" or "Switch to Light Mode" button in the map sidebar to toggle the map’s appearance.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="12">
                  <Accordion.Header>What are the coordinates displayed for?</Accordion.Header>
                  <Accordion.Body>
                    Coordinates (latitude and longitude) help pinpoint the exact location on the map, useful for navigation or reporting inaccuracies.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default FAQ;