
import { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("foodiehub_token", result.token);
        localStorage.setItem(
          "foodiehub_user",
          JSON.stringify(result.user)
        );

        setMessage("Login successful!");
        navigate("/");
      } else {
        setMessage(result.message || "Invalid username or password.");
      }
    } catch (error) {
      setMessage("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          Foodie<span>Hub.</span>
        </div>

        <h2>Welcome Back!</h2>
        <p className="login-subtitle">
          Login to continue your food journey.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#forgot">Forgot Password?</a>
          </div>

          {message && (
            <p className="login-message">{message}</p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login to Account"}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <p className="register-link">
          Don't have an account?
          <Link to="/register"> Create Account</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;
