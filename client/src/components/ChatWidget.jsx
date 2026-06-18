// src/components/ChatWidget.jsx — floating chat window available on every page (requirement #28).
// Shows a launcher button with the total unread count; opens a side panel to chat
// without leaving the current page, and pops open automatically on a new message.
import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

export default function ChatWidget() {
  const { user } = useAuth();
  const {
    contacts, unread, totalUnread, openUser, widgetOpen, messages,
    openWith, backToList, send, toggleWidget,
  } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (widgetOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, widgetOpen, openUser]);

  const onSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text);
    setText("");
  };

  return (
    <div className="chat-widget">
      {/* Launcher button with a pulsing red unread badge */}
      <button
        className={totalUnread > 0 ? "chat-launcher has-unread" : "chat-launcher"}
        onClick={toggleWidget}
        title={totalUnread > 0 ? `${totalUnread} new message(s)` : "Chat"}
      >
        💬
        {totalUnread > 0 && <span className="badge badge-pulse">{totalUnread}</span>}
      </button>

      {widgetOpen && (
        <div className="chat-panel">
          <header className="chat-panel-head">
            {openUser ? (
              <>
                <button className="icon-btn" onClick={backToList}>←</button>
                <span>{openUser.name}</span>
              </>
            ) : (
              <span>Messages {totalUnread > 0 && <em>({totalUnread} unread)</em>}</span>
            )}
            <button className="icon-btn" onClick={toggleWidget}>✕</button>
          </header>

          {!openUser ? (
            // Contact list with per-person unread badges
            <div className="chat-panel-contacts">
              {contacts.length === 0 && <p className="muted center">No contacts yet.</p>}
              {contacts.map((c) => {
                const count = unread[String(c._id)] || 0;
                return (
                  <button
                    key={c._id}
                    className={count ? "contact has-unread" : "contact"}
                    onClick={() => openWith(c)}
                  >
                    <span>{c.avatarUrl ? <img className="avatar" src={c.avatarUrl} alt="" /> : "👤"} {c.username}</span>
                    {count > 0 && <span className="badge">{count}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            // Active conversation
            <>
              <div className="chat-panel-messages">
                {messages.map((m) => {
                  const mine = String(m.sender?._id || m.sender) === String(user._id);
                  return (
                    <div key={m._id || Math.random()} className={mine ? "bubble mine" : "bubble"}>
                      {m.text}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form className="chat-panel-input" onSubmit={onSend}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" autoFocus />
                <button className="btn btn-small">Send</button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
