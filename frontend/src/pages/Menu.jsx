
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Menu.css";

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
            `http://127.0.0.1:8000/api/orders/foods/?category=${encodeURIComponent(categoryName)}`;

          setRestaurantName(`${categoryName} Foods`);
        } else {
          apiUrl =
            `http://127.0.0.1:8000/api/orders/foods/?restaurant_id=${restaurantId}`;
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

  const addToCart = (food) => {
    const restaurant = food.restaurant_name || restaurantName;
    const cartItemId = `${restaurant}-${food.id}`;

    const existingItem = cart.find(
      (item) => item.id === cartItemId
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
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
    }

    setCart(updatedCart);

    localStorage.setItem(
      "foodiehub_cart",
      JSON.stringify(updatedCart)
    );
  };

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <main className="menu-container">
        <h1>{restaurantName}</h1>

        <p className="menu-subtitle">
          {categoryName
            ? `Explore our delicious ${categoryName} collection`
            : "Explore our delicious food menu"}
        </p>

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
            {foodItems.map((food) => (
              <div className="food-card" key={food.id}>
                <div className="food-image">
                  <img
                    src={food.image_url || fallbackImage}
                    alt={food.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>

                <div className="food-info">
                  <span className="food-category">
                    {food.category}
                  </span>

                  {categoryName && (
                    <small className="food-restaurant-name">
                      {food.restaurant_name}
                    </small>
                  )}

                  <h3>{food.name}</h3>

                  <p>{food.description}</p>

                  <div className="food-bottom">
                    <strong>
                      ₹{Number(food.price).toFixed(2)}
                    </strong>

                    <button onClick={() => addToCart(food)}>
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="menu-cart-summary">
          🛒 Items in Cart: {totalItems}
        </div>
      </main>
    </>
  );
}

export default Menu;
