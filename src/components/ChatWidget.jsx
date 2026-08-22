import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChatMessages, useChatThread, sendChatMessage, markThreadRead } from "../hooks/useChat.js";
import ChatThread from "./ChatThread.jsx";

// Floating "Chat with us" button, bottom-right on every page. Signed-out
// visitors get routed to sign in first — a thread is keyed by uid, so
// there's nowhere to store a guest conversation. Only admins can ever
// reply here (enforced in firestore.rules, not just in this UI).
export default function ChatWidget({ user, profile, isAdmin, onRequireAuth }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { messages, loading } = useChatMessages(open && user ? user.uid : null);
  const thread = useChatThread(user ? user.uid : null);
  const unread = !open && thread?.unreadByUser;

  if (isAdmin) return null; // admins use the Admin Panel's Chats tab instead

  const handleToggle = () => {
    if (!user) { onRequireAuth(); return; }
    setOpen((o) => {
      const next = !o;
      if (next) markThreadRead(user.uid, "user");
      return next;
    });
  };

  const handleSend = async ({ text, file }) => {
    setSending(true);
    try {
      await sendChatMessage({
        uid: user.uid,
        sender: "user",
        text,
        file,
        meta: { displayName: profile?.displayName || "", email: user.email || "" },
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-40 bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 h-[70vh] sm:h-[520px] rounded-lg border shadow-2xl flex flex-col overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>Chat with us</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>We typically reply within a day</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1.5 rounded-md" style={{ background: "var(--surface-2)" }}>
              <X size={15} style={{ color: "var(--muted)" }} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatThread
              mode="user"
              messages={messages}
              loading={loading}
              sending={sending}
              onSend={handleSend}
              emptyText="Send us a message and a team member will get back to you here."
            />
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        className="fixed z-40 bottom-5 right-4 sm:right-6 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg"
        style={{ background: "var(--brass)", color: "#1A1520" }}
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="text-sm font-medium">{open ? "Close" : "Chat with us"}</span>
        {unread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2" style={{ background: "var(--oxblood)", borderColor: "var(--bg)" }} />
        )}
      </button>
    </>
  );
}
