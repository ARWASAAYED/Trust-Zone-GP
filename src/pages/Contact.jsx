import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div style={{ backgroundColor: "#e6f0fa", minHeight: "100vh", padding: "50px 0" }}>
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8}>
            <h6 style={{ color: "#666", textTransform: "uppercase", letterSpacing: "2px" }}>Contact</h6>
            <h1 style={{ color: "#1a3c67", fontSize: "48px", fontWeight: "700", marginBottom: "20px" }}>
              Get In Touch
            </h1>
            <p style={{ color: "#666", fontSize: "18px", marginBottom: "30px" }}>
              Have something to share? We want to hear from you. <br />
              Reach out at <a href="mailto:trustzone@gmail.com" style={{ color: "#1a3c67", textDecoration: "underline" }}>trustzone@gmail.com</a>
            </p>
            <div style={{ marginBottom: "40px" }}>
              <a href="https://facebook.com" style={{ color: "#1a3c67", margin: "0 10px" }}>
                <FaFacebookF size={20} />
              </a>
              <a href="https://twitter.com" style={{ color: "#1a3c67", margin: "0 10px" }}>
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" style={{ color: "#1a3c67", margin: "0 10px" }}>
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" style={{ color: "#1a3c67", margin: "0 10px" }}>
                <FaLinkedinIn size={20} />
              </a>
            </div>
            <Row className="g-4 justify-content-center">
              <Col md={4}>
                <a href="mailto:trustzone@gmail.com" style={{ textDecoration: "none" }}>
                  <Card
                    style={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "20px",
                      height: "100%",
                    }}
                  >
                    <Card.Body className="text-center">
                      <div style={{ color: "#1a3c67", marginBottom: "15px" }}>
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1a3c67"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                          <line x1="9" y1="10" x2="15" y2="10"></line>
                          <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                      </div>
                      <Card.Title style={{ color: "#1a3c67", fontSize: "18px", fontWeight: "600" }}>
                        Press Inquiries
                      </Card.Title>
                      <Card.Text style={{ color: "#666", fontSize: "14px" }}>
                        Reach out to us.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </a>
              </Col>
              <Col md={4}>
                <Link to="/faq" style={{ textDecoration: "none" }}>
                  <Card
                    style={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "20px",
                      height: "100%",
                    }}
                  >
                    <Card.Body className="text-center">
                      <div style={{ color: "#1a3c67", marginBottom: "15px" }}>
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1a3c67"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                          <path d="M12 6v6l4 2"></path>
                        </svg>
                      </div>
                      <Card.Title style={{ color: "#1a3c67", fontSize: "18px", fontWeight: "600" }}>
                        FAQ
                      </Card.Title>
                      <Card.Text style={{ color: "#666", fontSize: "14px" }}>
                        Need help?
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            </Row>
             
          </Col>
          
        </Row>
        
      </Container>
       {/* Footer Section */}
      <div className="Footer-bg text-center" style={{marginTop: '13.1%',marginBottom:'-4.5%', backgroundColor: '#1B4965', color: 'white', padding: '100px 0', borderRadius:'25px 25px 0px 0px'}}>
        <h1 className="display-4" style={{ fontSize: '3rem', fontWeight: 'bolder', textAlign: 'center', marginLeft:'40px'}}>Join our mission. Get Started Today</h1>
        <div style={{marginTop:'40px'}}>
          <Link to='/map' className="button bo" style={{backgroundColor: 'var(--color-bf480b)',marginRight:'40px'}}>ADD A NEW REVIEW</Link>
          <Link to='/blogs' className='button bo' style={{backgroundColor: 'var(--color-BEE9E8)',color:'#1B4965'}}>EXPLORE THE BLOG</Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;