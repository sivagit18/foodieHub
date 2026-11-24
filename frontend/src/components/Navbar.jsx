
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("foodiehub_token");
  const user = JSON.parse(
    localStorage.getItem("foodiehub_user") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("foodiehub_token");
    localStorage.removeItem("foodiehub_user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* Logo */}
        <Link to="/" className="logo">
          Foodie<span>Hub.</span>
        </Link>

        {/* Location */}
        <div className="location">
          <span className="nav-icon">📍</span>
          <div>
            <small>Deliver to</small>
            <h4>Chennai</h4>
          </div>
        </div>

        {/* Search */}
        <div className="search-box">
          <span className="nav-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for restaurants and food..."
          />
        </div>

        {/* Navigation Actions */}
        <div className="nav-actions">

          <Link to="/cart" className="cart-btn">
            <span>🛒</span> Cart
          </Link>

          {token && user ? (
            <>
              <Link to="/my-orders" className="cart-btn">
                📦 My Orders
              </Link>

              <span className="user-greeting">
                Hi, {user.first_name || user.username.split("@")[0]}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              👤 Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
