import React from 'react';
import { Link } from "react-router-dom";
import { Card, Col } from 'react-bootstrap';

function BlogCard({ blog }) {
  return (
    <Col lg={4} md={6} sm={12} className="mb-4">
      <Card className="border-0">
        <Card.Img
          variant="top"
          src={blog.image}
          alt={`${blog.title} Image`}
          style={{ height: '200px', objectFit: 'cover', borderRadius: '10px' }}
        />
        <Card.Body className="p-0 mt-3">
          <Card.Title className="mb-2" style={{ color: '#0A3D62', fontSize: '1rem', fontWeight: 'bold' }}>
            {blog.title}
          </Card.Title>
          <Link
            to={`/blogs/${blog.id}`}
            className="small-b-l"
          >
            READ MORE
          </Link>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default BlogCard;