import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaRobot,
} from "react-icons/fa";
import "./BottomNav.css";
import { IoIosChatboxes } from "react-icons/io";
import { MdFavoriteBorder } from "react-icons/md";

const BottomNav = () => (
  <nav className="bottom-nav">
    <NavLink
      to="/"
      className={({ isActive }) => "nav-icon" + (isActive ? " active" : "")}
      end
    >
      <FaHome />
    </NavLink>
    <NavLink
      to="/map"
      className={({ isActive }) => "nav-icon" + (isActive ? " active" : "")}
    >
      <FaMapMarkerAlt />
    </NavLink>
    <NavLink
      to="/favorite-places"
      className={({ isActive }) => "nav-icon" + (isActive ? " active" : "")}
    >
      <MdFavoriteBorder />
    </NavLink>
   
    <NavLink
      to="/chat"
      className={({ isActive }) => "nav-icon" + (isActive ? " active" : "")}
    >
      <IoIosChatboxes />
    </NavLink>
  </nav>
);

export default BottomNav;
