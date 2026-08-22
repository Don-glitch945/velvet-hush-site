import React, { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { validateChatFile, ACCEPT_ATTR } from "../hooks/useChat.js";

function formatTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function Attachment({ fileUrl, fileName, fileType }) {
  if (!fileUrl) return null;
  if (fileType?.startsWith("image/")) {
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className="block mt-2 rounded-md overflow-hidden max-w-[220px]">
        <img src={fileUrl} alt={fileName || "attachment"} className="w-full h-auto" />
      </a>
    );
  }
  return (
    <a
      href={fileUrl} target="_blank" rel="noreferrer"
      className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md text-xs max-w-[220px]"
      style={{ background: "var(--surface-2)", color: "var(--ink)" }}
    >
      <FileText size={14} style={{ color: "var(--brass)" }} className="shrink-0" />
      <span className="truncate">{fileName || "Attachment"}</span>
    </a>
  );
}

// mode "user": customer's own bubbles sit on the right, admin's on the left.
// mode "admin": admin's own bubbles sit on the right, customer's on the left.
export default function ChatThread({ mode, messages, loading, onSend, sending, emptyText, disabled, disabledText }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const err = validateChatFile(f);
    if (err) { setFileError(err); setFile(null); return; }
    setFileError(null);
    setFile(f);
  };

  const submit = async () => {
    if (disabled || sending) return;
    if (!text.trim() && !file) return;
    await onSend({ text: text.trim(), file });
    setText("");
    setFile(null);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>{emptyText}</p>
        ) : (
          messages.map((m) => {
            const mine = mode === "user" ? m.sender === "user" : m.sender === "admin";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] rounded-lg px-3 py-2"
                  style={{
                    background: mine ? "var(--brass)" : "var(--surface-2)",
                    color: mine ? "#1A1520" : "var(--ink)",
                  }}
                >
                  {!mine && mode === "admin" && (
                    <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Customer</p>
                  )}
                  {!mine && mode === "user" && (
                    <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--brass)" }}>Support</p>
                  )}
                  {m.text && <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>}
                  <Attachment fileUrl={m.fileUrl} fileName={m.fileName} fileType={m.fileType} />
                  <p className="text-[10px] mt-1 text-right" style={{ color: mine ? "#1A1520AA" : "var(--muted)" }}>{formatTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t px-3 py-3" style={{ borderColor: "var(--border)" }}>
        {disabled ? (
          <p className="text-xs text-center py-1" style={{ color: "var(--muted)" }}>{disabledText}</p>
        ) : (
          <>
            {file && (
              <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-md text-xs" style={{ background: "var(--surface-2)" }}>
                {file.type?.startsWith("image/") ? <ImageIcon size={13} style={{ color: "var(--brass)" }} /> : <FileText size={13} style={{ color: "var(--brass)" }} />}
                <span className="truncate flex-1" style={{ color: "var(--ink)" }}>{file.name}</span>
                <button onClick={() => setFile(null)} aria-label="Remove attachment"><X size={13} style={{ color: "var(--muted)" }} /></button>
              </div>
            )}
            {fileError && <p className="text-xs mb-2" style={{ color: "var(--oxblood)" }}>{fileError}</p>}
            <div className="flex items-end gap-2">
              <input ref={fileInputRef} type="file" accept={ACCEPT_ATTR} className="hidden" onChange={pickFile} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-md shrink-0"
                style={{ background: "var(--surface-2)" }}
                aria-label="Attach image or document"
                title="Attach image or document"
              >
                <Paperclip size={16} style={{ color: "var(--muted)" }} />
              </button>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={mode === "admin" ? "Reply to customer…" : "Type a message…"}
                className="flex-1 resize-none px-3 py-2.5 rounded-md border text-sm outline-none max-h-24"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--ink)" }}
              />
              <button
                onClick={submit}
                disabled={sending || (!text.trim() && !file)}
                className="p-2.5 rounded-md shrink-0"
                style={{ background: (text.trim() || file) ? "var(--brass)" : "var(--surface-2)", color: (text.trim() || file) ? "#1A1520" : "var(--muted)" }}
                aria-label="Send"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
