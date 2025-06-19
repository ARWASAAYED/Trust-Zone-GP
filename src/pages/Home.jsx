import Container from "../components/Container";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaTags, FaBookmark } from "react-icons/fa";
import { GrLinkNext } from "react-icons/gr";
import { PiShootingStarBold } from "react-icons/pi";
import { GrLocationPin } from "react-icons/gr";
import { BsStars } from "react-icons/bs";
import { Row, Col, Card, Button } from "react-bootstrap";
import * as tf from "@tensorflow/tfjs";
import EventCard from "../components/EventCard";
import { motion } from "framer-motion";

const phoneImages = [
  "/images/phone4.avif",
  "/images/phone5.avif",
  "/images/phone6.avif",
];

function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [greeting, setGreeting] = useState("Loading...");
  const [events, setEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState(2);
  const [eventSearch, setEventSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % phoneImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const trainAndPredict = async () => {
      const userData = [
        { timeOfDay: 0, mood: 0, greeting: "Good morning" },
        { timeOfDay: 1, mood: 1, greeting: "Hello" },
        { timeOfDay: 2, mood: 0, greeting: "Good evening" },
      ];

      const xs = tf.tensor2d(
        userData.map((d) => [d.timeOfDay, d.mood]),
        [3, 2]
      );
      const ys = tf.tensor1d(
        userData.map((d) =>
          d.greeting === "Good morning" ? 0 : d.greeting === "Hello" ? 1 : 2
        )
      );

      const model = tf.sequential();
      model.add(
        tf.layers.dense({ units: 3, inputShape: [2], activation: "softmax" })
      );
      model.compile({
        optimizer: "adam",
        loss: "sparseCategoricalCrossentropy",
      });

      await model.fit(xs, ys, { epochs: 50 });

      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 0 : hour < 18 ? 1 : 2;
      const mood = 0;
      const currentInput = tf.tensor2d([[timeOfDay, mood]], [1, 2]);
      const prediction = model.predict(currentInput);
      const greetingIndex = prediction.argMax(-1).dataSync()[0];
      const greetings = ["Good morning", "Hello", "Good evening"];
      setGreeting(greetings[greetingIndex]);
    };

    trainAndPredict();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "https://trustzone.azurewebsites.net/api/Event"
        );
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        console.log("Fetched events:", data);
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const Counter = ({ end, label }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 1500;
      const increment = end / (duration / 50);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setCount(Math.ceil(start));
      }, 50);

      return () => clearInterval(timer);
    }, [end]);

    return (
      <div className="col-lg-4 col-md-12 col-sm-12 matrix d-flex flex-column align-items-center mb-4">
        <span
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginRight: "1rem",
            minWidth: "80px",
            textAlign: "right",
            color: "rgb(123 199 198)",
          }}
        >
          {count}
          {end >= 1000 ? "+" : ""}
        </span>
        <h3
          className="metric-title m-0"
          style={{ fontSize: 35, color: "rgb(123 199 198)" }}
        >
          {label}
        </h3>
      </div>
    );
  };

  const filteredEvents = events.filter((event) => {
    if (!event) return false;
    const searchTerm = eventSearch.toLowerCase();
    const title = (event.eventName || "").toLowerCase();
    const description = (event.description || "").toLowerCase();
    const location = (event.location || "").toLowerCase();
    return (
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      location.includes(searchTerm)
    );
  });

  const displayedEvents = filteredEvents.slice(0, visibleEvents);

  const handleViewMore = () => {
    setVisibleEvents((prev) => prev + 2);
  };

  return (
    <>
      <Container className="home-wrapper-1 py-5">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1
            className="home-wrapper-1-title mb-4"
            style={{
              color: "#1B4965",
              fontSize: "3.5rem",
              fontWeight: "700",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Explore Every Thing
          </h1>
          <p
            className="text-xl mb-4"
            style={{
              color: "#1B4965",
              fontSize: "1.5rem",
              lineHeight: "1.6",
              fontWeight: "500",
            }}
          >
            {greeting}, welcome to Trust Zone! Discover accessible places and
            join our community.
          </p>
        </motion.div>

        <div className="row g-4">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="small-banner position-relative mb-3 hover-effect">
              <Link
                to="/category?categoryId=1"
                className="moo"
                aria-label="View Restaurants and Cafes"
              >
                <div className="glass_hover"></div>
                <img
                  src="/images/restaurant.jpg"
                  className="img-fluid rounded-3 shadow-hover"
                  alt="Restaurants and Cafes"
                  style={{ transition: "transform 0.3s ease" }}
                />
                <div className="small-banner-content position-absolute">
                  <h5
                    style={{
                      marginBottom: "-58px",
                      color: "#fff",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                      fontWeight: "600",
                    }}
                  >
                    Restaurants{" "}
                  </h5>
                  <h5
                    className="mb-3"
                    style={{
                      color: "#fff",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                      fontWeight: "600",
                    }}
                  >
                    and Cafes
                  </h5>
                </div>
              </Link>
            </div>
            <div className="small-banner position-relative">
              <Link
                to="/category?categoryId=6"
                className="moo"
                aria-label="View Healthcare Facilities"
              >
                <div className="glass_hover"></div>
                <img
                  src="/images/healthcare.jpg"
                  className="img-fluid rounded-3"
                  alt="Healthcare Facilities"
                />
                <div className="small-banner-content position-absolute">
                  <h5 style={{ marginBottom: "-58px" }}>Healthcare </h5>
                  <h5 className="mb-3">Facilities</h5>
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="small-banner position-relative mb-3">
              <Link
                to="/category?categoryId=6"
                className="moo"
                aria-label="View Entertainment"
              >
                <div className="glass_hover"></div>
                <img
                  src="/images/entertainments.jpg"
                  className="img-fluid rounded-3"
                  alt="Entertainment"
                />
                <div className="small-banner-content position-absolute">
                  <h5 className="mb-5">Entertainment</h5>
                </div>
              </Link>
            </div>
            <div className="small-banner position-relative">
              <Link
                to="/category?categoryId=2"
                className="moo"
                aria-label="View Shopping"
              >
                <div className="glass_hover"></div>
                <img
                  src="/images/shopping.jpg"
                  className="img-fluid rounded-3"
                  alt="Shopping"
                />
                <div className="small-banner-content position-absolute">
                  <h5 className="mb-5">Shopping</h5>
                </div>
              </Link>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="small-banner position-relative mb-3">
              <Link
                to="/category?categoryId=7"
                className="moo"
                aria-label="View Government Entities"
              >
                <div className="glass_hover"></div>
                <img
                  src="/images/government.jpg"
                  className="img-fluid rounded-3"
                  alt="Government Entities"
                />
                <div className="small-banner-content position-absolute">
                  <h5 style={{ marginBottom: "-58px" }}>Government </h5>
                  <h5 className="mb-3">Entities</h5>
                </div>
              </Link>
            </div>
            <div className="small-banner position-relative">
              <Link
                to="/category?categoryId=3"
                className="moo"
                aria-label="View Fitness and Sports"
              >
                <div className="glass_hover"></div>
                <img
                  src="/images/fitness.jpg"
                  className="img-fluid rounded-3"
                  alt="Fitness and Sports"
                />
                <div className="small-banner-content position-absolute">
                  <h5 style={{ marginBottom: "-58px" }}>Fitness </h5>
                  <h5 className="mb-3">and Sports</h5>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          padding: "4rem 0",
          margin: "2rem 0",
        }}
      >
        <div className="feature-box-container">
          <div className="feature-box responsive-feature-section">
            <div className="responsive-feature-content">
              <div className="features-col">
                <div
                  className="feature"
                  style={{
                    padding: "2rem",
                    borderRadius: "1rem",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    className="feature-f d-flex align-items-center gap-2"
                    style={{ marginBottom: "0.5rem" }}
                  >
                    <FaMapLocationDot
                      style={{ fontSize: 30, color: "#1B4965" }}
                    />
                    <h2
                      className="text-2xl font-bold m-0"
                      style={{
                        color: "#1B4965",
                        position: "relative",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      Explore
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "3px",
                          backgroundColor: "#1B4965",
                          transform: "scaleX(0.7)",
                          transformOrigin: "left",
                          transition: "transform 0.3s ease",
                        }}
                      ></span>
                    </h2>
                  </div>
                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.6",
                      marginLeft: 0,
                      marginTop: 0,
                    }}
                  >
                    Explore the map for venues and.
                    <br />
                    find the places that are
                    <br />
                    accessible for you.
                  </p>
                </div>
                <div
                  className="feature"
                  style={{
                    padding: "2rem",
                    borderRadius: "1rem",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    className="feature-f d-flex align-items-center gap-2"
                    style={{ marginBottom: "0.5rem" }}
                  >
                    <FaTags style={{ fontSize: 30, color: "#66a09f" }} />
                    <h2
                      className="text-2xl font-bold m-0"
                      style={{
                        color: "#1B4965",
                        position: "relative",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      Tag
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "3px",
                          backgroundColor: "#66a09f",
                          transform: "scaleX(0.7)",
                          transformOrigin: "left",
                          transition: "transform 0.3s ease",
                        }}
                      ></span>
                    </h2>
                  </div>
                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.6",
                      marginLeft: 0,
                      marginTop: 0,
                    }}
                  >
                    Empower others by adding tags
                    <br />
                    and photos while you are out.
                  </p>
                </div>
                <div
                  className="feature"
                  style={{
                    padding: "2rem",
                    borderRadius: "1rem",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    className="feature-f d-flex align-items-center gap-2"
                    style={{ marginBottom: "0.5rem" }}
                  >
                    <FaBookmark
                      style={{ fontSize: 30, color: "rgb(230, 30, 23)" }}
                    />
                    <h2
                      className="text-2xl font-bold m-0"
                      style={{
                        color: "#1B4965",
                        position: "relative",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      Save
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "3px",
                          backgroundColor: "rgb(230, 30, 23)",
                          transform: "scaleX(0.7)",
                          transformOrigin: "left",
                          transition: "transform 0.3s ease",
                        }}
                      ></span>
                    </h2>
                  </div>
                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.6",
                      marginLeft: 0,
                      marginTop: 0,
                    }}
                  >
                    Create lists of venues to save
                    <br />
                    your favourites or plan ahead.
                  </p>
                </div>
              </div>
              <div
                className="phone-col"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  className="flex items-center justify-center relative overflow-hidden"
                  style={{ width: "100%", maxWidth: "400px" }}
                >
                  <img
                    src={phoneImages[currentImage]}
                    alt="Phone Content"
                    className="load-img object-cover rounded-[2rem] transition duration-700 ease-in-out shadow-lg"
                    style={{
                      width: "100%",
                      maxWidth: "350px",
                      height: "auto",
                      minHeight: "500px",
                      transform: "scale(1.08)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <div className="text-col">
                <h1
                  className="text-4xl font-bold mb-4"
                  style={{
                    color: "#1B4965",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  Better together
                </h1>
                <p
                  className="mb-3"
                  style={{
                    color: "#666",
                    lineHeight: "1.8",
                    fontSize: "1.1rem",
                  }}
                >
                  When we work together, tagging and sharing helps us all
                  navigate the world better.
                  <br />
                  Join the accessibility revolution.
                </p>
                <Link
                  to="/signup"
                  className="button py-3 px-6"
                  style={{
                    backgroundColor: "#1B4965",
                    color: "#fff",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#0A3D62";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#1B4965";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Explore on mobile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Container className="py-5">
        <div className="row">
          <Counter end={10000} label="Cities & Towns" />
          <Counter end={107} label="Countries" />
          <Counter end={1} label="Mission" />
        </div>
      </Container>

      <Container class1="home-wrapper-2 py-5 m-5">
        <h1
          className="home-wrapper-2-title mb-4"
          style={{
            color: "#1B4965",
            fontSize: "2.5rem",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Why Trust Zone?
        </h1>

        <div className="row g-4">
          <div className="col-lg-4 position-relative col-sm-12">
            <div className="small-banner mb-3">
              <div className="glass_hover"></div>
              <img
                src="images/c53bc7a7e6cc4110a14bd55ede25d027.jpg"
                className="img-fluid rounded-3"
                alt="banner"
              />
            </div>
            <div className="small-banner m-2">
              <h5 className="mb-3 fs-4" style={{ color: "#1B4965" }}>
                Accessibility is personal
              </h5>
              <p style={{ color: "var(--color-364149)" }}>
                We don't use vague labels like 'accessible' or 'inaccessible'.
                Instead, we give you the details you need to decide if a place
                is accessible for you.
              </p>
              <Link to="/about" className="small-b-ll">
                Learn more about Sociability
              </Link>
              <GrLinkNext
                className="grlink"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  color: "rgb(123 199 198)",
                }}
              />
            </div>
          </div>
          <div className="col-lg-4 position-relative col-sm-12">
            <div className="small-banner mb-3">
              <div className="glass_hover"></div>
              <img
                src="images/d3636a529ce3ed32f947733573c45772.jpg"
                className="img-fluid rounded-3"
                alt="banner"
              />
            </div>
            <div className="small-banner m-2">
              <h5 className="mb-3 fs-4" style={{ color: "#1B4965" }}>
                We focus on community
              </h5>
              <p style={{ color: "var(--color-364149)" }}>
                We look out for each other – finding, tagging and sharing
                accessible places so that others can enjoy them too.
              </p>
              <Link to="/community" className="small-b-ll">
                View our Community page
              </Link>
              <GrLinkNext
                className="grlink"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  color: "rgb(123 199 198)",
                }}
              />
            </div>
          </div>
          <div className="col-lg-4 position-relative col-sm-12">
            <div className="small-banner mb-3">
              <div className="glass_hover"></div>
              <img
                src="images/bb0c1d6f5da329acf05ffff86546c1b1.jpg"
                className="img-fluid rounded-3"
                alt="banner"
              />
            </div>
            <div className="small-banner m-2">
              <h5 className="mb-3 fs-4" style={{ color: "#1B4965" }}>
                We bring the fun in intelligence way!
              </h5>
              <p style={{ color: "var(--color-364149)" }}>
                by chatbot you can ask about everything and cover all the small
                – Trust Zone has all the places you want to go!.
              </p>
              <Link to="/chatbot" className="small-b-ll">
                Go to chatbot
              </Link>
              <GrLinkNext
                className="grlink"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  color: "rgb(123 199 198)",
                }}
              />
            </div>
          </div>
        </div>
      </Container>

      <div
        className="py-5"
        style={{
          marginBottom: "8%",
          backgroundColor: "#f8f9fa",
          padding: "4rem 0",
        }}
      >
        <Container>
          <div className="text-center mb-5">
            <h2
              className="display-5 fw-bold"
              style={{
                color: "#1B4965",
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Upcoming events
            </h2>
            <p
              className="text-muted"
              style={{
                fontSize: "1.25rem",
                lineHeight: "1.6",
              }}
            >
              Let's make a happy event with us care for love.
            </p>
          </div>

          <Row className="g-4">
            {loading ? (
              <div className="text-center">
                <p className="text-muted">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-muted">{error}</p>
              </div>
            ) : displayedEvents.length === 0 ? (
              <div className="text-center">
                <p className="text-muted">
                  No events found matching your search.
                </p>
              </div>
            ) : (
              displayedEvents.map((event, index) => (
                <EventCard key={index} event={event} index={index} />
              ))
            )}
          </Row>

          {visibleEvents < filteredEvents.length && (
            <div className="text-center mt-5">
              <button
                onClick={handleViewMore}
                className="small-b-l"
                style={{
                  color: "#1B4965",
                  textDecoration: "none",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "0.5rem 1rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = "underline";
                  e.target.style.color = "#0A3D62";
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = "none";
                  e.target.style.color = "#1B4965";
                }}
              >
                View more →
              </button>
            </div>
          )}
        </Container>
      </div>

      <style jsx>{`
        .hover-effect:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }

        .shadow-hover:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .feature:hover {
          transform: translateY(-5px);
        }

        .small-banner {
          overflow: hidden;
          border-radius: 1rem;
        }

        .small-banner img {
          transition: transform 0.3s ease;
        }

        .small-banner:hover img {
          transform: scale(1.05);
        }

        .glass_hover {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.6)
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .small-banner:hover .glass_hover {
          opacity: 1;
        }

        .small-banner-content {
          bottom: 1rem;
          left: 1rem;
          z-index: 2;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .feature:hover h2 span {
          transform: scaleX(1);
        }

        .feature {
          position: relative;
          overflow: hidden;
        }

        .feature::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #1b4965, #66a09f);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .feature:hover::after {
          transform: scaleX(1);
        }
      `}</style>
    </>
  );
}

export default Home;
