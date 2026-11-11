
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --------------------------------------------------
// BASE URL CONFIGURATION
// --------------------------------------------------

const normalizeBaseUrl = (url) => {
  return url.trim().replace(/\/+$/, "");
};

const BASE_URL = normalizeBaseUrl(API_BASE_URL);

// Supports:
// http://localhost:5000
// http://localhost:5000/api
// https://your-backend.onrender.com
// https://your-backend.onrender.com/api

export const API = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

// --------------------------------------------------
// IMAGE URL CONFIGURATION
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

  // Backend origin without /api
  const backendOrigin = BASE_URL.replace(/\/api$/, "");

  // Ensure image path starts with /
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  // Final image URL
  return `${backendOrigin}${normalizedPath}`;
};

// --------------------------------------------------
// AUTH TOKEN
// --------------------------------------------------

export function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("shop_token") || "";
}

// --------------------------------------------------
// API REQUEST FUNCTION
// --------------------------------------------------

export async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  // Attach JWT token automatically
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Detect FormData
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  // Set JSON content type only for non-FormData body
  if (
    options.body &&
    !isFormData &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  // Normalize API path
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
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection.",
    );
  }

  // Parse API response
  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => "");

    data = {
      message: text,
    };
  }

  // Handle API errors
  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`,
    );
  }

  return data;
}

// --------------------------------------------------
// CURRENCY FORMAT (BDT)
// --------------------------------------------------

export function money(amount) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}
