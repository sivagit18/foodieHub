
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ShoppingCart, User, Package } from "lucide-react";
import "./Navbar.css";

const API = "http://127.0.0.1:8000/api/orders";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("foodiehub_token");

  const user = JSON.parse(
    localStorage.getItem("foodiehub_user") || "null"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [restaurantResults, setRestaurantResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Search foods and restaurants
  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setFoodResults([]);
      setRestaurantResults([]);
      setSearching(false);
      setShowResults(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);
      setShowResults(true);

      try {
        const [foodResponse, restaurantResponse] = await Promise.all([
          fetch(
            `${API}/foods/?q=${encodeURIComponent(query)}`
          ),
          fetch(
            `${API}/restaurants/?q=${encodeURIComponent(query)}`
          )
        ]);

        if (!foodResponse.ok || !restaurantResponse.ok) {
          throw new Error("Search request failed");
        }

        const foodData = await foodResponse.json();
        const restaurantData = await restaurantResponse.json();

        if (!cancelled) {
          setFoodResults(foodData.foods || []);
          setRestaurantResults(restaurantData.restaurants || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Search error:", error);
          setFoodResults([]);
          setRestaurantResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem("foodiehub_token");
    localStorage.removeItem("foodiehub_user");
    navigate("/login");
  };

  const handleRestaurantClick = (restaurant) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/menu/${restaurant.id}`);
  };

  const handleFoodClick = (food) => {
    setSearchQuery("");
    setShowResults(false);

    if (food.category) {
      navigate(`/menu/category/${encodeURIComponent(food.category)}`);
    } else {
      navigate("/");
    }
  };

  const noResults =
    !searching &&
    foodResults.length === 0 &&
    restaurantResults.length === 0;

  return (
    <nav className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          Foodie<span>Hub.</span>
        </Link>

        <div className="location">
          <MapPin size={19} />
          <div>
            <small>Deliver to</small>
            <h4>Chennai</h4>
          </div>
        </div>

        {/* Search Box */}
        <div className="search-wrapper">
          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search for restaurants and food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) {
                  setShowResults(true);
                }
              }}
            />

            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          {showResults && (
            <div className="search-results">

              {searching && (
                <p className="search-message">Searching...</p>
              )}

              {!searching && noResults && (
                <p className="search-message">
                  No food or restaurants found.
                </p>
              )}

              {!searching && restaurantResults.length > 0 && (
                <div className="search-section">
                  <h4>Restaurants</h4>

                  {restaurantResults.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      className="search-result-item"
                      type="button"
                      onClick={() => handleRestaurantClick(restaurant)}
                    >
                      <span className="result-icon">🍽️</span>

                      <span className="result-details">
                        <strong>{restaurant.name}</strong>
                        <small>Restaurant</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!searching && foodResults.length > 0 && (
                <div className="search-section">
                  <h4>Food Items</h4>

                  {foodResults.map((food) => (
                    <button
                      key={food.id}
                      className="search-result-item"
                      type="button"
                      onClick={() => handleFoodClick(food)}
                    >
                      <span className="result-icon">🍔</span>

                      <span className="result-details">
                        <strong>{food.name}</strong>
                        <small>
                          {food.restaurant_name || "Food Item"}
                          {food.category ? ` · ${food.category}` : ""}
                        </small>
                      </span>

                      {food.price !== undefined && (
                        <span className="result-price">
                          ₹{food.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="nav-actions">

          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={17} /> Cart
          </Link>

          {token && user ? (
            <>
              <Link to="/my-orders" className="cart-btn">
                <Package size={17} /> My Orders
              </Link>

              <Link to="/profile" className="cart-btn">
                <User size={17} /> Profile
              </Link>

              <span className="user-greeting">
                Hi, {user.first_name || user.username}
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
              <User size={17} /> Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
