import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, setDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const MESSAGES = "chats";
const THREADS = "chatThreads";

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB — keep in sync with the max size set on the Cloudinary upload preset
export const ALLOWED_FILE_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
];
// Shown in the file picker + used for the friendly validation message.
export const ACCEPT_ATTR = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip";

export function validateChatFile(file) {
  if (!file) return null;
  if (file.size > MAX_FILE_BYTES) return "That file is over the 15MB limit.";
  if (ALLOWED_FILE_TYPES.length && !ALLOWED_FILE_TYPES.includes(file.type)) {
    return "That file type isn't supported. Try an image, PDF, Office doc, text, or zip file.";
  }
  return null;
}

// Live-subscribes to one support thread's messages, oldest first.
// Used both by the customer widget (their own uid) and the admin inbox
// (whichever customer's thread is open) — Firestore rules decide who's
// actually allowed to see what.
export function useChatMessages(uid) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) { setMessages([]); return; }
    setLoading(true);
    const q = query(collection(db, MESSAGES), where("uid", "==", uid), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => { setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false)
    );
    return unsub;
  }, [uid]);

  return { messages, loading };
}

// Admin-only: live list of every customer's chat thread, most recently
// active first, for the admin panel's inbox list.
export function useChatThreads(enabled) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) { setThreads([]); return; }
    setLoading(true);
    const q = query(collection(db, THREADS), orderBy("lastMessageAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => { setThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false)
    );
    return unsub;
  }, [enabled]);

  return { threads, loading };
}

// Live-subscribes to a single thread summary doc — used by the widget
// to show an unread dot on the launcher button without loading every
// message up front.
export function useChatThread(uid) {
  const [thread, setThread] = useState(null);

  useEffect(() => {
    if (!uid) { setThread(null); return; }
    const unsub = onSnapshot(doc(db, THREADS, uid), (snap) => {
      setThread(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [uid]);

  return thread;
}

// Uploads to Cloudinary's free tier via an *unsigned* upload preset —
// no backend and no billing card needed, unlike Firebase Storage (which
// now requires the paid Blaze plan for any usage at all, even $0 of it).
// Trade-off worth knowing: an unsigned preset means the returned URL is
// publicly viewable by anyone who has it (no per-user access control
// the way Firestore/Storage rules gave us) — fine for casual chat
// attachments, but don't treat these links as private.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadChatFile(uid, file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("File uploads aren't configured yet — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  form.append("folder", `chat-uploads/${uid}`);

  // "auto" so this one endpoint accepts both images and raw documents
  // (pdf/docx/xlsx/txt/csv/zip) without picking a resource_type per file.
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Upload failed.");

  return { url: data.secure_url, name: file.name, type: file.type };
}

// Sends one message + optional attachment, then upserts the thread
// summary doc. `sender` is "user" or "admin" — Firestore rules reject
// any "admin" write from a non-admin account, which is what actually
// makes "only admins can reply" a real guarantee rather than just a UI
// convention.
export async function sendChatMessage({ uid, sender, text, file, meta }) {
  let attachment = null;
  if (file) attachment = await uploadChatFile(uid, file);

  await addDoc(collection(db, MESSAGES), {
    uid,
    sender,
    text: text?.trim() || "",
    fileUrl: attachment?.url || null,
    fileName: attachment?.name || null,
    fileType: attachment?.type || null,
    createdAt: serverTimestamp(),
  });

  const preview = text?.trim() || (attachment ? `📎 ${attachment.name}` : "");
  await setDoc(
    doc(db, THREADS, uid),
    {
      uid,
      ...(meta || {}),
      lastMessage: preview,
      lastMessageAt: serverTimestamp(),
      lastSender: sender,
      unreadByAdmin: sender === "user",
      unreadByUser: sender === "admin",
    },
    { merge: true }
  );
}

export async function markThreadRead(uid, as) {
  const field = as === "admin" ? "unreadByAdmin" : "unreadByUser";
  return setDoc(doc(db, THREADS, uid), { [field]: false }, { merge: true });
}
