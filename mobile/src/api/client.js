// src/api/client.js — REST client for the FitConnect server.
// The phone can't reach "localhost" (that's the phone itself), so we derive the
// dev machine's LAN IP from the Expo bundler host and talk to the server on :5000.
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

function resolveApiUrl() {
  // Allow a manual override via app config "extra.apiUrl" if ever needed.
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (fromExtra) return fromExtra;

  // hostUri looks like "192.168.1.20:8081" — reuse that IP, swap the port to 5000.
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";
  const host = hostUri.split(":")[0] || "localhost";
  return `http://${host}:5000`;
}

export const API_URL = resolveApiUrl();

let token = null;

export async function loadToken() {
  token = await AsyncStorage.getItem("fc_token");
  return token;
}
export async function setToken(value) {
  token = value;
  if (value) await AsyncStorage.setItem("fc_token", value);
  else await AsyncStorage.removeItem("fc_token");
}
export function getToken() {
  return token;
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  put: (p, b) => request("PUT", p, b),
  del: (p) => request("DELETE", p),
};

// Upload an image/video picked from the device. RN FormData needs { uri, name, type }.
export async function uploadAsset(uri, kind = "image") {
  const name = uri.split("/").pop() || `media-${Date.now()}`;
  const ext = (name.split(".").pop() || (kind === "video" ? "mp4" : "jpg")).toLowerCase();
  const type = kind === "video" ? `video/${ext}` : `image/${ext}`;

  const form = new FormData();
  form.append("file", { uri, name, type });

  const res = await fetch(`${API_URL}/api/posts/upload`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Upload failed.");
  return data; // { url, mimetype }
}

// Turn a relative "/uploads/x.jpg" into an absolute URL the phone can load.
export function mediaUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}
