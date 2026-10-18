import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister
              ? form
              : { email: form.email, password: form.password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isRegister) {
        setMessage("Account created successfully! Please log in.");
        setForm({ name: "", email: "", password: "" });
        return;
      }

      localStorage.setItem("edusyncToken", data.token);
      localStorage.setItem("edusyncUser", JSON.stringify(data.user));

      if (data.user.role === "instructor") {
        navigate("/instructor-dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-logo">
          EduSync<span>.</span>
        </Link>

        <p className="auth-eyebrow">
          {isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}
        </p>

        <h1>{isRegister ? "Create your account" : "Sign in to EduSync"}</h1>

        <p className="auth-subtitle">
          {isRegister
            ? "Create an account and start learning."
            : "Continue your learning journey."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                minLength={2}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </label>

          {message && (
            <p className={isError ? "auth-message error" : "auth-message"}>
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to EduSync?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Create account"}
          </Link>
        </p>

        <Link to="/" className="auth-home">
          ← Back to home
        </Link>
      </section>
    </main>
  );
}

export default Auth;