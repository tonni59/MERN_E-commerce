import "./globals.css";
import Link from "next/link";
export const metadata = {
  title: "ShopEase — Online Store",
  description: "A modern online shopping experience",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}
        >
          <div
            className="container"
            style={{
              height: 68,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link href="/" style={{ fontSize: 22, fontWeight: 800 }}>
              ShopEase
            </Link>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Link href="/">Shop</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/orders">My orders</Link>
              <Link href="/login">Login</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer
          style={{
            marginTop: 70,
            padding: "28px 0",
            background: "#111827",
            color: "white",
          }}
        >
          <div className="container">
            © {new Date().getFullYear()} ShopEase · Customer support · Shipping
            · Returns
          </div>
        </footer>
      </body>
    </html>
  );
}
