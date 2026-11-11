
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const NORMALIZED_BASE_URL = API_BASE_URL.trim().replace(/\/+$/, "");

const API_URL = NORMALIZED_BASE_URL.endsWith("/api")
  ? NORMALIZED_BASE_URL
  : `${NORMALIZED_BASE_URL}/api`;

const BACKEND_URL = API_URL.replace(/\/api$/, "");

const categories = [
  {
    name: "Fashion",
    subtitle: "Style for every day",
    icon: "👗",
    color: "pink",
    search: "Fashion",
  },
  {
    name: "Electronics",
    subtitle: "Smart technology",
    icon: "🎧",
    color: "blue",
    search: "Electronics",
  },
  {
    name: "Beauty",
    subtitle: "Your beauty essentials",
    icon: "💄",
    color: "peach",
    search: "Beauty",
  },
  {
    name: "Home & Living",
    subtitle: "Make home beautiful",
    icon: "🏡",
    color: "green",
    search: "Home",
  },
  {
    name: "Accessories",
    subtitle: "Complete your look",
    icon: "👜",
    color: "purple",
    search: "Accessories",
  },
  {
    name: "Shoes",
    subtitle: "Step into style",
    icon: "👟",
    color: "yellow",
    search: "Shoes",
  },
];

// PRODUCT IMAGE URL
function getImage(product) {
  const image =
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    (Array.isArray(product.images) ? product.images[0] : "");

  if (!image) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700";
  }

  // Already an absolute image URL
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) {
    return image;
  }

  // Backend uploaded image
  return `${BACKEND_URL}/${image.replace(/^\/+/, "")}`;
}

// PRICE FORMAT
function formatPrice(price) {
  return `৳${Number(price || 0).toLocaleString("en-BD")}`;
}

// FETCH PRODUCTS FROM BACKEND
async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Product API failed:",
        response.status,
        response.statusText
      );
      return [];
    }

    const result = await response.json();

    // Your backend response:
    // { success: true, products: [...] }

    if (Array.isArray(result.products)) {
      return result.products;
    }

    if (Array.isArray(result.data?.products)) {
      return result.data.products;
    }

    if (Array.isArray(result.data)) {
      return result.data;
    }

    if (Array.isArray(result)) {
      return result;
    }

    console.error("Unexpected product API response:", result);
    return [];
  } catch (error) {
    console.error("Product loading error:", error);
    return [];
  }
}

// SECTION HEADING
function SectionHeading({
  eyebrow,
  title,
  description,
  href,
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {href && (
        <Link href={href} className="view-all">
          View all <span>→</span>
        </Link>
      )}
    </div>
  );
}

// PRODUCT CARD
function ProductCard({ product }) {
  const id = product._id || product.id;
  const name = product.name || product.title || "Shop product";
  const price = product.price;
  const oldPrice = product.compareAtPrice || product.originalPrice;
  const image = getImage(product);

  return (
    <article className="product-card">
      <Link href={`/products/${id}`} className="product-image-wrap">
        {oldPrice && Number(oldPrice) > Number(price) && (
          <span className="sale-badge">SALE</span>
        )}

        <img
          src={image}
          alt={name}
          className="product-image"
          loading="lazy"
        />
      </Link>

      <div className="product-info">
        <span className="product-category">
          {product.category || "Featured"}
        </span>

        <Link href={`/products/${id}`} className="product-name">
          {name}
        </Link>

        <div className="product-price-row">
          <strong>{formatPrice(price)}</strong>

          {oldPrice && Number(oldPrice) > Number(price) && (
            <del>{formatPrice(oldPrice)}</del>
          )}
        </div>

        <Link href={`/products/${id}`} className="product-button">
          View Product
        </Link>
      </div>
    </article>
  );
}

// HOMEPAGE
export default async function HomePage() {
  const products = await getProducts();

  // Show latest 8 products
  const featuredProducts = products.slice(0, 8);

  const availableCategories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  return (
    <main>
      {/* ANNOUNCEMENT */}
      <div className="announcement">
        ✨ Welcome to our store — Discover something beautiful today!
      </div>

      {/* NAVIGATION */}
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <span className="brand-icon">S</span>
            <span>
              Shop<span className="brand-highlight">Nest</span>
            </span>
          </Link>

          <nav className="main-nav">
            <Link href="/">Home</Link>
            <Link href="/products">Shop</Link>
            <a href="#categories">Categories</a>
            <a href="#offers">Offers</a>
            <a href="#footer">Contact</a>
          </nav>

          <div className="header-actions">
            <Link href="/login" className="login-link">
              Login
            </Link>

            <Link href="/cart" className="cart-button">
              🛒 <span>My Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">
            YOUR HAPPY SHOPPING DESTINATION
          </span>

          <h1>
            Find Your
            <br />
            <span>Perfect Style.</span>
          </h1>

          <p>
            Discover amazing products, beautiful collections and
            exciting deals — all in one place.
          </p>

          <div className="hero-buttons">
            <Link href="/products" className="primary-button">
              Explore Products <span>→</span>
            </Link>

            <a href="#categories" className="secondary-button">
              Browse Categories
            </a>
          </div>

          <div className="hero-trust">
            <span>✓ Quality products</span>
            <span>✓ Great prices</span>
            <span>✓ Easy shopping</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle"></div>

          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000"
            alt="Beautiful shopping collection"
            className="hero-image"
          />

          <div className="floating-card">
            <span>💖</span>
            <div>
              <strong>New Collection</strong>
              <small>Discover your favourites</small>
            </div>
          </div>

          <div className="floating-discount">
            <strong>NEW</strong>
            <span>ARRIVALS</span>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="benefit-item">
          <span>🚚</span>
          <div>
            <strong>Fast Delivery</strong>
            <small>Convenient delivery</small>
          </div>
        </div>

        <div className="benefit-item">
          <span>💳</span>
          <div>
            <strong>Secure Payment</strong>
            <small>Safe checkout</small>
          </div>
        </div>

        <div className="benefit-item">
          <span>⭐</span>
          <div>
            <strong>Quality Products</strong>
            <small>Carefully selected</small>
          </div>
        </div>

        <div className="benefit-item">
          <span>💬</span>
          <div>
            <strong>Customer Support</strong>
            <small>We are here to help</small>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="content-section" id="categories">
        <SectionHeading
          eyebrow="EXPLORE COLLECTIONS"
          title="Shop by Category"
          description="Find exactly what you are looking for."
        />

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              href={`/products?category=${encodeURIComponent(
                category.search
              )}`}
              key={category.name}
              className={`category-card category-${category.color}`}
            >
              <span className="category-icon">
                {category.icon}
              </span>

              <h3>{category.name}</h3>
              <p>{category.subtitle}</p>

              <span className="category-arrow">
                Explore →
              </span>
            </Link>
          ))}
        </div>

        {availableCategories.length > 0 && (
          <div className="database-categories">
            <p>Categories in our store:</p>

            <div className="category-chips">
              {availableCategories.map((category) => (
                <Link
                  href={`/products?category=${encodeURIComponent(
                    category
                  )}`}
                  key={category}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-section">
        <div className="content-section">
          <SectionHeading
            eyebrow="HANDPICKED FOR YOU"
            title="Featured Products"
            description="Explore some of our favourite products."
            href="/products"
          />

          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <span>🛍️</span>

              <h3>Our collection is coming soon!</h3>

              <p>
                Add products from your admin panel and they will
                appear here automatically.
              </p>

              <Link href="/products" className="primary-button">
                Explore Shop
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* PROMOTION */}
      <section className="offer-section" id="offers">
        <div className="offer-content">
          <span className="offer-label">
            A LITTLE SOMETHING SPECIAL
          </span>

          <h2>
            Make Every Day a Little More Beautiful.
          </h2>

          <p>
            Explore our latest collection and find something you
            will love.
          </p>

          <Link href="/products" className="offer-button">
            Shop Now <span>→</span>
          </Link>
        </div>

        <div className="offer-decoration">✦</div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter-section">
        <div>
          <span className="eyebrow">STAY IN THE LOOP</span>

          <h2>Good things are on the way!</h2>

          <p>
            Visit our store regularly to discover new arrivals and offers.
          </p>
        </div>

        <Link href="/products" className="newsletter-button">
          Discover Products →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="site-footer" id="footer">
        <div className="footer-main">
          <div className="footer-about">
            <Link href="/" className="brand footer-brand">
              <span className="brand-icon">S</span>
              <span>
                Shop<span className="brand-highlight">Nest</span>
              </span>
            </Link>

            <p>
              Your happy shopping destination. Discover beautiful
              products and enjoy a simple shopping experience.
            </p>

            <div className="social-links">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                f
              </a>

              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                ◎
              </a>

              <a
                href="https://youtube.com"
                aria-label="YouTube"
                target="_blank"
                rel="noreferrer"
              >
                ▶
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>

            <Link href="/">Home</Link>
            <Link href="/products">All Products</Link>
            <Link href="/login">My Account</Link>
            <Link href="/cart">Shopping Cart</Link>
          </div>

          <div className="footer-column">
            <h3>Customer Care</h3>

            <Link href="/orders">My Orders</Link>
            <a href="#footer">Contact Us</a>
            <a href="#footer">Privacy Policy</a>
            <a href="#footer">Return Policy</a>
          </div>

          <div className="footer-column footer-contact">
            <h3>Get in Touch</h3>

            <p>📍 Bangladesh</p>
            <p>📧 support@shopnest.com</p>
            <p>🕒 Saturday – Thursday</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} ShopNest. All rights reserved.
          </p>

          <p>Made with 💖 for happy shoppers</p>
        </div>
      </footer>
    </main>
  );
}
