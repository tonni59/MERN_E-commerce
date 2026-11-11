"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
export default function Register() {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
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
        <h1>Create account</h1>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <input
            className="field"
            required
            maxLength={80}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            minLength={8}
            required
            placeholder="Password (at least 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          <button className="btn" disabled={busy}>
            {busy ? "Creating..." : "Register"}
          </button>
        </form>
        <p>
          Already registered?{" "}
          <Link href="/login" style={{ textDecoration: "underline" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
