import React from "react";
import partiallyAccessibleIconSVG from "/images/partiallyAccessible.svg";
import accessibleIconSVG from "/images/accessible.svg";
import notAccessibleIconSVG from "/images/notAccessible.svg";

const MapMissionGuide = () => {
  return (
    <>
      {/* Hero Section */}
      <div
        className="container-fluid text-white py-5"
        style={{
          backgroundColor: "#1B4965",
          backgroundImage:
            'url("https://via.placeholder.com/1200x400?text=Hero+Image")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "400px",
          position: "relative",
        }}
      >
        <div className="container text-center py-5" >
          <h1 className="display-3 fw-bold">MapMission Guide</h1>
          <hr className="w-25 mx-auto border-2 border-white" />
          <p className="lead mt-3" style={{ fontSize: '1rem', fontWeight: 'bold',color:'#22c55e'}}>
            OFFICIAL WALKTHROUGH
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container-fluid bg-light py-4">
        <div className="container">
          <ul
            className="nav nav-tabs justify-content-center"
            id="mapMissionTabs"
            role="tablist"
          >
            <li className="nav-item">
              <a
                className="nav-link"
                id="get-started-tab"
                data-bs-toggle="tab"
                href="#get-started"
                role="tab"
              >
                GET STARTED
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="definitions-tab"
                data-bs-toggle="tab"
                href="#definitions"
                role="tab"
              >
                DEFINITIONS
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link active"
                id="reviews-tab"
                data-bs-toggle="tab"
                href="#reviews"
                role="tab"
              >
                REVIEWS
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="register-tab"
                data-bs-toggle="tab"
                href="#register"
                role="tab"
              >
                REGISTER
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="support-tab"
                data-bs-toggle="tab"
                href="#support"
                role="tab"
              >
                SUPPORT
              </a>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content mt-5" id="mapMissionTabContent">
            <div className="tab-pane fade" id="get-started" role="tabpanel">
              <h2>Get Started</h2>
              <p>
                Download the AccessNow app to start mapping accessibility in
                your community. Plan your MapMission by choosing a location and
                gathering a team of volunteers.
              </p>
            </div>

            <div className="tab-pane fade" id="definitions" role="tabpanel">
              <div className="text-center mb-5">
                <h2 className="fw-bold">Accessibility Definitions</h2>
                <p className="text-muted">
                  Accessibility means different things to different people.
                  <br />
                  Here are some general guidelines to help you rank your
                  ratings.
                </p>
              </div>
              <div className="row text-center">
                <div className="col-md-4 mb-4">
                  <div
                    className="accessibility-icon"
                    style={{ height: "60px", marginBottom: "1rem" }}
                  >
                    <img
                      src={accessibleIconSVG}
                      alt="Accessible location"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <h3 className="mt-3 fw-bold" style={{ color: "#28A745" }}>
                    Accessible
                  </h3>
                  <p className="text-muted">
                    A green pin on our map represents an accessible location.
                    These are places without barriers. Experiences may vary from
                    person to person but we generally say that accessible places
                    are those that you can get in with ease, and party no
                    problem.
                  </p>
                </div>
                <div className="col-md-4 mb-4">
                  <div
                    className="accessibility-icon"
                    style={{ height: "60px", marginBottom: "1rem" }}
                  >
                    <img
                      src={partiallyAccessibleIconSVG}
                      alt="Partially accessible location"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <h3 className="mt-3 fw-bold" style={{ color: "#EDB106" }}>
                    Partially Accessible
                  </h3>
                  <p className="text-muted">
                    A yellow pin on our map represents a location that is
                    partially accessible. Yellow locations often have
                    alternative entrances or limited access within the space,
                    such as steps inside or narrow hallways. Not everything
                    about these places is barrier-free.
                  </p>
                </div>
                <div className="col-md-4 mb-4">
                  <div
                    className="accessibility-icon"
                    style={{ height: "60px", marginBottom: "1rem" }}
                  >
                    <img
                      src={notAccessibleIconSVG}
                      alt="Not accessible location"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <h3 className="mt-3 fw-bold" style={{ color: "#B5000D" }}>
                    Not Accessible
                  </h3>
                  <p className="text-muted">
                    A red pin on our map represents a location that is not
                    accessible. Find a red pin on our map? Help spread the word
                    on social media and let's make change happen. The more we
                    raise awareness about issues, the closer we are to breaking
                    barriers.
                  </p>
                </div>
              </div>
            </div>

            {/* Updated Reviews Tab */}
            <div
              className="tab-pane fade show active"
              id="reviews"
              role="tabpanel"
            >
              <div className="text-center mb-5">
                <h2 className="fw-bold">How To Add A Review</h2>
                <p className="text-muted">
                  There are lots of ways you can share helpful information on
                  AccessNow app
                </p>
              </div>
              <div className="row align-items-center">
                {/* Left Side: Image */}
                <div className="col-md-4 mb-4">
                  <img
                    src="https://via.placeholder.com/300x400?text=Building+Image"
                    alt="Building with accessibility features"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                  />
                </div>
                {/* Right Side: Review Steps */}
                <div className="col-md-8">
                  <div className="mb-4 p-4 bg-white rounded shadow-sm">
                    <div className="d-flex align-items-center mb-2">
                      <div
                        style={{
                          fontSize: "2rem",
                          color: "#1a3c6d",
                          marginRight: "1rem",
                        }}
                      >
                        <span role="img" aria-label="Rating Icon">
                          ⭐
                        </span>
                      </div>
                      <h4 className="fw-bold mb-0">ADD A RATING</h4>
                    </div>
                    <p className="text-muted">
                      Select the most appropriate level of accessibility of the
                      location: Accessible, Partially Accessible, or Not
                      Accessible. Remember, you are rating based on your
                      understanding.
                    </p>
                  </div>

                  <div className="mb-4 p-4 bg-white rounded shadow-sm">
                    <div className="d-flex align-items-center mb-2">
                      <div
                        style={{
                          fontSize: "2rem",
                          color: "#1a3c6d",
                          marginRight: "1rem",
                        }}
                      >
                        <span role="img" aria-label="Tags Icon">
                          🏷️
                        </span>
                      </div>
                      <h4 className="fw-bold mb-0">SELECT TAGS</h4>
                    </div>
                    <p className="text-muted">
                      Take note of the accessibility features you see and select
                      all the tags applicable to the specific location you are
                      rating such as accessible washroom, ramp, automatic door.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .accessibility-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .accessibility-icon:hover {
          transform: scale(1.1);
        }

        .nav-tabs .nav-link {
          color: #1a3c6d;
          font-weight: 500;
          padding: 1rem 2rem;
          border: none;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-tabs .nav-link:hover {
          border-bottom: 3px solid #1a3c6d;
          background-color: rgba(26, 60, 109, 0.1);
        }

        .nav-tabs .nav-link.active {
          color: #1a3c6d;
          border-bottom: 3px solid #1a3c6d;
          background-color: rgba(26, 60, 109, 0.1);
        }

        .shadow-sm {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        .shadow {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default MapMissionGuide;
