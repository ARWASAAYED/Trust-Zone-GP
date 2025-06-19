// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgotpassword from "./pages/Forgotpassword";
import Resetpassword from "./pages/Resetpassword";
import Home from "./pages/Home";
import MainLayout from "./components/MainLayout";
import Chatbot from "./pages/Chatbot";
import About from "./pages/About";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import MapMissionGuide from "./pages/MapMissionGuide";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Blogs from "./pages/Blogs";
import BlogDetails from "./pages/BlogDetails";
import Map from "./pages/Map";
import AccessibilityFeatures from "./pages/AccessibilityFeatures";
import ErrorBoundary from "./components/ErrorBoundary";
import CategoryPlaces from "./pages/CategoryPlaces";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ReviewerProfile from "./pages/ReviewerProfile";
import FavoritePlaces from "./pages/FavoritePlaces";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/category" element={<CategoryPlaces />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgotpassword" element={<Forgotpassword />} />
          <Route path="resetpassword" element={<Resetpassword />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="chat" element={<Chat />} />

          <Route
            path="/map"
            element={
              <ErrorBoundary>
                <Map />
              </ErrorBoundary>
            }
          />
          <Route path="about" element={<About />} />
          <Route path="community" element={<Community />} />
          <Route path="mapmissionguide" element={<MapMissionGuide />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />

          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogDetails />} />
          <Route path="feature" element={<AccessibilityFeatures />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route
            path="reviewer-profile/:userId"
            element={<ReviewerProfile />}
          />
          <Route path="/favorite-places" element={<FavoritePlaces />} />

          <Route path="contact" element={<Contact />} />
          <Route path="FAQ" element={<FAQ />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
