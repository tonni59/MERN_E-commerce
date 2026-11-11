
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const normalizeBaseUrl = (url) => {
  return url.trim().replace(/\/+$/, "");
};

// Automatically handle both:
// http://localhost:5000
// https://your-backend.onrender.com
// https://your-backend.onrender.com/api

const BASE_URL = normalizeBaseUrl(API_BASE_URL);

export const API = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

// --------------------------------------------------
// IMAGE URL
// --------------------------------------------------

export const assetUrl = (imagePath) => {
  if (!imagePath) return "";

  // Keep absolute image URLs unchanged
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const backendOrigin = BASE_URL.replace(/\/api$/, "");

  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return `${backendOrigin}${normalizedPath}`;
};

// --------------------------------------------------
// AUTH TOKEN
// --------------------------------------------------

export function getToken() {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("shop_token") || "";
}

// --------------------------------------------------
// API REQUEST FUNCTION
// --------------------------------------------------

export async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (options.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  let response;

  try {
    response = await fetch(`${API}${normalizedPath}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection.",
    );
  }

  const contentType = response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => "");
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`,
    );
  }

  return data;
}

// --------------------------------------------------
// CURRENCY FORMAT
// --------------------------------------------------

export function money(amount) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}
