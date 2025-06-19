import { Link } from "react-router-dom";
import { BsLinkedin, BsGithub, BsYoutube, BsInstagram } from "react-icons/bs";
function Footer() {
  return (
    <>
      <footer className="py-4">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-12 col-sm-12 mb-md-3 mb-sm-3">
              <div className="footer-top-data d-flex gap-30 align-items-center justify-content-center justify-content-lg-start">
                <img src="images/newsletter.png" alt="newsletter" />
                <h2 className="mb-0 text-white">Sign Up for Newsletter</h2>
              </div>
            </div>
            <div className="col-lg-7 col-md-12 col-sm-12">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control py-1"
                  placeholder="Your Email Address"
                  aria-label="Your Email Address"
                  aria-describedby="basic-addon2"
                />
                <span className="input-group-text p-2" id="basic-addon2">
                  Subscribe
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <footer className="py-4">
        <div className="container-xxl">
          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-12 mb-4 mb-md-0">
              <h4 className="text-white mb-4">Contact Us</h4>
              <div>
                <address className="text-white fs-6">
                  Ho: 277 New Cairo, <br />
                  Sss, Hhhh <br />
                  PinCode: 131103
                </address>
                <a
                  href="tel:+0123456789"
                  className="mt-3 d-block mb-1 text-white"
                >
                  +0123456789
                </a>
                <a
                  href="mailto:arwa@gmail.com"
                  className="mt-2 d-block mb-0 text-white"
                >
                  arwa@gmail.com
                </a>
                <div className="social-icons d-flex align-items-center gap-30 mt-4">
                  <a
                    className="text-white"
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsLinkedin className="fs-4" />
                  </a>
                  <a
                    className="text-white"
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsInstagram className="fs-4" />
                  </a>
                  <a
                    className="text-white"
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsGithub className="fs-4" />
                  </a>
                  <a
                    className="text-white"
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsYoutube className="fs-4" />
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4 mb-md-0">
              <h4 className="text-white mb-4">Information</h4>
              <div className="footer-link d-flex flex-column">
                <Link className="text-white py-2 mb-1" to="/privacypolicy">
                  Privacy Policy
                </Link>
                <Link className="text-white py-2 mb-1" to="/refundpolicy">
                  Refund Policy
                </Link>
                <Link className="text-white py-2 mb-1" to="/shippingpolicy">
                  Shipping Policy
                </Link>
                <Link className="text-white py-2 mb-1" to="/termsconditions">
                  Terms & Conditions
                </Link>
                <Link className="text-white py-2 mb-1" to="/blogs">
                  Blogs
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-12 mb-4 mb-md-0">
              <h4 className="text-white mb-4">Account</h4>
              <div className="footer-link d-flex flex-column">
                <Link className="text-white py-2 mb-1" to="/about-us">
                  About Us
                </Link>
                <Link className="text-white py-2 mb-1" to="/faqs">
                  FAQs
                </Link>
                <Link className="text-white py-2 mb-1" to="/contact">
                  Contact
                </Link>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 col-sm-12 mb-4 mb-md-0">
              <h4 className="text-white mb-4">Quick Links</h4>
              <div className="footer-link d-flex flex-column">
                <Link className="text-white py-2 mb-1" to="/events">
                  Events
                </Link>
                <Link className="text-white py-2 mb-1" to="/chat">
                chat
                </Link>
                <Link className="text-white py-2 mb-1" to="/map">
                  map
                </Link>

              </div>
            </div>
          </div>
        </div>
      </footer>

      <footer className="py-4">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <p className="text-center mb-0 text-white">
                &copy; {new Date().getFullYear()} Powered by Trust Zone
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
