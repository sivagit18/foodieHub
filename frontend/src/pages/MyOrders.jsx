
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./MyOrders.css";

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
  const [error, setError] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancelError, setCancelError] = useState({
    orderId: null,
    message: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("foodiehub_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/orders/",
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.detail ||
            result.error ||
            "Unable to load your orders."
          );
          return;
        }

        setOrders(result.orders || []);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError("Cannot connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.order_id}?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("foodiehub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setCancelingOrderId(order.id);
    setCancelError({ orderId: null, message: "" });

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${order.id}/cancel/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setCancelError({
          orderId: order.id,
          message:
            result.message ||
            result.error ||
            result.detail ||
            "Unable to cancel this order.",
        });
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: result.order?.status || "Cancelled",
              }
            : item
        )
      );
    } catch (err) {
      console.error("Cancel order error:", err);

      setCancelError({
        orderId: order.id,
        message: "Cannot connect to the server. Please try again.",
      });
    } finally {
      setCancelingOrderId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIndex = (status) => {
    return trackingSteps.indexOf(status);
  };

  return (
    <>
      <Navbar />

      <div className="my-orders-container">
        <div className="my-orders-heading">
          <h1>My Orders</h1>
          <p>Track and manage your food orders</p>
        </div>

        {loading ? (
          <div className="orders-message">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="orders-error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">🛍️</div>
            <h2>No orders yet!</h2>
            <p>
              Looks like you haven't placed any orders.
              Start exploring delicious food.
            </p>
            <button onClick={() => navigate("/")}>
              Explore Food
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const currentStep = getStatusIndex(order.status);
              const isCancelled = order.status === "Cancelled";
              const canCancel = ["Placed", "Confirmed"].includes(
                order.status
              );
              const isCanceling = cancelingOrderId === order.id;

              return (
                <div className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-label">ORDER ID</span>
                      <h3>{order.order_id}</h3>
                      <p className="order-date">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <span
                      className={`order-status ${
                        isCancelled
                          ? "cancelled"
                          : order.status === "Delivered"
                          ? "delivered"
                          : ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {!isCancelled ? (
                    <div className="tracking-section">
                      <h3>Order Tracking</h3>

                      <div className="tracking-timeline">
                        {trackingSteps.map((step, index) => {
                          const completed = currentStep >= 0 &&
                            index <= currentStep;
                          const current = index === currentStep;

                          return (
                            <div
                              className={`tracking-step ${
                                completed ? "completed" : ""
                              } ${current ? "current" : ""}`}
                              key={step}
                            >
                              <div className="tracking-marker">
                                {completed ? "✓" : index + 1}
                              </div>

                              <div className="tracking-step-text">
                                <strong>{step}</strong>
                                {current && (
                                  <span>Current status</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="cancelled-message">
                      This order has been cancelled.
                    </div>
                  )}

                  <div className="order-card-items">
                    {(order.items || []).map((item) => (
                      <div
                        className="order-food-item"
                        key={item.id}
                      >
                        <div>
                          <h4>{item.food_name}</h4>
                          <p>
                            {item.restaurant_name} · Qty: {item.quantity}
                          </p>
                        </div>

                        <strong>
                          ₹{(
                            Number(item.price) * item.quantity
                          ).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-delivery-details">
                    <h4>Delivery Address</h4>
                    <p>
                      {order.full_name} · {order.phone}
                    </p>
                    <p>
                      {order.address}, {order.city} - {order.pincode}
                    </p>
                  </div>

                  <div className="order-card-footer">
                    <span>Total Amount</span>
                    <strong>
                      ₹{Number(order.total).toFixed(2)}
                    </strong>
                  </div>

                  {canCancel && (
                    <div className="order-cancel-section">
                      <button
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancelingOrderId !== null}
                      >
                        {isCanceling
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    </div>
                  )}

                  {cancelError.orderId === order.id &&
                    cancelError.message && (
                      <p className="cancel-order-error">
                        {cancelError.message}
                      </p>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default MyOrders;
