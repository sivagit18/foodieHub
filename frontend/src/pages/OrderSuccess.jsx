
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  CalendarDays,
  Receipt,
  ShoppingBag,
  Banknote,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();

  let order = null;

  try {
    order = JSON.parse(
      localStorage.getItem("foodiehub_order") || "null"
    );
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="order-not-found">
          <div className="not-found-icon">
            <ShoppingBag size={35} />
          </div>
          <h2>No order found!</h2>
          <p>Please place an order to see your confirmation.</p>
          <Link to="/">Explore Restaurants</Link>
        </main>
      </>
    );
  }

  const customer = order.customer || {};
  const items = order.items || [];

  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";

  const paymentMethod =
    order.paymentMethod === "COD"
      ? "Cash on Delivery"
      : order.paymentMethod || "Cash on Delivery";

  const paymentStatus = order.paymentStatus || "Pending";

  return (
    <>
      <Navbar />

      <main className="success-container">
        <div className="success-card">

          <div className="success-header">
            <div className="success-icon">
              <CheckCircle2 size={48} />
            </div>

            <span className="success-label">Order Confirmed</span>

            <h1>Order Placed Successfully!</h1>

            <p className="success-message">
              Thank you for ordering with FoodieHub.
              Your delicious food is being prepared!
            </p>

            <div className="success-order-id">
              <span>Order ID</span>
              <strong>{order.orderId || "Not available"}</strong>
            </div>
          </div>

          <div className="success-status-card">
            <div className="status-icon">
              <Package size={23} />
            </div>

            <div>
              <strong>Your order is {order.status || "Placed"}</strong>
              <p>
                You can check your order status from My Orders.
              </p>
            </div>
          </div>

          {/* Delivery Information */}

          <section className="success-section">
            <h2>Delivery Information</h2>

            <div className="success-detail">
              <div className="detail-icon">
                <Receipt size={18} />
              </div>
              <div className="detail-content">
                <span>Customer Name</span>
                <strong>{customer.fullName || "Not available"}</strong>
              </div>
            </div>

            <div className="success-detail">
              <div className="detail-icon">
                <Phone size={18} />
              </div>
              <div className="detail-content">
                <span>Phone Number</span>
                <strong>{customer.phone || "Not available"}</strong>
              </div>
            </div>

            <div className="success-detail">
              <div className="detail-icon">
                <MapPin size={18} />
              </div>
              <div className="detail-content">
                <span>Delivery Address</span>
                <strong>
                  {customer.address}, {customer.city} - {customer.pincode}
                </strong>
              </div>
            </div>

            <div className="success-detail">
              <div className="detail-icon">
                <CalendarDays size={18} />
              </div>
              <div className="detail-content">
                <span>Order Date</span>
                <strong>{orderDate}</strong>
              </div>
            </div>
          </section>

          {/* Ordered Items */}

          <section className="success-section">
            <h2>Ordered Items</h2>

            <div className="success-items-list">
              {items.map((item, index) => (
                <div className="success-item" key={item.id || index}>
                  <div className="success-item-info">
                    <strong>{item.name}</strong>
                    <span>Quantity: {item.quantity}</span>
                    {item.restaurantName && (
                      <small>{item.restaurantName}</small>
                    )}
                  </div>

                  <strong className="success-item-price">
                    ₹
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Details */}

          <section className="success-section">
            <h2>Payment Summary</h2>

            <div className="success-payment-card">
              <div className="payment-method-icon">
                <Banknote size={23} />
              </div>

              <div className="payment-method-info">
                <span>Payment Method</span>
                <strong>{paymentMethod}</strong>
              </div>

              <span className="payment-cod-badge">COD</span>
            </div>

            <div className="success-payment-status">
              <div className="payment-status-icon">
                <Clock size={17} />
              </div>

              <div>
                <span>Payment Status</span>
                <strong>{paymentStatus}</strong>
              </div>
            </div>

            <div className="success-row">
              <span>Subtotal</span>
              <strong>
                ₹{Number(order.subtotal || 0).toFixed(2)}
              </strong>
            </div>

            <div className="success-row">
              <span>Delivery Fee</span>
              <strong>
                ₹{Number(order.deliveryFee || 0).toFixed(2)}
              </strong>
            </div>

            <div className="success-row final-amount">
              <span>Total Amount</span>
              <strong>
                ₹{Number(order.total || 0).toFixed(2)}
              </strong>
            </div>
          </section>

          {/* Actions */}

          <div className="success-actions">
            <button
              className="orders-btn"
              onClick={() => navigate("/my-orders")}
            >
              <Package size={17} />
              Track My Order
            </button>

            <Link to="/" className="home-btn">
              <ShoppingBag size={17} />
              Continue Shopping
            </Link>
          </div>

          <p className="success-footer">
            Thank you for choosing FoodieHub ❤️
          </p>

        </div>
      </main>
    </>
  );
}

export default OrderSuccess;
