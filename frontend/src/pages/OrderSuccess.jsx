
import { Link, useNavigate } from "react-router-dom";
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
        <div className="order-not-found">
          <h2>No order found!</h2>
          <Link to="/">Go to Home</Link>
        </div>
      </>
    );
  }

  const customer = order.customer || {};
  const items = order.items || [];

  return (
    <>
      <Navbar />

      <main className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p className="success-message">
            Thank you for ordering with FoodieHub.
            Your delicious food is on its way!
          </p>

          <div className="order-details">
            <h2>Order Details</h2>

            <div className="success-row">
              <span>Order ID</span>
              <strong>{order.orderId}</strong>
            </div>

            <div className="success-row">
              <span>Customer</span>
              <strong>{customer.fullName}</strong>
            </div>

            <div className="success-row">
              <span>Phone</span>
              <strong>{customer.phone}</strong>
            </div>

            <div className="success-row">
              <span>Delivery Address</span>
              <strong>
                {customer.address}, {customer.city} - {customer.pincode}
              </strong>
            </div>

            <div className="success-row">
              <span>Order Date</span>
              <strong>
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleString("en-IN")
                  : "Not available"}
              </strong>
            </div>

            <div className="success-row">
              <span>Payment Method</span>
              <strong>Cash on Delivery</strong>
            </div>

            <div className="success-row">
              <span>Order Status</span>
              <strong className="placed-status">
                {order.status || "Placed"}
              </strong>
            </div>

            <h3 className="success-items-heading">
              Ordered Items
            </h3>

            {items.map((item, index) => (
              <div className="success-item" key={item.id || index}>
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

            <div className="success-row">
              <span>Subtotal</span>
              <strong>₹{Number(order.subtotal).toFixed(2)}</strong>
            </div>

            <div className="success-row">
              <span>Delivery Fee</span>
              <strong>₹{Number(order.deliveryFee).toFixed(2)}</strong>
            </div>

            <div className="success-row final-amount">
              <span>Total Amount</span>
              <strong>₹{Number(order.total).toFixed(2)}</strong>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/" className="home-btn">
              Continue Shopping
            </Link>

            <button
              className="orders-btn"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default OrderSuccess;
