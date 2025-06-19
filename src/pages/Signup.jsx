import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CustomInput from "../components/CustomInput";
import apiClient from "../api/apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    disabilityType: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific validation errors
  const [apiError, setApiError] = useState(""); // For API errors (below form)
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track form submission

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    if (!formData.name) {
      fieldErrorsTemp.name = "Please enter your name";
    }

    if (!formData.email) {
      fieldErrorsTemp.email = "Please enter your email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        fieldErrorsTemp.email = "Please enter a valid email address";
      }
    }

    if (!formData.age) {
      fieldErrorsTemp.age = "Please enter your age";
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age <= 0) {
        fieldErrorsTemp.age = "Please enter a valid age";
      } else if (age < 18) {
        fieldErrorsTemp.age = "You must be at least 18 years old to sign up";
      } else if (age > 120) {
        fieldErrorsTemp.age = "Please enter a realistic age (less than 120)";
      }
    }

    if (!formData.disabilityType) {
      fieldErrorsTemp.disabilityType = "Please select a disability type";
    }

    if (!formData.password) {
      fieldErrorsTemp.password = "Please enter your password";
    } else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        fieldErrorsTemp.password = "Password must be at least 8 characters long, with 1 uppercase letter and 1 number";
      }
    }

    if (!formData.confirmPassword) {
      fieldErrorsTemp.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      fieldErrorsTemp.confirmPassword = "Passwords do not match";
    }

    // If there are validation errors, set them and stop submission
    if (Object.keys(fieldErrorsTemp).length > 0) {
      setFieldErrors(fieldErrorsTemp);
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userName: formData.name,
        age: parseInt(formData.age),
        disabilityTypeId: getDisabilityTypeId(formData.disabilityType),
      };
      
      console.log("Request Payload:", payload);
      
      const response = await apiClient.post("/User/register-user", payload);
      
      console.log("API Response:", response.data);
      
      toast.success("Successfully Registered");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("API Error Full Response:", err.response);
      
      let errorMessage = "Signup failed. Please try again.";
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(", ");
        errorMessage = errorMessages;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' ? err.response.data : "Registration failed. Please check your information and try again.";
      }
      
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

  function getDisabilityTypeId(disabilityType) {
    switch (disabilityType) {
      case "physical": return 1;
      case "visual": return 2;
      case "hearing": return 3;
      case "cognitive": return 4;
      case "other": return 5;
      default: return 0;
    }
  }

  return (
    <>
      <div className="login-wrapper py-5 home-wrapper-2">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <div className="auth-card">
                <h3 className="mb-3">Sign Up</h3>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-15">
                  <CustomInput
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autocomplete="name"
                    required
                    error={isSubmitted && fieldErrors.name}
                  />
                  <CustomInput
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autocomplete="email"
                    required
                    error={isSubmitted && fieldErrors.email}
                  />
                  <CustomInput
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autocomplete="off"
                    min="1"
                    max="120"
                    required
                    error={isSubmitted && fieldErrors.age}
                  />
                  <div className="form-group">
                    <CustomInput
                      select
                      name="disabilityType"
                      className="form-control"
                      value={formData.disabilityType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autocomplete="off"
                      required
                      error={isSubmitted && fieldErrors.disabilityType}
                    >
                      <option value="">Disability Type</option>
                      <option value="physical">Physical</option>
                      <option value="visual">Visual Impairment</option>
                      <option value="hearing">Hearing Impairment</option>
                      <option value="cognitive">Cognitive</option>
                      <option value="other">Other</option>
                    </CustomInput>
                  </div>
                  <CustomInput
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autocomplete="new-password"
                    required
                    error={isSubmitted && fieldErrors.password}
                  />
                  <CustomInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autocomplete="new-password"
                    required
                    error={isSubmitted && fieldErrors.confirmPassword}
                  />
                  <div className="d-flex justify-content-center flex-column align-items-center gap-10">
                    <button type="submit" className="button bo" disabled={isLoading}>
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                    <Link to="/login" className="li" style={{ textDecoration: "none" }}>
                      Already have an account? Log In
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
        </div>
      </div>
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

export default Signup;