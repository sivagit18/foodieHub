
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cartItems] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("foodiehub_cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add food items.");
      return;
    }

    // Every cart item must have a database food ID.
    const invalidItem = cartItems.some(
      (item) =>
        !item.foodId ||
        !Number.isInteger(Number(item.foodId)) ||
        Number(item.quantity) < 1
    );

    if (invalidItem) {
      setErrorMessage(
        "Your cart contains outdated items. Please clear your cart and add the food items again."
      );
      return;
    }

    const token = localStorage.getItem("foodiehub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customer: formData,
      items: cartItems.map((item) => ({
        foodId: Number(item.foodId),
        quantity: Number(item.quantity),
      })),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/orders/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage(
            "Your session has expired. Please login again."
          );
        } else {
          setErrorMessage(
            result.error ||
            result.detail ||
            "Unable to place your order."
          );
        }
        return;
      }

      const savedOrder = result.order;

      const order = {
        orderId: savedOrder.order_id,
        customer: {
          fullName: savedOrder.full_name,
          phone: savedOrder.phone,
          address: savedOrder.address,
          city: savedOrder.city,
          pincode: savedOrder.pincode,
        },
        items: (savedOrder.items || []).map((item) => ({
          id: item.id,
          name: item.food_name,
          restaurantName: item.restaurant_name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
        subtotal: Number(savedOrder.subtotal),
        deliveryFee: Number(savedOrder.delivery_fee),
        total: Number(savedOrder.total),
        orderDate: savedOrder.created_at,
        status: savedOrder.status,
      };

      localStorage.setItem(
        "foodiehub_order",
        JSON.stringify(order)
      );

      localStorage.removeItem("foodiehub_cart");

      navigate("/order-success");
    } catch (error) {
      console.error("Order placement error:", error);

      setErrorMessage(
        "Cannot connect to the server. Please check whether the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="checkout-container">
        <h1>Checkout</h1>
        <p>Complete your delivery details</p>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Delivery Address</h2>

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              title="Enter a valid 10-digit phone number"
              required
            />

            <textarea
              name="address"
              placeholder="House No, Street, Area"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              pattern="[0-9]{6}"
              title="Enter a valid 6-digit pincode"
              required
            />

            {errorMessage && (
              <div className="checkout-error">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="place-order-btn"
              disabled={cartItems.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? "Placing Order..."
                : `Place Order • ₹${total.toFixed(2)}`}
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div className="checkout-item" key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>
                  ₹{(
                    Number(item.price) * Number(item.quantity)
                  ).toFixed(2)}
                </strong>
              </div>
            ))}

            <hr />

            <div className="checkout-item">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <div className="checkout-item">
              <span>Delivery Fee</span>
              <strong>₹{deliveryFee.toFixed(2)}</strong>
            </div>

            <hr />

            <div className="checkout-total">
              <span>Total</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
