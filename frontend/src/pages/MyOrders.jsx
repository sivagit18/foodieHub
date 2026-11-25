
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  RefreshCw,
  ShoppingBag,
  CalendarDays,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Banknote,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./MyOrders.css";

const API = "http://127.0.0.1:8000/api/orders/";

const trackingSteps = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancelError, setCancelError] = useState({
    orderId: null,
    message: "",
  });

  const fetchOrders = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem("foodiehub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(API, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("foodiehub_token");
        localStorage.removeItem("foodiehub_user");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to fetch orders.");
      }

      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("foodiehub_token");

    setCancelingOrderId(orderId);
    setCancelError({ orderId: null, message: "" });

    try {
      const response = await fetch(`${API}${orderId}/cancel/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to cancel this order.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: result.order?.status || "Cancelled",
              }
            : order
        )
      );
    } catch (err) {
      setCancelError({
        orderId,
        message: err.message || "Unable to cancel this order.",
      });
    } finally {
      setCancelingOrderId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatPrice = (value) =>
    Number(value || 0).toFixed(2);

  const getStatusClass = (status) => {
    const normalized = (status || "").toLowerCase();

    if (normalized === "delivered") return "delivered";
    if (normalized === "cancelled") return "cancelled";

    return "active";
  };

  const getCurrentStep = (status) =>
    trackingSteps.indexOf(status);

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) =>
      !["Delivered", "Cancelled"].includes(order.status)
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  return (
    <>
      <Navbar />

      <main className="my-orders-container">
        <div className="my-orders-top">
          <div className="my-orders-heading">
            <span className="orders-eyebrow">YOUR FOOD JOURNEY</span>
            <h1>My Orders</h1>
            <p>View your orders and track your food delivery.</p>
          </div>

          <button
            className="refresh-orders-btn"
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "refresh-spinning" : ""}
            />
            Refresh Orders
          </button>
        </div>

        {loading ? (
          <div className="orders-message">
            <div className="orders-loader"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="orders-error">
            <p>{error}</p>
            <button onClick={() => fetchOrders()}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="orders-stats">
              <div className="orders-stat-card">
                <div className="orders-stat-icon total-icon">
                  <ShoppingBag size={21} />
                </div>
                <div>
                  <strong>{totalOrders}</strong>
                  <span>Total Orders</span>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="orders-stat-icon active-icon">
                  <Clock size={21} />
                </div>
                <div>
                  <strong>{activeOrders}</strong>
                  <span>Active Orders</span>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="orders-stat-icon delivered-icon">
                  <CheckCircle2 size={21} />
                </div>
                <div>
                  <strong>{deliveredOrders}</strong>
                  <span>Delivered Orders</span>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-orders-icon">
                  <ShoppingBag size={35} />
                </div>
                <h2>No orders yet!</h2>
                <p>
                  You haven't placed any orders.
                  Explore restaurants and order your favourite food.
                </p>
                <button onClick={() => navigate("/")}>
                  Explore Restaurants
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const status = order.status || "Placed";
                  const currentStep = getCurrentStep(status);
                  const items = order.items || [];

                  const paymentMethod =
                    order.payment_method === "COD"
                      ? "Cash on Delivery"
                      : order.payment_method || "Not available";

                  const paymentStatus =
                    order.payment_status || "Pending";

                  const canCancel = ["Placed", "Confirmed"].includes(
                    status
                  );

                  return (
                    <article className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <div className="order-heading-info">
                          <span className="order-label">ORDER ID</span>
                          <h3>{order.order_id || order.id}</h3>

                          <div className="order-date">
                            <CalendarDays size={14} />
                            {formatDate(order.created_at)}
                          </div>
                        </div>

                        <span className={`order-status ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </div>

                      {/* Tracking */}

                      {status === "Cancelled" ? (
                        <div className="cancelled-message">
                          <XCircle size={19} />
                          This order has been cancelled.
                        </div>
                      ) : currentStep >= 0 ? (
                        <section className="tracking-section">
                          <h3>Order Tracking</h3>

                          <div className="tracking-timeline">
                            {trackingSteps.map((step, index) => {
                              const completed = index <= currentStep;
                              const current = index === currentStep;

                              return (
                                <div
                                  className={`tracking-step ${
                                    completed ? "completed" : ""
                                  } ${current ? "current" : ""}`}
                                  key={step}
                                >
                                  <div className="tracking-marker">
                                    {completed ? (
                                      <CheckCircle2 size={17} />
                                    ) : (
                                      index + 1
                                    )}
                                  </div>

                                  <div className="tracking-step-text">
                                    <strong>{step}</strong>
                                    {current && <span>Current</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ) : (
                        <p className="unknown-status">
                          Current status: {status}
                        </p>
                      )}

                      {/* Ordered Items */}

                      <section className="order-card-items">
                        <h3 className="order-section-title">
                          Ordered Items
                        </h3>

                        {items.map((item, index) => (
                          <div
                            className="order-food-item"
                            key={item.id || index}
                          >
                            <div className="food-item-icon">
                              <ShoppingBag size={18} />
                            </div>

                            <div className="food-item-info">
                              <h4>{item.food_name || item.name}</h4>
                              <p>
                                Quantity: {item.quantity}
                                {item.restaurant_name
                                  ? ` · ${item.restaurant_name}`
                                  : ""}
                              </p>
                            </div>

                            <strong>
                              ₹
                              {formatPrice(
                                Number(item.price) *
                                  Number(item.quantity)
                              )}
                            </strong>
                          </div>
                        ))}
                      </section>

                      {/* Delivery Details */}

                      <section className="order-delivery-details">
                        <h4>
                          <MapPin size={17} />
                          Delivery Information
                        </h4>

                        <p className="delivery-customer">
                          {order.full_name || "Customer"}
                        </p>

                        <p>
                          {order.address}, {order.city} - {order.pincode}
                        </p>

                        <p>
                          <Phone size={14} /> {order.phone}
                        </p>
                      </section>

                      {/* Payment Details */}

                      <section className="order-payment-details">
                        <h4>
                          <Banknote size={17} />
                          Payment Information
                        </h4>

                        <div className="order-payment-row">
                          <span>Payment Method</span>
                          <strong>{paymentMethod}</strong>
                        </div>

                        <div className="order-payment-row">
                          <span>Payment Status</span>
                          <strong
                            className={`payment-status-text ${
                              paymentStatus.toLowerCase() === "paid"
                                ? "paid"
                                : "pending"
                            }`}
                          >
                            {paymentStatus}
                          </strong>
                        </div>
                      </section>

                      {/* Total */}

                      <div className="order-card-footer">
                        <span>Total Amount</span>
                        <strong>₹{formatPrice(order.total)}</strong>
                      </div>

                      {/* Cancel */}

                      {canCancel && (
                        <div className="order-cancel-section">
                          <button
                            className="cancel-order-btn"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelingOrderId === order.id}
                          >
                            {cancelingOrderId === order.id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        </div>
                      )}

                      {cancelError.orderId === order.id && (
                        <p className="cancel-order-error">
                          {cancelError.message}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default MyOrders;
