import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import { Container, Row, Col, Card } from 'react-bootstrap';
import { fetchBlogById } from '../data/blogsData'; // Import the fetch function

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBlog = async () => {
      try {
        const fetchedBlog = await fetchBlogById(id);
        setBlog(fetchedBlog);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    getBlog();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
          Loading...
        </h2>
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container className="py-5 text-center">
        <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
          Blog Not Found
        </h2>
        <p className="text-muted">
          {error || "Sorry, we couldn't find the blog you're looking for."}
        </p>
        <Link to="/blogs" className="button py-3 px-6">
          Back to Blogs
        </Link>
      </Container>
    );
  }

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
          BLOG DETAILS
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
          {blog.title}
        </h1>
      </div>

      {/* Blog Details Section */}
      <Container className="py-5" style={{ marginBottom: '8%' }}>
        <Row className="g-4">
          {/* Left Side: Blog Image */}
          <Col lg={4} md={5}>
            <img
              src={blog.image}
              alt={`${blog.title} Image`}
              className="img-fluid rounded"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
          </Col>

          {/* Right Side: Blog Details */}
          <Col lg={8} md={7}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <Card.Title className="mb-3" style={{ color: '#0A3D62', fontSize: '2rem', fontWeight: 'bold' }}>
                  {blog.title}
                </Card.Title>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">{blog.author}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" style={{ color: '#0A3D62' }} />
                    <span className="text-muted">{blog.date}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="text-muted">{blog.category}</span>
                  </div>
                </div>
                <Card.Text className="text-muted mb-4">
                  {blog.content}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="text-center mt-5">
          <Link to="/blogs" className="small-b-l">
            Back to Blogs
          </Link>
        </div>
      </Container>

  
    </>
  );
}

export default BlogDetails;