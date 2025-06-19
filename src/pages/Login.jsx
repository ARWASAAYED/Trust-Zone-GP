import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Container from "../components/Container";
import CustomInput from "../components/CustomInput";
import apiClient from "../api/apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific validation errors
  const [apiError, setApiError] = useState(""); // For API errors (below form)
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track form submission

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBlur = (e) => {
    // No validation on blur; errors will only show on submit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Set to true on submit
    setFieldErrors({});
    setApiError("");
    setIsLoading(true);

    // Validate required fields
    let fieldErrorsTemp = {};

    if (!formData.email) {
      fieldErrorsTemp.email = "Please enter your email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        fieldErrorsTemp.email = "Please enter a valid email address";
      }
    }

    if (!formData.password) {
      fieldErrorsTemp.password = "Please enter your password";
    }

    // If there are validation errors, set them and stop submission
    if (Object.keys(fieldErrorsTemp).length > 0) {
      setFieldErrors(fieldErrorsTemp);
      setIsLoading(false);
      return;
    }

    try {
      // Send login request to the API
      const response = await apiClient.post("/User/login", {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      // Store the JWT token in localStorage
      const token = response.data.token;
      if (!token) {
        throw new Error("No token received from the server");
      }
      localStorage.setItem("token", token);

      toast.success("Successfully Logged In");
      setTimeout(() => {
        navigate("/"); // Redirect to home or a protected route
      }, 2000);
    } catch (err) {
      let errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setApiError(errorMessage);
      toast.error("Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset isSubmitted and fieldErrors when form values change
  useEffect(() => {
    setIsSubmitted(false);
    setFieldErrors({});
  }, [formData]);

  return (
    <>
      <Container class1="login-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <div className="auth-card">
              <h3 className="mb-3">Log In</h3>
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-15">
                <CustomInput
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={isSubmitted && fieldErrors.email}
                />
                <CustomInput
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={isSubmitted && fieldErrors.password}
                />
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    className="form-check-input"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="rememberMe" className="form-check-label">
                    Remember Me
                  </label>
                </div>
                <div className="d-flex justify-content-end gap-15">
                  <Link to="/forgotpassword" className="mb-0" style={{ textDecoration: "none" }}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="d-flex justify-content-center flex-column align-items-center gap-15">
                  <button className="button bo" disabled={isLoading}>
                    {isLoading ? "Logging In..." : "Log In"}
                  </button>
                  <Link to="/signup" className="li" style={{ textDecoration: "none" }}>
                    Don’t have an account? Sign up
                  </Link>
                </div>
                {apiError && (
                  <div className="text-danger text-center mt-3" style={{ fontSize: "0.9rem" }}>
                    {apiError}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </Container>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default Login;