const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(method, path, body, options = {}) {
  const { token, skipAuth = false } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers,
    credentials: "include", // send cookies
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, fetchOptions);
  const json = await res.json().catch(() => ({}));

  if (!json.success) {
    throw new ApiError(
      json.error?.code || "UNKNOWN",
      json.error?.message || "An error occurred",
      res.status
    );
  }

  return json.data;
}

export function apiGet(path, options = {}) {
  return request("GET", path, null, options);
}

export function apiPost(path, body, options = {}) {
  return request("POST", path, body, options);
}

export function apiPatch(path, body, options = {}) {
  return request("PATCH", path, body, options);
}

export function apiPut(path, body, options = {}) {
  return request("PUT", path, body, options);
}

export function apiDelete(path, options = {}) {
  return request("DELETE", path, null, options);
}

export { ApiError };
