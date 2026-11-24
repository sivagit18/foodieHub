
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    return JSON.parse(localStorage.getItem("foodiehub_cart") || "[]");
  });

  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem("foodiehub_cart", JSON.stringify(items));
  };

  const increaseQuantity = (id) => {
    updateCart(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    updateCart(
      cartItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    updateCart(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <>
      <Navbar />

      <main className="cart-container">
        <h1>My Cart 🛒</h1>
        <p className="cart-subtitle">
          Review your selected food items
        </p>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty!</h2>
            <p>Add some delicious food to get started.</p>

            <Link to="/" className="continue-btn">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-food-emoji">
                    {item.emoji}
                  </div>

                  <div className="cart-food-info">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                  </div>

                  <div className="quantity-control">
                    <button onClick={() => decreaseQuantity(item.id)}>
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>
                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <h2>Order Summary</h2>

              <div className="total-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="total-row">
                <span>Delivery Fee</span>
                <strong>₹{deliveryFee}</strong>
              </div>

              <div className="total-row grand-total">
                <span>Total Amount</span>
                <strong>₹{total}</strong>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Cart;
