// src/api/http.js
// Central HTTP layer built on jQuery's $.ajax (requirement #25 — all client/server
// communication uses jQuery Ajax). Every request automatically attaches the JWT token.
import $ from "jquery";

const TOKEN_KEY = "fc_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Core wrapper: returns a Promise so React components can use async/await.
function request(method, url, data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `/api${url}`,
      method,
      contentType: "application/json",
      data: data ? JSON.stringify(data) : undefined,
      beforeSend: (xhr) => {
        const token = getToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      success: (res) => resolve(res),
      error: (xhr) => {
        const message = xhr.responseJSON?.message || "Network error. Please try again.";
        reject(new Error(message));
      },
    });
  });
}

export const api = {
  get: (url) => request("GET", url),
  post: (url, data) => request("POST", url, data),
  put: (url, data) => request("PUT", url, data),
  del: (url) => request("DELETE", url),
};

// Multipart upload (image / video / canvas drawing) — also via jQuery $.ajax.
export function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/api/posts/upload",
      method: "POST",
      data: form,
      processData: false,
      contentType: false,
      beforeSend: (xhr) => {
        const token = getToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      success: (res) => resolve(res),
      error: (xhr) => reject(new Error(xhr.responseJSON?.message || "Upload failed.")),
    });
  });
}
