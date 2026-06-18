// src/api/endpoints.js — typed-ish helpers grouped by model. All go through the jQuery api layer.
import { api } from "./http";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const userApi = {
  list: () => api.get("/users"),
  search: (q) => api.get(`/users/search?${new URLSearchParams(q)}`),
  getOne: (id) => api.get(`/users/${id}`),
  updateMe: (data) => api.put("/users/me", data),
  deleteMe: () => api.del("/users/me"),
  toggleFriend: (id) => api.post(`/users/${id}/friend`),
};

export const groupApi = {
  list: () => api.get("/groups"),
  search: (q) => api.get(`/groups/search?${new URLSearchParams(q)}`),
  getOne: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post("/groups", data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  remove: (id) => api.del(`/groups/${id}`),
  join: (id) => api.post(`/groups/${id}/join`),
  leave: (id) => api.post(`/groups/${id}/leave`),
  approve: (gid, uid) => api.post(`/groups/${gid}/approve/${uid}`),
  reject: (gid, uid) => api.post(`/groups/${gid}/reject/${uid}`),
  removeMember: (gid, uid) => api.del(`/groups/${gid}/members/${uid}`),
};

export const postApi = {
  list: () => api.get("/posts"),
  feed: () => api.get("/posts/feed"),
  search: (q) => api.get(`/posts/search?${new URLSearchParams(q)}`),
  byUser: (uid) => api.get(`/posts/user/${uid}`),
  byGroup: (gid) => api.get(`/posts/group/${gid}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  remove: (id) => api.del(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  comment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
};

export const messageApi = {
  contacts: () => api.get("/messages"),
  unread: () => api.get("/messages/unread"),
  history: (otherId) => api.get(`/messages/${otherId}`),
  markRead: (otherId) => api.post(`/messages/${otherId}/read`),
};

export const statsApi = {
  overview: () => api.get("/stats/overview"),
};

export const SPORT_TYPES = [
  "Running", "CrossFit", "Yoga", "Cycling", "Swimming", "Gym", "Football", "Basketball",
];
