import { useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


import "./AuthForm.css";

function LoginForm() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


 const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    await login({
      email: formData.email,
      password: formData.password,
    });

    navigate("/chat");
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Unable to login. Please check your credentials.";

    setError(message);
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      <div className="form-field">

        <label>Email</label>

        <div className="input-wrapper">

          <Mail size={17} />

          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

        </div>

      </div>


      <div className="form-field">

        <div className="field-label-row">

          <label>Password</label>

          <button
            type="button"
            className="forgot-btn"
          >
            Forgot password?
          </button>

        </div>

        <div className="input-wrapper">

          <Lock size={17} />

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
          >
            {showPassword ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}
          </button>

        </div>

      </div>


      <button
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}

        {!loading && <ArrowRight size={17} />}
      </button>


      <p className="auth-switch">

        Don't have an account?

        <Link to="/register">
          Create one
        </Link>

      </p>

    </form>
  );
}

export default LoginForm;