export const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const assetUrl = (path) =>
  path ? `${API.replace(/\/api$/, "")}${path}` : "";
export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("shop_token") || "";
}
export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body)
    headers["Content-Type"] = "application/json";
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
export function money(amount) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
