import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Menu.css";

const API = "http://127.0.0.1:8000/api/orders";

const fallbackImage =
  "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600";

function Menu() {
  const { restaurantId, categoryName } = useParams();

  const [foodItems, setFoodItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("foodiehub_cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError("");
        setFoodItems([]);

        let apiUrl;

        if (categoryName) {
          apiUrl =
            `${API}/foods/?category=${encodeURIComponent(categoryName)}`;

          setRestaurantName(`${categoryName} Foods`);
        } else {
          apiUrl = `${API}/foods/?restaurant_id=${restaurantId}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Unable to fetch food items.");
        }

        const data = await response.json();
        const foods = data.foods || [];

        setFoodItems(foods);

        if (!categoryName && foods.length > 0) {
          setRestaurantName(foods[0].restaurant_name);
        }
      } catch (err) {
        setError("Unable to load menu. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [restaurantId, categoryName]);

  // Create a consistent cart item ID
  const getCartItemId = (food) => {
    const restaurant = food.restaurant_name || restaurantName;
    return `${restaurant}-${food.id}`;
  };

  // Update cart quantity
  const updateCart = (food, change) => {
    const restaurant = food.restaurant_name || restaurantName;
    const cartItemId = getCartItemId(food);

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.id === cartItemId
      );

      let updatedCart;

      if (existingItem) {
        updatedCart = previousCart
          .map((item) => {
            if (item.id === cartItemId) {
              return {
                ...item,
                quantity: item.quantity + change,
              };
            }

            return item;
          })
          .filter((item) => item.quantity > 0);
      } else if (change > 0) {
        updatedCart = [
          ...previousCart,
          {
            ...food,
            id: cartItemId,
            foodId: food.id,
            name: food.name,
            restaurantName: restaurant,
            price: Number(food.price),
            quantity: 1,
          },
        ];
      } else {
        updatedCart = previousCart;
      }

      localStorage.setItem(
        "foodiehub_cart",
        JSON.stringify(updatedCart)
      );

      return updatedCart;
    });
  };

  const getFoodQuantity = (food) => {
    const cartItemId = getCartItemId(food);

    const cartItem = cart.find(
      (item) => item.id === cartItemId
    );

    return cartItem ? cartItem.quantity : 0;
  };

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="menu-container">
        <div className="menu-heading">
          <div>
            <h1>{restaurantName}</h1>

            <p className="menu-subtitle">
              {categoryName
                ? `Explore our delicious ${categoryName} collection`
                : "Explore our delicious food menu"}
            </p>
          </div>

          {!loading && !error && foodItems.length > 0 && (
            <span className="menu-food-count">
              {foodItems.length} Food Items
            </span>
          )}
        </div>

        {loading && (
          <p className="menu-message">
            Loading food items...
          </p>
        )}

        {!loading && error && (
          <p className="menu-error">{error}</p>
        )}

        {!loading && !error && foodItems.length === 0 && (
          <p className="menu-message">
            No food items available right now.
          </p>
        )}

        {!loading && !error && foodItems.length > 0 && (
          <div className="food-grid">
            {foodItems.map((food) => {
              const quantity = getFoodQuantity(food);

              return (
                <div className="food-card" key={food.id}>
                  <div className="food-image">
                    <img
                      src={food.image_url || fallbackImage}
                      alt={food.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                    />
                  </div>

                  <div className="food-info">
                    <div className="food-labels">
                      <span className="food-category">
                        {food.category || "Food"}
                      </span>

                      {categoryName && (
                        <small className="food-restaurant-name">
                          {food.restaurant_name}
                        </small>
                      )}
                    </div>

                    <h3>{food.name}</h3>

                    <p>
                      {food.description || "Fresh and delicious food."}
                    </p>

                    <div className="food-bottom">
                      <strong>
                        ₹{Number(food.price).toFixed(2)}
                      </strong>

                      {quantity === 0 ? (
                        <button
                          className="add-button"
                          onClick={() => updateCart(food, 1)}
                        >
                          Add +
                        </button>
                      ) : (
                        <div className="quantity-control">
                          <button
                            className="quantity-button"
                            onClick={() => updateCart(food, -1)}
                            aria-label={`Remove one ${food.name}`}
                          >
                            −
                          </button>

                          <span>{quantity}</span>

                          <button
                            className="quantity-button"
                            onClick={() => updateCart(food, 1)}
                            aria-label={`Add one ${food.name}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart Summary */}
        <div className="menu-cart-summary">
          <div className="cart-summary-info">
            <span className="cart-summary-icon">🛒</span>

            <div>
              <strong>Items in Cart: {totalItems}</strong>
              <small>Food subtotal</small>
            </div>
          </div>

          <strong className="cart-summary-total">
            ₹{cartTotal.toFixed(2)}
          </strong>
        </div>
      </main>
    </>
  );
}

export default Menu;