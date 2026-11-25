
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  User,
  Phone,
  ShoppingBag,
  ShieldCheck,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./Checkout.css";

const API = "http://127.0.0.1:8000/api/orders/";

const fallbackImage =
  "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300";

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
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add food items.");
      return;
    }

    const invalidItem = cartItems.some(
      (item) =>
        !item.foodId ||
        !Number.isInteger(Number(item.foodId)) ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
    );

    if (invalidItem) {
      setErrorMessage(
        "Your cart contains outdated items. Please clear your cart and add the food items again."
      );
      return;
    }

    const cleanFormData = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
    };

    if (
      !cleanFormData.fullName ||
      !cleanFormData.phone ||
      !cleanFormData.address ||
      !cleanFormData.city ||
      !cleanFormData.pincode
    ) {
      setErrorMessage("Please fill in all delivery details.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanFormData.phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanFormData.pincode)) {
      setErrorMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    const token = localStorage.getItem("foodiehub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customer: cleanFormData,
      items: cartItems.map((item) => ({
        foodId: Number(item.foodId),
        quantity: Number(item.quantity),
      })),
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

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
        paymentMethod: savedOrder.payment_method,
        paymentStatus: savedOrder.payment_status,
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

      <main className="checkout-container">
        <div className="checkout-heading">
          <h1>Checkout</h1>
          <p>Complete your delivery details and place your order.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="checkout-empty">
            <ShoppingBag size={42} />
            <h2>Your cart is empty</h2>
            <p>Add some delicious food before proceeding to checkout.</p>

            <button onClick={() => navigate("/")}>
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="checkout-layout">
            <form
              className="checkout-form"
              onSubmit={handleSubmit}
            >
              <div className="checkout-section-title">
                <div className="checkout-title-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2>Delivery Address</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="fullName">Full Name</label>
                <div className="checkout-input-wrapper">
                  <User size={17} />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">Phone Number</label>
                <div className="checkout-input-wrapper">
                  <Phone size={17} />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    required
                  />
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="address">Complete Address</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="House No, Street, Area, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength={500}
                  required
                />
              </div>

              <div className="checkout-form-row">
                <div className="checkout-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    title="Enter a valid 6-digit pincode"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-payment-section">
                <div className="checkout-section-title">
                  <div className="checkout-title-icon">
                    <Banknote size={20} />
                  </div>

                  <div>
                    <h2>Payment Method</h2>
                    <p>Choose how you want to pay.</p>
                  </div>
                </div>

                <div className="checkout-payment-option">
                  <div className="checkout-payment-icon">
                    <Banknote size={25} />
                  </div>

                  <div className="checkout-payment-info">
                    <strong>Cash on Delivery</strong>
                    <span>Pay cash when your order arrives.</span>
                  </div>

                  <CheckCircle2
                    className="checkout-payment-selected"
                    size={23}
                  />
                </div>

                <p className="checkout-payment-note">
                  <ShieldCheck size={16} />
                  You can pay the delivery person when your food is delivered.
                </p>
              </div>

              {errorMessage && (
                <div className="checkout-error" role="alert">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="place-order-btn"
                disabled={isSubmitting || cartItems.length === 0}
              >
                {isSubmitting
                  ? "Placing Your Order..."
                  : `Place Order • ₹${total.toFixed(2)}`}
              </button>

              <div className="checkout-security">
                <ShieldCheck size={17} />
                <span>
                  Your order details are securely submitted.
                </span>
              </div>
            </form>

            <aside className="checkout-summary">
              <div className="checkout-summary-heading">
                <h2>Order Summary</h2>
                <span>{totalItems} Items</span>
              </div>

              <div className="checkout-summary-items">
                {cartItems.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <div className="checkout-item-image">
                      <img
                        src={item.image_url || fallbackImage}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackImage;
                        }}
                      />
                    </div>

                    <div className="checkout-item-info">
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>

                    <strong className="checkout-item-price">
                      ₹
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="checkout-price-details">
                <div className="checkout-price-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div className="checkout-price-row">
                  <span>Delivery Fee</span>
                  <strong>₹{deliveryFee.toFixed(2)}</strong>
                </div>

                <div className="checkout-total">
                  <span>Total Amount</span>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>
              </div>

              <div className="checkout-summary-payment">
                <span>Payment Method</span>
                <strong>Cash on Delivery</strong>
              </div>

              <p className="checkout-summary-note">
                Final order prices are calculated by the server.
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Checkout;
