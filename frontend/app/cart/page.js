
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money, assetUrl } from "../../lib/api";

export default function Cart() {
  const [items, setItems] = useState([]);

  function refresh() {
    setItems(JSON.parse(localStorage.getItem("shop_cart") || "[]"));
  }

  useEffect(() => {
    refresh();
  }, []);

  function save(next) {
    setItems(next);
    localStorage.setItem("shop_cart", JSON.stringify(next));
  }

  function updateQuantity(productId, quantity) {
    const next = items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: Math.min(
              Math.max(1, Number(quantity) || 1),
              Number(item.stock) > 0 ? Number(item.stock) : Infinity
            ),
          }
        : item
    );

    save(next);
  }

  function removeItem(productId) {
    save(items.filter((item) => item.productId !== productId));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <main className="shop-cart-page">
      <div className="cart-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Shopping Cart</span>
      </div>

      <section className="cart-heading">
        <div>
          <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
          <h1>Shopping Cart</h1>
          <p>
            {items.length} {items.length === 1 ? "product" : "products"} in your cart
          </p>
        </div>

        <Link href="/products" className="continue-shopping">
          ← Continue Shopping
        </Link>
      </section>

      {!items.length ? (
        <section className="empty-cart">
          <div className="empty-cart-icon">🛍️</div>
          <h2>Your shopping cart is empty!</h2>
          <p>
            Looks like you haven't added anything to your shopping bag yet.
            Discover something beautiful today.
          </p>
          <Link href="/products" className="shop-now-button">
            Explore Products →
          </Link>
        </section>
      ) : (
        <section className="cart-content">
          <div className="cart-items-panel">
            <div className="cart-panel-title">
              <h2>Your Products</h2>
              <span>{items.length} items</span>
            </div>

            {items.map((item) => (
              <article className="cart-product" key={item.productId}>
                <div className="cart-product-image">
                  {item.image ? (
                    <img
                      src={assetUrl(item.image)}
                      alt={item.name}
                    />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>

                <div className="cart-product-info">
                  <h3>{item.name}</h3>
                  <p className="cart-unit-price">
                    {money(item.price)} <span> / each</span>
                  </p>

                  <div className="cart-quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-remove-button"
                    onClick={() => removeItem(item.productId)}
                  >
                    <span>✕</span> Remove
                  </button>
                </div>

                <div className="cart-product-total">
                  <span>Item total</span>
                  <strong>
                    {money(Number(item.price) * Number(item.quantity))}
                  </strong>
                </div>
              </article>
            ))}

            <Link href="/products" className="cart-back-link">
              ← Continue browsing
            </Link>
          </div>

          <aside className="cart-summary">
            <div className="summary-heading">
              <h2>Order Summary</h2>
              <span>✦</span>
            </div>

            <div className="summary-row">
              <span>Products ({items.length})</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="shipping-checkout">
                Calculated at checkout
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <p className="summary-note">
              Final delivery charges will be calculated during checkout.
            </p>

            <Link href="/checkout" className="checkout-button">
              Proceed to Checkout <span>→</span>
            </Link>

            <div className="cart-security">
              <span>🔒</span>
              <div>
                <strong>Secure Checkout</strong>
                <small>Your shopping experience matters to us.</small>
              </div>
            </div>

            <div className="cart-payment-note">
              <span>💳</span> Convenient payment options
            </div>
          </aside>
        </section>
      )}

      <section className="cart-bottom-banner">
        <div>
          <span>THE SHOEASE EXPERIENCE</span>
          <h2>Shopping made beautiful.</h2>
          <p>Discover your next favourite product with ShopEase.</p>
        </div>
        <Link href="/products">Explore Collection →</Link>
      </section>
    </main>
  );
}
