import { useState, useEffect, useRef } from "react";
import { RiUserCommunityLine } from "react-icons/ri";
import { TbMessageChatbot } from "react-icons/tb";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { IoIosChatboxes } from "react-icons/io";
import { FaUserCircle, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Dropdown, Button } from "react-bootstrap";
import apiClient from "../api/apiClient";

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarFocused, setSearchBarFocused] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    // Reset animation state
    setAnimate(false);
    // Trigger animation after a small delay
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoading(true);
      apiClient
        .get("/UserProfile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response && response.data) {
            setUser({
              userName: response.data.userName || "username",
              email: response.data.email || "user123@gmail.com",
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
          setLoading(false);
        });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = !!user;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Header Upper */}
      <header className="header-upper py-3">
        <div className="container-xxl">
          <div className="d-flex align-items-center justify-content-between">
            {/* Hamburger menu for mobile */}
            <div
              className={`d-lg-none ${
                animate
                  ? "animate__animated animate__fadeInLeft animate__faster"
                  : ""
              }`}
            >
              <Button
                variant="link"
                className="p-0 me-2"
                style={{ color: "#fff", fontSize: 28 }}
                onClick={() => setShowMobileMenu((v) => !v)}
                aria-label="Open navigation menu"
              >
                <FaBars />
              </Button>
              {/* Dropdown menu */}
              {showMobileMenu && (
                <div
                  ref={menuRef}
                  style={{
                    position: "absolute",
                    top: 60,
                    left: 16,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    zIndex: 2000,
                    minWidth: 180,
                  }}
                >
                  <ul className="list-unstyled mb-0 p-2">
                    <li>
                      <NavLink
                        to="/"
                        className={({ isActive }) =>
                          "dropdown-item" + (isActive ? " active" : "")
                        }
                        onClick={() => setShowMobileMenu(false)}
                        style={{ color: "#333" }}
                      >
                        Home
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/map"
                        className={({ isActive }) =>
                          "dropdown-item" + (isActive ? " active" : "")
                        }
                        onClick={() => setShowMobileMenu(false)}
                        style={{ color: "#333" }}
                      >
                        Explore
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/category?categoryId=1"
                        className={({ isActive }) =>
                          "dropdown-item" + (isActive ? " active" : "")
                        }
                        onClick={() => setShowMobileMenu(false)}
                        style={{ color: "#333" }}
                      >
                        Categories
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/events"
                        className={({ isActive }) =>
                          "dropdown-item" + (isActive ? " active" : "")
                        }
                        onClick={() => setShowMobileMenu(false)}
                        style={{ color: "#333" }}
                      >
                        Events
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/about"
                        className={({ isActive }) =>
                          "dropdown-item" + (isActive ? " active" : "")
                        }
                        onClick={() => setShowMobileMenu(false)}
                        style={{ color: "#333" }}
                      >
                        About
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                          "dropdown-item" + (isActive ? " active" : "")
                        }
                        onClick={() => setShowMobileMenu(false)}
                        style={{ color: "#333" }}
                      >
                        Contact
                      </NavLink>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* Logo */}
            <Link
              className={`navbar-brand d-flex align-items-center mx-auto mx-lg-0 ${
                animate ? "animate__animated animate__zoomIn" : ""
              }`}
              to="/"
            >
              <img
                src="/images/Group 1329.png"
                style={{ width: "70px" }}
                alt="Logo"
              />
            </Link>
            {/* Profile avatar on mobile */}
            <div
              className={`d-lg-none ${
                animate
                  ? "animate__animated animate__fadeInRight animate__faster"
                  : ""
              }`}
            >
              {loading ? (
                <span className="ms-2" style={{ color: "#fff" }}>
                  ...
                </span>
              ) : isAuthenticated ? (
                <Button
                  variant="link"
                  className="p-0 ms-2"
                  style={{ borderRadius: "50%", overflow: "hidden" }}
                  onClick={() => navigate("/profile")}
                  aria-label="Profile"
                >
                  <FaUserCircle size={38} style={{ color: "#fff" }} />
                </Button>
              ) : (
                <Button
                  variant="link"
                  className="p-0 ms-2"
                  onClick={() => navigate("/login")}
                  aria-label="Login"
                >
                  <FaUserCircle size={38} style={{ color: "#fff" }} />
                </Button>
              )}
            </div>
            {/* Desktop quick links and profile */}
            <div
              className={`d-none d-lg-flex align-items-center flex-grow-1 justify-content-end ${
                animate ? "animate__animated animate__fadeIn" : ""
              }`}
              style={{ color: "#fff" }}
            >
              {/* Search Bar */}
              <form
                className={`d-flex mx-4 flex-grow-1 justify-content-center ${
                  animate
                    ? "animate__animated animate__fadeIn animate__delay-1s"
                    : ""
                }`}
                role="search"
                style={{ maxWidth: "700px", flexGrow: 2 }}
                onSubmit={handleSearch}
              >
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Search Place Here..."
                  aria-label="Search Place Here..."
                  style={{
                    minWidth: 0,
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: `2px solid #fff${
                      searchBarFocused ? "var(--color-BEE9E8)" : "#ccc"
                    }`,
                    transition: "border-color 0.3s",
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchBarFocused(true)}
                  onBlur={() => setSearchBarFocused(false)}
                />
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    padding: "0 16px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BsSearch style={{ color: "#fff", fontSize: 24 }} />
                </button>
              </form>
              <Link
                to="/community"
                className={`nav-link d-flex align-items-center gap-2 ${
                  animate
                    ? "animate__animated animate__fadeIn animate__delay-1s"
                    : ""
                }`}
                style={{ color: "#fff", marginRight: "23px" }}
              >
                <RiUserCommunityLine style={{ fontSize: 28, color: "#fff" }} />
                <span style={{ color: "#fff" }}>Community</span>
              </Link>

              <Link
                to="/chat"
                className={`nav-link d-flex align-items-center gap-2 ${
                  animate
                    ? "animate__animated animate__fadeIn animate__delay-1s"
                    : ""
                }`}
                style={{ color: "#fff", marginRight: "30px" }}
              >
                <IoIosChatboxes style={{ fontSize: 28, color: "#fff" }} />
                <span style={{ color: "#fff" }}>Chat</span>
              </Link>
              {loading ? (
                <span className="ms-2" style={{ color: "#fff" }}>
                  ...
                </span>
              ) : isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-user"
                    className="p-0"
                    style={{ color: "#fff" }}
                  >
                    <FaUserCircle size={28} style={{ color: "#fff" }} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      as="div"
                      className="d-flex align-items-center px-3 py-2 text-muted"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <FaUser
                        className="me-2"
                        style={{ color: "#000", fontSize: "1.2rem" }}
                      />
                      <div>
                        <p className="mb-0 fw-bold">{user?.userName}</p>
                        <small>{user?.email}</small>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => navigate("/profile")}>
                      <FaUser
                        className="me-2"
                        style={{ color: "black", fontSize: "1.2rem" }}
                      />
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="text-danger"
                    >
                      <FaSignOutAlt
                        className="me-2"
                        style={{ color: "#dc3545", fontSize: "1.2rem" }}
                      />
                      Sign Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => navigate("/login")}
                  style={{ color: "#fff" }}
                >
                  <FaUserCircle size={28} style={{ color: "#fff" }} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Header Bottom (Navigation) - keep as before, or remove for mobile if not needed */}
      <header
        className={`header-bottom py-2 d-none d-lg-block ${
          animate ? "animate__animated animate__fadeInUp animate__delay-1s" : ""
        }`}
      >
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <div className="menu-bottom d-flex align-items-center gap-30">
                <div className="dropdown">
                  <button
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    className="btn btn-secondary dropdown-toggle bg-transparent border-0 gap-2 d-flex align-items-center"
                  >
                    <img
                      src="images/menu.svg"
                      alt="menu icon"
                      className="me-2"
                    />
                    <span className="fs-6 d-inline-block">Categories</span>
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton1"
                  >
                    <li>
                      <Link
                        to="/category?categoryId=1"
                        className="dropdown-item"
                      >
                        Restaurants
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/category?categoryId=5"
                        className="dropdown-item"
                      >
                        Entertainments
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/category?categoryId=3"
                        className="dropdown-item"
                      >
                        Government
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/category?categoryId=9"
                        className="dropdown-item"
                      >
                        Healthcare
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/category?categoryId=9"
                        className="dropdown-item"
                      >
                        Shopping
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/category?categoryId=7"
                        className="dropdown-item"
                      >
                        Fitness
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="menu-links">
                  <div className="d-flex align-items-center gap-15">
                    <NavLink to="/" className="nav-link">
                      Home
                    </NavLink>
                    <NavLink to="/map" className="nav-link">
                      Explore
                    </NavLink>
                    <NavLink to="/blogs" className="nav-link">
                      Blogs
                    </NavLink>
                    <NavLink to="/events" className="nav-link">
                      Events
                    </NavLink>
                    <NavLink to="/about" className="nav-link">
                      About
                    </NavLink>
                    <NavLink to="/contact" className="nav-link">
                      Contact
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
