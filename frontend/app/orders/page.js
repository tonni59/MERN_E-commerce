
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, money } from "../../lib/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/orders/my")
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function statusClass(status) {
    const value = String(status || "pending").toLowerCase();

    if (value.includes("deliver")) return "delivered";
    if (value.includes("cancel")) return "cancelled";
    if (value.includes("ship")) return "shipped";
    if (value.includes("process")) return "processing";

    return "pending";
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <main className="my-orders-page">
      <div className="orders-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>My Orders</span>
      </div>

      <section className="orders-header">
        <div>
          <span className="orders-eyebrow">YOUR SHOPPING JOURNEY</span>
          <h1>My Orders</h1>
          <p>Keep track of your purchases and order status.</p>
        </div>

        <div className="orders-header-icon">📦</div>
      </section>

      {loading ? (
        <div className="orders-state">
          <div className="orders-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="orders-state orders-error">
          <span>🔐</span>
          <h2>Unable to load your orders</h2>
          <p>{error}</p>
          <p>Please log in to view your order history.</p>
          <Link href="/login" className="orders-login-button">
            Login to Your Account →
          </Link>
        </div>
      ) : !orders.length ? (
        <div className="orders-state empty-orders">
          <span>🛍️</span>
          <h2>No orders yet!</h2>
          <p>
            You haven't placed any orders. Your shopping journey starts here.
          </p>
          <Link href="/products" className="orders-shop-button">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <>
          <div className="orders-count-bar">
            <div>
              <strong>{orders.length}</strong>
              <span> {orders.length === 1 ? "Order" : "Orders"} placed</span>
            </div>
            <Link href="/products">Continue Shopping →</Link>
          </div>

          <section className="orders-list">
            {orders.map((o) => (
              <article className="order-card" key={o._id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-label">ORDER NUMBER</span>
                    <h3>#{String(o._id).slice(-8).toUpperCase()}</h3>
                    <small>{formatDate(o.createdAt || o.orderDate)}</small>
                  </div>

                  <span
                    className={`order-status ${statusClass(o.orderStatus)}`}
                  >
                    {o.orderStatus || "Pending"}
                  </span>
                </div>

                <div className="order-products">
                  {(o.items || []).map((item, index) => (
                    <div
                      className="order-product-row"
                      key={item.productId || item._id || index}
                    >
                      <div className="order-product-icon">🛍️</div>

                      <div className="order-product-info">
                        <strong>{item.name}</strong>
                        <small>Quantity: {item.quantity}</small>
                      </div>

                      <span className="order-product-price">
                        {item.price != null
                          ? money(Number(item.price) * Number(item.quantity))
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-payment">
                    <span>PAYMENT STATUS</span>
                    <strong>{o.paymentStatus || "Pending"}</strong>
                  </div>

                  <div className="order-total">
                    <span>ORDER TOTAL</span>
                    <strong>{money(o.total)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <section className="orders-help-banner">
        <div>
          <span>NEED ASSISTANCE?</span>
          <h2>We're happy to help!</h2>
          <p>Contact our customer support if you have questions about an order.</p>
        </div>
        <Link href="/products">Explore ShopEase →</Link>
      </section>
    </main>
  );
}
