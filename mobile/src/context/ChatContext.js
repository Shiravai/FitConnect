// src/context/ChatContext.js — one shared socket + global unread counts (for the chat tab badge).
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getSocket, disconnectSocket } from "../api/socket";
import { messageApi } from "../api/endpoints";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState({}); // { otherUserId: count }
  const activeRef = useRef(null); // the conversation currently open on screen

  // Tell the context which conversation is open so it doesn't badge it.
  const setActiveUser = (id) => {
    activeRef.current = id ? String(id) : null;
    if (id) {
      setUnread((prev) => {
        const next = { ...prev };
        delete next[String(id)];
        return next;
      });
    }
  };

  const refreshUnread = () =>
    messageApi.unread().then((d) => setUnread(d.byUser || {})).catch(() => {});

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setUnread({});
      return;
    }
    const socket = getSocket();
    refreshUnread();

    const onMessage = (msg) => {
      const myId = String(user._id);
      const senderId = String(msg.sender?._id || msg.sender);
      if (senderId === myId) return;
      const otherId = senderId;
      if (activeRef.current === otherId) return; // user is reading this chat
      setUnread((prev) => ({ ...prev, [otherId]: (prev[otherId] || 0) + 1 }));
    };

    socket.on("chat:message", onMessage);
    socket.on("connect", refreshUnread);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("connect", refreshUnread);
    };
  }, [user]);

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  return (
    <ChatContext.Provider value={{ unread, totalUnread, setActiveUser, refreshUnread }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
