
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, money } from "../../lib/api";

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [fullName, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [method, setMethod] = useState("cod");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("shop_cart") || "[]"));

    const u = JSON.parse(
      localStorage.getItem("shop_user") || "null"
    );

    if (u) setName(u.name || "");
  }, []);

  async function submit(e) {
    e.preventDefault();

    if (!localStorage.getItem("shop_token")) {
      router.push("/login");
      return;
    }

    if (!items.length) return;

    setBusy(true);
    setError("");

    try {
      const d = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shippingAddress: {
            fullName,
            phone,
            address,
            city,
          },
          paymentMethod: method,
        }),
      });

      if (method === "sslcommerz") {
        const p = await api("/payments/ssl/init", {
          method: "POST",
          body: JSON.stringify({
            orderId: d.order._id,
          }),
        });

        window.location.href = p.url;
      } else {
        localStorage.removeItem("shop_cart");
        router.push("/orders");
      }
    } catch (x) {
      setError(x.message);
    } finally {
      setBusy(false);
    }
  }

  const subtotal = items.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const totalQuantity = items.reduce(
    (s, i) => s + i.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛍️</div>
          <h1>Your cart is empty!</h1>
          <p>
            You need to add products to your cart before
            proceeding to checkout.
          </p>
          <Link href="/" className="checkout-primary-button">
            Continue Shopping →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">

      {/* Breadcrumb */}
      <div className="checkout-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/cart">Cart</Link>
        <span>/</span>
        <strong>Checkout</strong>
      </div>

      {/* Heading */}
      <div className="checkout-header">
        <div>
          <span className="checkout-eyebrow">
            ALMOST THERE!
          </span>
          <h1>Complete Your Order</h1>
          <p>
            Fill in your delivery details and choose your
            preferred payment method.
          </p>
        </div>

        <div className="checkout-header-icon">
          🛒
        </div>
      </div>

      <div className="checkout-layout">

        {/* LEFT: CHECKOUT FORM */}
        <section className="checkout-form-section">

          <form onSubmit={submit}>

            {/* Delivery information */}
            <div className="checkout-card">

              <div className="checkout-card-heading">
                <div className="checkout-step">01</div>
                <div>
                  <h2>Delivery Information</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              <div className="checkout-form-grid">

                <div className="checkout-field full-width">
                  <label>Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="checkout-field full-width">
                  <label>Phone Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="checkout-field full-width">
                  <label>Full Delivery Address *</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="House number, road, area, landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="checkout-field full-width">
                  <label>City / District *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your city or district"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

              </div>
            </div>

            {/* Payment method */}
            <div className="checkout-card">

              <div className="checkout-card-heading">
                <div className="checkout-step">02</div>
                <div>
                  <h2>Payment Method</h2>
                  <p>Choose how you want to pay.</p>
                </div>
              </div>

              <div className="payment-options">

                <label
                  className={`payment-option ${
                    method === "cod" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={method === "cod"}
                    onChange={(e) => setMethod(e.target.value)}
                  />

                  <span className="payment-icon">💵</span>

                  <span className="payment-details">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives.</small>
                  </span>

                  <span className="payment-check">
                    ✓
                  </span>
                </label>

                <label
                  className={`payment-option ${
                    method === "sslcommerz" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="sslcommerz"
                    checked={method === "sslcommerz"}
                    onChange={(e) => setMethod(e.target.value)}
                  />

                  <span className="payment-icon">💳</span>

                  <span className="payment-details">
                    <strong>Online Payment</strong>
                    <small>
                      Pay securely using SSLCOMMERZ.
                    </small>
                  </span>

                  <span className="payment-check">
                    ✓
                  </span>
                </label>

              </div>
            </div>

            {error && (
              <div className="checkout-error">
                ⚠️ {error}
              </div>
            )}

            <button
              className="checkout-submit-button"
              type="submit"
              disabled={busy || !items.length}
            >
              {busy ? (
                "Processing your order..."
              ) : (
                <>
                  Place Your Order
                  <span>→</span>
                </>
              )}
            </button>

            <p className="checkout-secure-note">
              🔒 Your order information is submitted securely.
            </p>

          </form>
        </section>

        {/* RIGHT: ORDER SUMMARY */}
        <aside className="checkout-summary">

          <div className="checkout-summary-heading">
            <div>
              <span>YOUR PURCHASE</span>
              <h2>Order Summary</h2>
            </div>
            <span className="checkout-bag-icon">🛍️</span>
          </div>

          <div className="checkout-item-count">
            {totalQuantity} item(s) in your cart
          </div>

          <div className="checkout-products">

            {items.map((item, index) => (
              <div
                className="checkout-product"
                key={item.productId}
              >
                <div className="checkout-product-number">
                  {index + 1}
                </div>

                <div className="checkout-product-info">
                  <strong>{item.name}</strong>
                  <small>
                    Quantity: {item.quantity}
                  </small>
                </div>

                <strong className="checkout-product-price">
                  {money(item.price * item.quantity)}
                </strong>
              </div>
            ))}

          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-price-row">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <div className="checkout-price-row">
            <span>Delivery</span>
            <strong className="checkout-delivery">
              Calculated by store
            </strong>
          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-grand-total">
            <span>Order Total</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <p className="checkout-summary-note">
            Delivery charges, if applicable, will be
            handled by the store.
          </p>

          <Link
            href="/cart"
            className="checkout-edit-cart"
          >
            ← Edit Shopping Cart
          </Link>

          <div className="checkout-trust">

            <div>
              <span>🚚</span>
              <p>
                <strong>Delivery Support</strong>
                <small>Order delivery assistance</small>
              </p>
            </div>

            <div>
              <span>🔐</span>
              <p>
                <strong>Secure Checkout</strong>
                <small>Protected order information</small>
              </p>
            </div>

            <div>
              <span>💜</span>
              <p>
                <strong>Thank You!</strong>
                <small>Shopping with ShopEase</small>
              </p>
            </div>

          </div>

        </aside>
      </div>

      <div className="checkout-bottom-banner">
        <div>
          <span>THANK YOU FOR SHOPPING WITH US</span>
          <h2>Happy Shopping, Happy Living! 💜</h2>
          <p>We appreciate your trust in ShopEase.</p>
        </div>
        <div className="checkout-banner-icon">🎁</div>
      </div>

    </main>
  );
}
