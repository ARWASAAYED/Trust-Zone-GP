import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Container, Row, Col, Nav, Card, Form, InputGroup, Button } from 'react-bootstrap';
import BlogCard from '../components/BlogCard';
import blogs from '../data/blogsData'; // Import the blogs data

function Blogs() {
  const [categoryFilter, setCategoryFilter] = useState('Feed'); // Default to Feed
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Define categories (matching AccessNow blog page)
  const categories = ['Feed', 'Places', 'People', 'Tech', 'Lifestyle', 'Education', 'News', 'Business', 'Medical'];

  // Debug: Log the raw blogs data
  console.log('Raw blogs data:', blogs);

  // Filter blogs based on category (Feed shows all blogs) and search term
  const filteredBlogs = categoryFilter === 'Feed'
    ? blogs
    : blogs.filter(blog => blog.category.toLowerCase() === categoryFilter.toLowerCase());

  // Debug: Log filtered blogs
  console.log('Filtered blogs:', filteredBlogs);

  // Further filter by search term (search in title and excerpt)
  const searchedBlogs = filteredBlogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Log searched blogs
  console.log('Searched blogs:', searchedBlogs);

  // Separate blogs into categories for the sections (case-insensitive)
  const placesBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'places');
  const newsBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'news');
  const peopleBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'people');
  const techBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'tech');
  const lifestyleBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'lifestyle');
  const educationBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'education');
  const businessBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'business');
  const medicalBlogs = searchedBlogs.filter(blog => blog.category.toLowerCase() === 'medical');

  return (
    <>
      {/* Category Navigation Bar */}
      <div 
        className="py-3 text-center" 
        style={{ backgroundColor: '#1B4965' }}
      >
        <Nav className="justify-content-center">
          {categories.map((category, index) => (
            <Nav.Item key={index}>
              <Nav.Link
                onClick={() => setCategoryFilter(category)}
                style={{
                  color: categoryFilter === category ? '#BEE9E8' : '#ffffff',
                  fontWeight: categoryFilter === category ? 'bold' : 'normal',
                  textTransform: 'uppercase',
                  padding: '0 15px'
                }}
              >
                {category}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {/* Header Section */}
      <Container className="py-5 text-center">
        <h1 className="display-4 fw-bold" style={{ color: '#0A3D62' }}>
          Discover Trust Zone
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>
          Serving you accessible travel, tech, news, lifestyle and more.
        </p>

        {/* Social Media Icons */}
        <div className="d-flex justify-content-center gap-3 my-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF style={{ color: '#0A3D62', fontSize: '1.5rem' }} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter style={{ color: '#0A3D62', fontSize: '1.5rem' }} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram style={{ color: '#0A3D62', fontSize: '1.5rem' }} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin style={{ color: '#0A3D62', fontSize: '1.5rem' }} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            <FaYoutube style={{ color: '#0A3D62', fontSize: '1.5rem' }} />
          </a>
        </div>
      </Container>

      {/* Blog Sections */}
      <Container className="py-5">
        <Row className="g-4">
          {/* Main Content: Discover Sections */}
          <Col lg={9}>
            {/* Discover Places Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'places') && (
              <div className="mb-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover Places
                </h2>
                <Row className="g-4">
                  {placesBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    placesBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover News Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'news') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover News
                </h2>
                <Row className="g-4">
                  {newsBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    newsBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover People Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'people') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover People
                </h2>
                <Row className="g-4">
                  {peopleBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    peopleBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover Tech Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'tech') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover Tech
                </h2>
                <Row className="g-4">
                  {techBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    techBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover Lifestyle Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'lifestyle') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover Lifestyle
                </h2>
                <Row className="g-4">
                  {lifestyleBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    lifestyleBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover Education Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'education') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover Education
                </h2>
                <Row className="g-4">
                  {educationBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    educationBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover Business Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'business') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover Business
                </h2>
                <Row className="g-4">
                  {businessBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    businessBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}

            {/* Discover Medical Section */}
            {(categoryFilter === 'Feed' || categoryFilter.toLowerCase() === 'medical') && (
              <div className="mt-5">
                <h2 className="mb-4" style={{ color: '#0A3D62', fontSize: '2rem' }}>
                  Discover Medical
                </h2>
                <Row className="g-4">
                  {medicalBlogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted">No blogs found in this category.</p>
                    </div>
                  ) : (
                    medicalBlogs.map((blog, index) => (
                      <BlogCard key={index} blog={blog} />
                    ))
                  )}
                </Row>
              </div>
            )}
          </Col>

          {/* Sidebar: Trending This Month */}
          <Col lg={3}>
            <div className="mb-4">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  Search
                </Button>
              </InputGroup>
            </div>
            <h3 className="mb-4" style={{ color: '#0A3D62', fontSize: '1.5rem' }}>
              Trending this month
            </h3>
            <Card className="border-0 shadow-sm">
              <Card.Img
                variant="top"
                src="https://via.placeholder.com/300x150?text=Trending+Blog+Image"
                alt="Trending Blog Image"
                style={{ borderRadius: '10px 10px 0 0' }}
              />
              <Card.Body>
                <Card.Text className="text-muted small">
                  Accessible Fort Lauderdale, Florida - Travel Guide
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Blogs;