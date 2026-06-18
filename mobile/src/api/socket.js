// src/api/socket.js — single shared Socket.io connection for live chat.
import { io } from "socket.io-client";
import { API_URL, getToken } from "./client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      auth: { token: getToken() },
      transports: ["websocket"], // websocket works reliably in React Native
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
