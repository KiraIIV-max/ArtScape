import img from "../../src/assets/clip-message-sent 1.png";
import Photoroom from "../../src/assets/1-2Photoroom.png";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Register = () => {
  const container = useRef();
  const navigate = useNavigate();

  const [isLoginForm, setIsLoginForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    role: "",
    city: "",
    national_id: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".reg-item", {
        opacity: 0,
        x: -300,
        delay: 0.2,
        duration: 4,
        ease: "power2.out",
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setMessage({ type: "", text: "" });
    setErrors({});
  };

  // Handle register input changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle login input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate register form
  const validateRegister = () => {
    const newErrors = {};

    if (!registerData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!registerData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!registerData.password) {
      newErrors.password = "Password is required";
    } else if (registerData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (registerData.password !== registerData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!registerData.role) {
      newErrors.role = "Please select a role";
    }

    if (!registerData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!registerData.national_id.trim()) {
      newErrors.national_id = "National ID is required";
    } else if (registerData.national_id.length !== 14) {
      newErrors.national_id = "National ID must be 14 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate login form
  const validateLogin = () => {
    const newErrors = {};

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegister()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          // Buyer - auto approved, save token and redirect
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setMessage({
            type: "success",
            text: "Registration successful! Redirecting...",
          });
          setTimeout(() => navigate("/"), 1500);
        } else {
          // Artist - pending approval
          setMessage({
            type: "info",
            text: data.message || "Registration submitted! Please wait for admin approval.",
          });
          // Clear form
          setRegisterData({
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            phone: "",
            role: "",
            city: "",
            national_id: "",
          });
        }
      } else {
        // Handle validation errors from server
        if (data.errors) {
          setErrors(data.errors);
          setMessage({
            type: "error",
            text: "Please fix the errors below.",
          });
        } else {
          setMessage({
            type: "error",
            text: data.message || "Registration failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!validateLogin()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user data
        localStorage.setItem("token", data.access_token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        setMessage({
          type: "success",
          text: "Login successful! Redirecting...",
        });

        // Redirect based on role (you can adjust this)
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else if (response.status === 403) {
        // Account pending approval
        setMessage({
          type: "warning",
          text: data.message || "Your account is pending admin approval.",
        });
      } else if (response.status === 422) {
        // Validation error (wrong credentials)
        setMessage({
          type: "error",
          text: data.errors?.email?.[0] || "Invalid email or password.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Message Alert Component
  const MessageAlert = () => {
    if (!message.text) return null;

    const bgColors = {
      success: "bg-green-100 border-green-500 text-green-700",
      error: "bg-red-100 border-red-500 text-red-700",
      warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
      info: "bg-blue-100 border-blue-500 text-blue-700",
    };

    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    return (
      <div
        className={`${bgColors[message.type]} border-l-4 p-4 rounded-lg mb-4 flex items-center gap-3 animate-fade-in`}
      >
        <span className="text-xl">{icons[message.type]}</span>
        <p className="font-medium">{message.text}</p>
      </div>
    );
  };

  // Input Error Component
  const InputError = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-500 text-sm mt-1 ml-3">{error}</p>;
  };

  return (
    <>
      <section
        ref={container}
        className="ml-10 gap-10 items-center justify-center min-h-screen flex-row flex"
      >
        <div className="mx-20 my-8 max-w-lg">
          {/* Header */}
          <div className="pb-10">
            <h1 className="font-bold text-4xl font-style italic">
              ArtScape{" "}
              <img
                src={Photoroom}
                alt="logo"
                className="w-20 h-20 m-0 p-0 inline-block"
              />{" "}
              Universe
            </h1>
          </div>

          <div>
            <p className="uppercase font-serif text-gray-500 text-sm">
              {isLoginForm ? "Welcome back" : "Start for free"}
            </p>
            <h1 className="text-5xl pb-3 font-serif">
              {isLoginForm ? "Welcome Back" : "Create an account"}{" "}
              <span className="text-7xl text-blue-600">.</span>
            </h1>
            <p className="uppercase text-gray-500 text-sm">
              {isLoginForm ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={toggleForm}
                className="cursor-pointer text-blue-600 hover:underline"
              >
                {isLoginForm ? "Sign Up" : "Log In"}
              </span>
            </p>
          </div>

          {/* Message Alert */}
          <div className="mt-4">
            <MessageAlert />
          </div>

          {/* Register Form */}
          {!isLoginForm && (
            <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col gap-4 mt-6">
              {/* Role Select */}
              <div>
                <select
                  className={`w-full bg-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? "ring-2 ring-red-500" : ""
                  }`}
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                >
                  <option value="" disabled>
                    Choose your role
                  </option>
                  <option value="artist">Artist</option>
                  <option value="buyer">Buyer</option>
                </select>
                <InputError error={errors.role} />
              </div>

              {/* Name */}
              <div>
                <label className="text-black font-semibold">
                  Name
                  <input
                    placeholder="Enter your full name"
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.name} />
              </div>

              {/* Email */}
              <div>
                <label className="text-black font-semibold">
                  Email
                  <input
                    placeholder="Enter your email"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.email} />
              </div>

              {/* Phone */}
              <div>
                <label className="text-black font-semibold">
                  Phone
                  <input
                    placeholder="Enter your phone number"
                    type="tel"
                    name="phone"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.phone} />
              </div>

              {/* City */}
              <div>
                <label className="text-black font-semibold">
                  City
                  <input
                    placeholder="Enter your city"
                    type="text"
                    name="city"
                    value={registerData.city}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.city} />
              </div>

              {/* National ID */}
              <div>
                <label className="text-black font-semibold">
                  National ID
                  <input
                    placeholder="Enter your 14-digit national ID"
                    type="text"
                    name="national_id"
                    maxLength={14}
                    value={registerData.national_id}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.national_id ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.national_id} />
              </div>

              {/* Password */}
              <div>
                <label className="text-black font-semibold">
                  Password
                  <input
                    placeholder="Set a password (min 8 characters)"
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-black font-semibold">
                  Confirm Password
                  <input
                    placeholder="Confirm your password"
                    type="password"
                    name="password_confirmation"
                    value={registerData.password_confirmation}
                    onChange={handleRegisterChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password_confirmation ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.password_confirmation} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`cursor-pointer text-xl w-fit mx-auto mt-4 px-8 py-3 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          )}

          {/* Login Form */}
          {isLoginForm && (
            <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-5 mt-10">
              {/* Email */}
              <div>
                <label className="text-black font-semibold">
                  Email
                  <input
                    placeholder="Enter your email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.email} />
              </div>

              {/* Password */}
              <div>
                <label className="text-black font-semibold">
                  Password
                  <input
                    placeholder="Enter your password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={`block rounded-full w-full mt-1 px-6 py-3 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                </label>
                <InputError error={errors.password} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`cursor-pointer text-xl w-fit mx-auto mt-6 px-8 py-3 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Log in"
                )}
              </button>

              {/* Forgot Password Link */}
              <p className="text-center text-gray-500 mt-2">
                <span className="cursor-pointer text-blue-600 hover:underline text-sm">
                  Forgot your password?
                </span>
              </p>
            </form>
          )}
        </div>

        {/* Image Section */}
        <div>
          <span className="absolute top-0 right-0 -z-10 bg-slate-50 w-1/2 h-full"></span>
          <img
            src={img}
            alt="art"
            className="reg-item w-full h-full object-cover"
          />
        </div>
      </section>
    </>
  );
};

export default Register;