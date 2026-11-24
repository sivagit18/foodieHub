
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burger", emoji: "🍔" },
  { name: "Biryani", emoji: "🍛" },
  { name: "Dosa", emoji: "🥞" },
  { name: "Chicken", emoji: "🍗" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Noodles", emoji: "🍜" },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/orders/restaurants/"
        );

        if (!response.ok) {
          throw new Error("Unable to fetch restaurants.");
        }

        const data = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        setError(
          "Unable to load restaurants. Please check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <>
      <Navbar />

      <main className="home-container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <span className="hero-tag">
              YOUR FAVOURITE FOOD, DELIVERED
            </span>

            <h1>
              Delicious Food,<br />
              Delivered <span>To Your Door.</span>
            </h1>

            <p>
              Discover the best restaurants around you and enjoy
              your favourite meals anytime.
            </p>

            <button
              className="explore-btn"
              onClick={() =>
                document
                  .getElementById("restaurants")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Restaurants →
            </button>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=800"
              alt="Delicious food"
            />
          </div>
        </section>

        {/* Categories Section */}
        <section className="category-section">
          <div className="section-heading">
            <div>
              <h2>Explore Categories</h2>
              <p>What are you craving today?</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                to={`/menu/category/${encodeURIComponent(category.name)}`}
                className="category-card"
                key={category.name}
              >
                <span>{category.emoji}</span>
                <h4>{category.name}</h4>
              </Link>
            ))}
          </div>
        </section>

        {/* Restaurants Section */}
        <section
          className="restaurant-section"
          id="restaurants"
        >
          <div className="section-heading">
            <div>
              <h2>Popular Restaurants</h2>
              <p>Discover restaurants loved by foodies</p>
            </div>

            <button
              className="view-all"
              onClick={() =>
                document
                  .getElementById("restaurants")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View All →
            </button>
          </div>

          {loading && (
            <p className="restaurant-message">
              Loading restaurants...
            </p>
          )}

          {!loading && error && (
            <p className="restaurant-error">{error}</p>
          )}

          {!loading && !error && restaurants.length === 0 && (
            <p className="restaurant-message">
              No restaurants available right now.
            </p>
          )}

          {!loading && !error && restaurants.length > 0 && (
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <Link
                  to={`/menu/${restaurant.id}`}
                  className="restaurant-card"
                  key={restaurant.id}
                >
                  <div className="restaurant-image">
                    <img
                      src={restaurant.image_url || fallbackImage}
                      alt={restaurant.name}
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                      }}
                    />

                    <span className="offer">AVAILABLE</span>
                  </div>

                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>

                    <p>
                      {restaurant.description ||
                        "Explore delicious food and enjoy your meal."}
                    </p>

                    <div className="restaurant-meta">
                      <span>🍽️ Food Restaurant</span>
                      <span>✓ Active</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Home;
