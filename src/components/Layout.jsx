import React from "react";
import { Link } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import "../App.css";

const Layout = () => {
  const location = useLocation();
  const authPages = ["/login", "/signup", "/forgotpassword", "/resetpassword"];
  const isAuthPage = authPages.includes(location.pathname);
  const isHomePage = location.pathname === "/";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className="layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Header />

      <main
        className={`main ${isAuthPage ? "auth-bg" : ""}`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isHomePage && (
          <motion.div
            className="hero-section position-relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              className="hero-bg"
              src="images/cd49755cf56effca9bf87d3369813229.jpg"
              alt="TrustZone Cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              className="hero-content position-absolute"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span
                className="badge badge-trustzone mb-3"
                variants={itemVariants}
              >
                TrustZone
              </motion.span>
              <motion.h1 className="hero-title mb-3" variants={itemVariants}>
                Welcome to TrustZone
              </motion.h1>
              <motion.p className="hero-subtitle mb-4" variants={itemVariants}>
                Discover and share accessible places for everyone.
              </motion.p>
              <motion.div className="hero-buttons" variants={itemVariants}>
                <Link to="/map" className="btn btn-primary me-2">
                  Explore Map
                </Link>
                <Link to="/signup" className="btn btn-light">
                  Join Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BottomNav />
    </motion.div>
  );
};

export default Layout;
