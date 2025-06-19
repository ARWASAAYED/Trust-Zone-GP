import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaClock } from "react-icons/fa";
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log(`Fetching event with ID: ${id}`);
        const response = await fetch(`https://trustzone.azurewebsites.net/api/Event/${id}`);
        if (!response.ok) {
          throw new Error(`Event with ID ${id} not found`);
        }
        const data = await response.json();
        console.log('Event data:', data);
        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleJoinEvent = () => {
    setIsJoined(true);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
          Loading...
        </h2>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container className="py-5 text-center">
        <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
          Event Not Found
        </h2>
        <p className="text-muted">
          {error || "Sorry, we couldn't find the event you're looking for."}
        </p>
        <Link to="/events" className="button py-3 px-6">
          Back to Events
        </Link>
      </Container>
    );
  }

  // Map API fields to component fields
  const title = event.eventName || 'Untitled Event';
  const startDate = event.startDate ? new Date(event.startDate).toLocaleString() : 'No start date';
  const endDate = event.endDate ? new Date(event.endDate).toLocaleString() : 'No end date';
  const createdAt = event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Unknown';
  const location = 'Location not provided'; // API lacks location, add if available
  const organizer = 'Organizer not provided'; // API lacks organizer, add if available
  const description = event.description || 'No description available';
  const agenda = event.specialFeaturesAvailable ? event.specialFeaturesAvailable.split(', ').map(item => item.trim()) : ['No agenda available'];

  return (
    <>
      {/* Header Section */}
      <div 
        className="header-bg text-center" 
        style={{ 
          margin: '-1.1%', 
          backgroundColor: '#1B4965', 
          color: 'white', 
          padding: '120px 0', 
          borderRadius: '0px 0px 25px 25px' 
        }}
      >
        <p 
          className="welcome-text" 
          style={{ 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            textAlign: 'start', 
            marginLeft: '160px', 
            marginBottom: '-3px' 
          }}
        >
          EVENT DETAILS
        </p>
        <h1 
          className="display-4" 
          style={{ 
            fontSize: '3rem', 
            fontWeight: 'bolder', 
            textAlign: 'start', 
            marginLeft: '160px' 
          }}
        >
          {title}
        </h1>
      </div>

      {/* Event Details Section */}
      <Container className="py-5" style={{ marginBottom: '8%' }}>
        <Row className="g-4">

          <Col lg={12} md={7}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <Card.Title className="mb-3" style={{ color: '#0A3D62', fontSize: '2rem', fontWeight: 'bold' }}>
                  {title}
                </Card.Title>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">Start: {startDate}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaClock className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">End: {endDate}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">{location}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">{organizer}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">Created: {createdAt}</span>
                  </div>
                </div>
                <Card.Text className="text-muted mb-4">
                  {description}
                </Card.Text>
                <h5 className="fw-bold mb-3" style={{ color: '#0A3D62' }}>
                  Special Features
                </h5>
                {Array.isArray(agenda) && agenda.length > 0 ? (
                  <ul className="list-unstyled">
                    {agenda.map((item, index) => (
                      <li key={index} className="mb-2 text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No special features available for this event.</p>
                )}
                <div className="mt-4">
                  {isJoined ? (
                    <p className="text-success fw-bold">
                      You have successfully joined this event!
                    </p>
                  ) : (
                    <Button
                      onClick={handleJoinEvent}
                      className="text-white"
                      style={{ backgroundColor: '#0A3D62', borderColor: '#0A3D62' }}
                    >
                      Confirm Attendance
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="text-center mt-5">
          <Link to="/events" className="small-b-l">
            Back to Events
          </Link>
        </div>
      </Container>
    </>
  );
}

export default EventDetails;