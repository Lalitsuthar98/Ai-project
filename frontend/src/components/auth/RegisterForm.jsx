import { useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Calendar,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { signupUser } from "../../services/authService";

import "./AuthForm.css";

function RegisterForm() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
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

      await signupUser({
        name: formData.name,
        age: Number(formData.age),
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");

    } catch (error) {

      const message =
        error.response?.data?.message ||
        "Unable to create account. Please try again.";

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

        <label>Full name</label>

        <div className="input-wrapper">

          <User size={17} />

          <input
            name="name"
            type="text"
            placeholder="Demo user"
            value={formData.name}
            onChange={handleChange}
            required
          />

        </div>

      </div>


      <div className="form-field">

        <label>Age</label>

        <div className="input-wrapper">

          <Calendar size={17} />

          <input
            name="age"
            type="number"
            placeholder="22"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />

        </div>

      </div>


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

        <label>Password</label>

        <div className="input-wrapper">

          <Lock size={17} />

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
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
        {loading ? "Creating account..." : "Create account"}

        {!loading && <ArrowRight size={17} />}
      </button>


      <p className="auth-switch">

        Already have an account?

        <Link to="/login">
          Sign in
        </Link>

      </p>

    </form>
  );
}

export default RegisterForm;