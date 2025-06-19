import React from 'react';
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Card, Col } from 'react-bootstrap';

function EventCard({ event, index }) {
  const date = event.startDate ? new Date(event.startDate) : null;
  const dateParts = date ? 
    date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }).split(' ') : 
    ['-', 'April']; // Fallback to day and month if date is invalid

  return (
    <Col lg={12}>
      <Card 
        className="border-0 d-flex flex-row align-items-center p-3" 
        style={{ boxShadow: '3px 3px 3px 3px', color: 'rgb(152 182 181)' }}
      >
        <div className="text-center me-4" style={{ minWidth: '60px' }}>
          <div 
            className="text-white rounded p-2" 
            style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'rgb(123 199 198)' }}
          >
            {dateParts[1]}
          </div>
          <div className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>
            {dateParts[0]}
          </div>
        </div>
        <Card.Body className="p-0 flex-grow-1">
          <Card.Title className="mb-2" style={{ color: '#0A3D62', fontSize: '1.25rem' }}>
            {event.eventName || 'Untitled Event'}
          </Card.Title>
          <Card.Text className="text-muted">
            {event.description || 'No description'}
          </Card.Text>
          <Card.Text className="text-muted mt-1">
            <FaMapMarkerAlt className="me-1" /> {'Location not provided'}
          </Card.Text>
        </Card.Body>
        <Link
          to={`/events/${event.branchId ?? index}`} // Use branchId if available, otherwise fallback to index
          state={{ event }}
          className="ms-3 text-white btn"
          style={{ backgroundColor: '#0A3D62', borderColor: '#0A3D62', whiteSpace: 'nowrap' }}
        >
          Join Event
        </Link>
      </Card>
    </Col>
  );
}

export default EventCard;