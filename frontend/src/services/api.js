const API_URL = "http://localhost:8000/api";

export async function apiFetch(endpoint, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
