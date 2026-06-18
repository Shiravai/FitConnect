// src/components/Navbar.jsx — top navigation bar.
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnread, toggleWidget } = useChat();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const link = (to, label) => (
    <Link to={to} className={pathname === to ? "nav-link active" : "nav-link"}>
      {label}
    </Link>
  );

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Fit<span>Connect</span></Link>
      <div className="nav-links">
        {link("/", "Feed")}
        {link("/groups", "Groups")}
        {link("/search/posts", "Search Posts")}
        {link("/search/groups", "Search Groups")}
        {link("/stats", "Stats")}
        <button className="nav-link nav-chat-btn" onClick={toggleWidget}>
          Chat{totalUnread > 0 && <span className="badge">{totalUnread}</span>}
        </button>
        {link("/create", "+ New Post")}
      </div>
      <div className="nav-user">
        <Link to={`/profile/${user._id}`} className="nav-link">
          {user.avatarUrl ? <img className="nav-avatar" src={user.avatarUrl} alt="" /> : "👤"} {user.username}
        </Link>
        {user.role !== "user" && <span className="role-badge">{user.role}</span>}
        <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
