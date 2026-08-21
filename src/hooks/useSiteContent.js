import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

const COLLECTION = "content";

// Live-subscribes to one editable content doc, e.g. content/contact or
// content/about. `content` is null until the admin saves it for the
// first time — callers should render sensible defaults until then.
export function useSiteContent(id) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, COLLECTION, id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setContent(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [id]);

  return { content, loading };
}

// Admin-only write. Firestore security rules re-check role === "admin"
// server-side (see firestore.rules), same pattern as products.
export async function updateSiteContent(id, data) {
  return setDoc(
    doc(db, COLLECTION, id),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
