// src/App.jsx — top-level routes.
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import CreatePost from "./pages/CreatePost";
import SearchPosts from "./pages/SearchPosts";
import SearchGroups from "./pages/SearchGroups";
import Stats from "./pages/Stats";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="center-screen">Loading FitConnect…</div>;

  return (
    <>
      {user && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
          <Route path="/search/posts" element={<ProtectedRoute><SearchPosts /></ProtectedRoute>} />
          <Route path="/search/groups" element={<ProtectedRoute><SearchGroups /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {user && (
        // Multi-column footer — demonstrates CSS3 "multiple-columns" (requirement #27).
        <footer className="site-footer">
          <p><strong>FitConnect</strong> is your fitness community — share workouts, join groups and stay motivated together.</p>
          <p>📋 Track running, cycling, swimming, gym, yoga and more with detailed workout stats on every post.</p>
          <p>👥 Create or join public and private groups, with managers approving new members.</p>
          <p>✏️ Draw your route on the built-in canvas or share workout videos directly in your posts.</p>
          <p>💬 Chat live with other members and follow your friends' progress in your personal feed.</p>
          <p>📊 Explore community statistics with live charts powered by your real activity data.</p>
        </footer>
      )}

      {/* Floating chat window — works on every page (requirement #28). */}
      {user && <ChatWidget />}
    </>
  );
}
