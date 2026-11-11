"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("shop_token", d.token);
      localStorage.setItem("shop_user", JSON.stringify(d.user));
      router.push("/");
    } catch (x) {
      setError(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container" style={{ maxWidth: 480, padding: "55px 20px" }}>
      <div className="card">
        <h1>Sign in</h1>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <input
            className="field"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="field"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          <button className="btn" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>
        <p>
          New customer?{" "}
          <Link href="/register" style={{ textDecoration: "underline" }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
