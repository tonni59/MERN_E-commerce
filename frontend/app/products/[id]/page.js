
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, assetUrl, money } from "../../../lib/api";

export default function ProductPage() {
  const { id } = useParams();

  const [p, setP] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (id) {
      api(`/products/${id}`)
        .then((d) => setP(d.product))
        .catch((e) => setErr(e.message));
    }
  }, [id]);

  function add() {
    const c = JSON.parse(localStorage.getItem("shop_cart") || "[]");
    const x = c.find((i) => i.productId === p._id);

    if (x) {
      x.quantity++;
    } else {
      c.push({
        productId: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        quantity: 1,
      });
    }

    localStorage.setItem("shop_cart", JSON.stringify(c));
    alert("Added to cart");
  }

  if (err) {
    return (
      <div className="product-state">
        <div className="state-card">
          <h2>Unable to load product</h2>
          <p>{err}</p>
          <Link href="/" className="add-cart-button">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="product-state">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h3>Loading product...</h3>
          <p>Please wait while we prepare your product.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="product-page">

      {/* Breadcrumb */}
      <div className="product-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Products</span>
        <span>/</span>
        <span>{p.name}</span>
      </div>

      {/* Product layout */}
      <div className="product-layout">

        {/* Product image */}
        <div className="product-gallery">
          <div className="product-main-image">

            <span className="image-label">SHOPEASE PRODUCT</span>

            {p.image ? (
              <img
                src={assetUrl(p.image)}
                alt={p.name}
                className="main-product-image"
              />
            ) : (
              <div className="no-product-image">
                <span>📦</span>
                <p>No product image available</p>
              </div>
            )}

          </div>

          <div className="image-caption">
            Quality products, carefully selected for you.
          </div>
        </div>

        {/* Product information */}
        <div className="product-information">

          <span className="product-category-label">
            {p.category || "General"}
          </span>

          <h1 className="product-title">{p.name}</h1>

          <div className="product-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-text">ShopEase selection</span>
          </div>

          <h2 className="product-price">{money(p.price)}</h2>

          <div
            className={`stock-status ${
              p.stock > 0 ? "available" : "unavailable"
            }`}
          >
            <span className="stock-dot"></span>
            {p.stock > 0
              ? `${p.stock} available`
              : "Currently out of stock"}
          </div>

          <div className="product-divider"></div>

          <div className="description-section">
            <h3>Product Description</h3>
            <p>
              {p.description || "No description available for this product."}
            </p>
          </div>

          <div className="product-divider"></div>

          {/* Add to cart */}
          <div className="product-actions">
            <button
              className="add-cart-button"
              disabled={!p.stock}
              onClick={add}
            >
              🛒 Add to Cart
            </button>
          </div>

          {/* Product benefits */}
          <div className="product-benefits">
            <div>
              <span>🚚</span>
              <p>Delivery available</p>
            </div>

            <div>
              <span>🔒</span>
              <p>Secure checkout</p>
            </div>

            <div>
              <span>💜</span>
              <p>Shop with confidence</p>
            </div>
          </div>

          <div className="product-extra">
            <strong>Why shop with ShopEase?</strong>
            <p>
              Discover quality products, enjoy a simple shopping
              experience and place your order conveniently.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom banner */}
      <div className="product-bottom-banner">
        <h2>Love this product?</h2>
        <p>Add it to your cart and continue shopping with ShopEase.</p>
      </div>

    </main>
  );
}
