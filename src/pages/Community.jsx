import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaTags, FaBookmark } from "react-icons/fa";
import { GrLinkNext } from "react-icons/gr";
import { PiShootingStarBold } from "react-icons/pi";
import { GrLocationPin } from "react-icons/gr";
import { BsStars } from "react-icons/bs";
import {
  Row,
  Col,
  Card,
  Button,
  Container,
  InputGroup,
  Form,
} from "react-bootstrap";
import EventCard from "../components/EventCard";

const phoneImages = [
  "/images/phone4.avif",
  "/images/phone5.avif",
  "/images/phone6.avif",
];

function Community() {
  const [currentImage, setCurrentImage] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [volunteerFilter, setVolunteerFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % phoneImages.length);
    }, 3000);
    return () => clearInterval(interval);
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          text: newMessage,
          sender: "You",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setNewMessage("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thanks for sharing! That's really helpful.",
            sender: "Community Member",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }, 1000);
    }
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

  const volunteerOpportunities = [
    {
      title: "Map Ambassador",
      description:
        "Lead mapping initiatives in your local area to improve accessibility data.",
      category: "Mapping",
    },
    {
      title: "Event Organizer",
      description:
        "Help organize educational events and workshops for accessibility awareness.",
      category: "Education",
    },
    {
      title: "Community Advocate",
      description:
        "Engage with local communities to promote accessibility and inclusion.",
      category: "Engagement",
    },
  ];

  const successStories = [
    {
      author: "@accessmapper",
      story:
        "Thanks to AccessNow, I mapped 50+ accessible locations in my city, helping hundreds of people navigate with ease!",
    },
    {
      author: "@inclusiveleader",
      story:
        "The AccessStudio seminar inspired me to redesign my business space to be fully accessible—such a rewarding experience!",
    },
    {
      author: "@communityhero",
      story:
        "Volunteering as a Map Ambassador opened my eyes to the importance of accessibility. I’m proud to contribute to this global mission.",
    },
  ];

  const filteredVolunteerOpportunities = volunteerOpportunities.filter(
    (opportunity) =>
      volunteerFilter === "All" || opportunity.category === volunteerFilter
  );

  return (
    <>
      {/* Header Section */}
      <div className="header-bg text-center" style={{margin:'0%', backgroundColor: '#1B4965', color: 'white', padding: '120px 0', borderRadius:'0px 0px 25px 25px'}}>
        <p className="welcome-text" style={{ fontSize: '1rem', fontWeight: 'bold', textAlign: 'start', marginLeft:'160px', marginBottom:'-3px'}}>WELCOME TO</p>
        <h1 className="display-4" style={{ fontSize: '3rem', fontWeight: 'bolder', textAlign: 'start', marginLeft:'160px'}}>Community</h1>
      </div>


      {/* Mapping Mission */}
      <Container className=" py-5 d-flex flex-column flex-lg-row align-items-center gap-5">
        <div className="row" style={{ marginBottom: "12%" }}>
          <div className="col-lg-6">
            <div
              className="d-flex flex-column gap-5"
              style={{ marginLeft: "22%" }}
            >
              <h2
                className=" ms-2 "
                style={{ color: "#1B4965", marginBottom: "-10px" }}
              >
                Join a Mapping Day!
              </h2>
              <div className="d-flex align-items-center ">
                <PiShootingStarBold
                  className="ms-4 p-1"
                  style={{
                    color: "#1B4965",
                    background: "var(--color-BEE9E8)",
                    borderRadius: "15px",
                    fontSize: "30px",
                  }}
                />
                <p className="mb-0 fs-5 ps-3" style={{ color: "#1B4965" }}>
                  Meet like-minded people in the disabled community and know the
                  Sociability team
                </p>
              </div>
              <div className="d-flex align-items-center">
                <GrLocationPin
                  className="ms-4 p-1"
                  style={{
                    color: "#1B4965",
                    background: "var(--color-BEE9E8)",
                    borderRadius: "15px",
                    fontSize: "30px",
                  }}
                />
                <p className="mb-0 fs-5 ps-3" style={{ color: "#1B4965" }}>
                  Explore and map the accessibility of venues in your local area
                </p>
              </div>
              <div className="d-flex align-items-center ">
                <BsStars
                  className="ms-4 p-1"
                  style={{
                    color: "#1B4965",
                    background: "var(--color-BEE9E8)",
                    borderRadius: "15px",
                    fontSize: "30px",
                  }}
                />
                <p className="mb-0 fs-5 ps-3" style={{ color: "#1B4965" }}>
                  Bring people together to rate places in real-time on the Trust
                  Zone
                </p>
              </div>
            </div>
            <a
              href="./mapmissionguide"
              className="button mt-4"
              style={{ marginLeft: "26%" }}
            >
              MAPMISSION GUIDE
            </a>
          </div>
          <div className="col-lg-6">
            <img
              src="images/d3636a529ce3ed32f947733573c45772.jpg"
              alt="Sociability community members on a mapping day"
              className="img-fluid rounded"
              style={{ width: "80%", marginTop: "10%", paddingLeft: "9%" }}
            />
          </div>
        </div>
      </Container>

      {/* Footer Section */}
      <div
        className="Footer-bg text-center"
        style={{
          marginTop: "13.1%",
          marginBottom: "-4.5%",
          backgroundColor: "#1B4965",
          color: "white",
          padding: "100px 0",
          borderRadius: "25px 25px 0px 0px",
        }}
      >
        <h1
          className="display-4"
          style={{
            fontSize: "3rem",
            fontWeight: "bolder",
            textAlign: "center",
            marginLeft: "40px",
          }}
        >
          Join our mission. Get Started Today
        </h1>
        <div style={{ marginTop: "40px" }}>
          <Link
            to="/map"
            className="button bo"
            style={{
              backgroundColor: "var(--color-bf480b)",
              marginRight: "40px",
            }}
          >
            ADD A NEW REVIEW
          </Link>
          <Link
            to="/blogs"
            className="button bo"
            style={{ backgroundColor: "var(--color-BEE9E8)", color: "#1B4965" }}
          >
            EXPLORE THE BLOG
          </Link>
        </div>
      </div>
    </>
  );
}

export default Community;
