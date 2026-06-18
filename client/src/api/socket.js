// src/api/socket.js — single shared Socket.io client connection (requirement #28).
import { io } from "socket.io-client";
import { getToken } from "./http";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io("/", { auth: { token: getToken() }, autoConnect: true });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
