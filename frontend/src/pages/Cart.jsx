
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import "./Cart.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("foodiehub_cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem(
      "foodiehub_cart",
      JSON.stringify(items)
    );
  };

  const increaseQuantity = (id) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Number(item.quantity) + 1 }
        : item
    );

    updateCart(updatedItems);
  };

  const decreaseQuantity = (id) => {
    const updatedItems = cartItems
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Number(item.quantity) - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedItems);
  };

  const removeItem = (id) => {
    const updatedItems = cartItems.filter(
      (item) => item.id !== id
    );

    updateCart(updatedItems);
  };

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <>
      <Navbar />

      <main className="cart-container">
        <div className="cart-heading">
          <div>
            <h1>My Cart</h1>
            <p className="cart-subtitle">
              Review your selected food items
            </p>
          </div>

          {cartItems.length > 0 && (
            <span className="cart-item-count">
              {totalItems} Items
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={42} />
            </div>

            <h2>Your cart is empty!</h2>

            <p>
              Looks like you haven't added anything to your cart yet.
              Explore restaurants and find something delicious.
            </p>

            <Link to="/" className="continue-btn">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-section-heading">
                <h2>Selected Items</h2>
                <span>{totalItems} items</span>
              </div>

              <div className="cart-items">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-food-image">
                      <img
                        src={item.image_url || fallbackImage}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackImage;
                        }}
                      />
                    </div>

                    <div className="cart-food-info">
                      <h3>{item.name}</h3>

                      {item.restaurantName && (
                        <p className="cart-restaurant">
                          {item.restaurantName}
                        </p>
                      )}

                      <p className="cart-food-price">
                        ₹{Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => increaseQuantity(item.id)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <strong className="cart-item-total">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toFixed(2)}
                      </strong>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/" className="continue-shopping">
                ← Continue Shopping
              </Link>
            </section>

            <aside className="cart-total">
              <h2>Order Summary</h2>

              <div className="summary-item-count">
                {totalItems} food items in your cart
              </div>

              <div className="total-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>

              <div className="total-row">
                <span>Delivery Fee</span>
                <strong>₹{deliveryFee.toFixed(2)}</strong>
              </div>

              <div className="total-row grand-total">
                <span>Total Amount</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>

              <p className="cart-secure-note">
                Your order total will be confirmed at checkout.
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Cart;
