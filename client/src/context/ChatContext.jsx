// src/context/ChatContext.jsx — shared chat state for the whole app:
// a single Socket.io connection, unread counts, and the active conversation.
// This powers the floating chat widget that works on every page.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getSocket, disconnectSocket } from "../api/socket";
import { messageApi } from "../api/endpoints";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [unread, setUnread] = useState({});       // { otherUserId: count }
  const [openUser, setOpenUser] = useState(null);  // contact we're chatting with
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  // Refs let the socket handler read the latest values without re-subscribing.
  const openUserRef = useRef(null);
  const widgetOpenRef = useRef(false);
  const contactsRef = useRef([]);
  const socketRef = useRef(null);

  useEffect(() => { openUserRef.current = openUser; }, [openUser]);
  useEffect(() => { widgetOpenRef.current = widgetOpen; }, [widgetOpen]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);

  // Open a conversation: load history, mark read, clear its unread badge.
  const openWith = async (contact) => {
    setOpenUser(contact);
    setWidgetOpen(true);
    setUnread((prev) => {
      const next = { ...prev };
      delete next[String(contact._id)];
      return next;
    });
    socketRef.current?.emit("chat:join", { otherUserId: contact._id });
    try {
      const { messages } = await messageApi.history(contact._id);
      setMessages(messages);
    } catch {
      setMessages([]);
    }
  };

  // Connect the socket and load initial data once the user is logged in.
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      socketRef.current = null;
      setUnread({}); setOpenUser(null); setWidgetOpen(false); setMessages([]);
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;
    messageApi.contacts().then(setContacts).catch(() => {});

    // Pull the latest unread counts from the server (also re-run on every reconnect,
    // so the red badge stays correct even if a message arrived while disconnected).
    const refreshUnread = () =>
      messageApi.unread().then((d) => setUnread(d.byUser || {})).catch(() => {});
    refreshUnread();

    const onMessage = (msg) => {
      const myId = String(user._id);
      const senderId = String(msg.sender?._id || msg.sender);
      const otherId = senderId === myId ? String(msg.to) : senderId;

      // Is this message part of the conversation currently open on screen?
      const viewingThisChat =
        widgetOpenRef.current && openUserRef.current && String(openUserRef.current._id) === otherId;

      if (viewingThisChat) {
        // Conversation is open -> append it and mark it read.
        setMessages((prev) => [...prev, msg]);
        if (senderId !== myId) messageApi.markRead(otherId).catch(() => {});
      } else if (senderId !== myId) {
        // Message arrived while the user is elsewhere -> raise the red unread badge.
        setUnread((prev) => ({ ...prev, [otherId]: (prev[otherId] || 0) + 1 }));
      }
    };

    socket.on("chat:message", onMessage);
    socket.on("connect", refreshUnread);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("connect", refreshUnread);
    };
  }, [user]);

  const send = (text) => {
    if (!text.trim() || !openUserRef.current) return;
    socketRef.current?.emit("chat:message", { otherUserId: openUserRef.current._id, text });
  };

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  const value = {
    contacts, unread, totalUnread, openUser, widgetOpen, messages,
    openWith,
    backToList: () => setOpenUser(null),
    send,
    toggleWidget: () => setWidgetOpen((o) => !o),
    closeWidget: () => setWidgetOpen(false),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
