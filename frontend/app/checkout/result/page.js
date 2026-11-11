"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
function Result() {
  const p = useSearchParams();
  const status = p.get("status");
  return (
    <div className="container" style={{ padding: "70px 20px" }}>
      <div className="card">
        <h1>
          Payment {status === "success" ? "successful" : status || "processing"}
        </h1>
        <p>
          Check your order status in My Orders. If the payment is pending,
          please contact store support with your order reference.
        </p>
        <Link className="btn" href="/orders">
          View my orders
        </Link>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Result />
    </Suspense>
  );
}
