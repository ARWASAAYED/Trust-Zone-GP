// About.jsx
import React from 'react';
const teamMembers = [
    { name: 'Maayan Goldstein', role: 'Chief Scientist', image: '/images/profile.png' },
    { name: 'Jonathan Marriott', role: 'Partnerships', image: '/images/profile.png' },
    { name: 'Keren Golan', role: 'Operations', image: '/images/profile.png' },
    { name: 'Brad Brohman', role: 'Business Development', image: '/images/profile.png' },
    { name: 'Robin Koczerginski', role: 'Community Programs', image: '/images/profile.png' },
    { name: 'Talia Ziv', role: 'Product Design', image: '/images/profile.png' },
    { name: 'Helen Law', role: 'Software Engineering', image: '/images/profile.png' },
  ];
const About = () => {
  return (
    <div>
      {/* Header Section */}
      <div className="header-bg text-center">
        <p className="welcome-text">WELCOME TO FOUNDATION</p>
        <h1 className="display-4">About Foundation</h1>
      </div>

      {/* Main Content Section */}
      <div className="container my-5">
        <div className="row">
          {/* Image Section */}
          <div className="col-md-6">
            <img
              src="/images/main-background2.jpg" 
              alt="Caregiver and patient"
              className="img-fluid rounded"
            />
            <div className="founder-section">
              <img
                src="/images/profile.png" 
                alt="Helena Gomez"
                className="founder-img"
              />
              <div>
                <p className="text ">Helena Gomez</p>
                <p className="text2">Founder</p>
              </div>
            </div>
          </div>
          {/* Text Section */}
          <div className="col-md-6">
            <p className="story-text">OUR STORY</p>
            <h2>At first we struggled.</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent quam vulputate dignissim
              suspendisse in est ante in. Vitae aliquet nec ullamcorper sit amet. Odio tempor
              orci dapibus ultrices in iaculis nunc. Orci phasellus egestas tellus rutrum tellus
              pellentesque eu. Suspendisse adipiscing ultricies est ultricies integer quis auctor non
              risus. Quis risus sed vulputate odio ut.
            </p>
            <p>
              Ac tincidunt vitae semper quis lectus nulla at volutpat diam ut. Laoreet
              suspendisse interdum consectetur libero id faucibus. Risus nec feugiat in
              fermentum posuere urna nec tincidunt.
            </p>
            <p>
              Lectus nulla at volutpat diam ut venenatis tellus. Vitae congue eu consequat ac
              felis donec et odio pellentesque. Neque vitae tempus quam pellentesque nec
              nam aliquam sem. Posuere morbi leo urna molestie at elementum eu.
            </p>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="container my-5" >

        <div className="row" style={{marginBottom:'300px',marginTop:'200px'}}>
          <div className="col-md-6">
            <h2 className="mission-title">Our Mission</h2>
            <p className="mission-text">
              Together, we’re changing the way the world thinks about accessibility and making the world a more sociable place for all.
            </p>
          </div>
          <div className="col-md-6">
            <div className="mission-box">
              <ul className="mission-list">
                <li>To organise all the world’s accessibility information</li>
                <li>To give peace of mind to disabled people everywhere</li>
                <li>To help accessible businesses shine bright</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container my-5 team-section">
        <div className="row">
        <h2 className="team-title" style={{fontSize:'50px', marginLeft:'40px', marginBottom:'60px', color:'#1B4965'}}>Meet Our Team</h2>
          {teamMembers.map((member, index) => (
            <div key={index} className="col-md-3 col-sm-6 text-center mb-4">
              <img
                src={member.image}
                alt={member.name}
                className="team-img rounded-circle mb-3"
              />
              <h5 className="team-name">{member.name}</h5>
              <p className="team-role text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    
  );
};

export default About;