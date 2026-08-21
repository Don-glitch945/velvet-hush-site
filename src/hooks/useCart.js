import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

const COLLECTION = "carts";

// Per-account cart, stored in Firestore at carts/{uid} so a shopper's
// cart follows them across devices and sign-ins. Signed-out visitors
// still get a normal in-memory cart (nothing to persist without an
// account) — the first time they sign in, whatever is already in that
// local cart is merged into their saved cart rather than discarded.
export function useCart(user) {
  const [cart, setCartState] = useState({});
  const [loading, setLoading] = useState(false);
  const hasMergedRef = useRef(false);
  const localCartRef = useRef({});

  // Track the latest cart in a ref so the merge-on-sign-in step can
  // read whatever the guest had queued up without retriggering itself.
  useEffect(() => {
    localCartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    if (!user) {
      hasMergedRef.current = false;
      setCartState({});
      return;
    }

    setLoading(true);
    const ref = doc(db, COLLECTION, user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const remote = snap.exists() ? snap.data().items || {} : {};

        if (!hasMergedRef.current) {
          hasMergedRef.current = true;
          const guest = localCartRef.current;
          const merged = { ...remote };
          Object.entries(guest).forEach(([id, qty]) => {
            merged[id] = (merged[id] || 0) + qty;
          });
          setCartState(merged);
          if (Object.keys(guest).length > 0) {
            setDoc(ref, { items: merged, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
          }
        } else {
          setCartState(remote);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user?.uid]);

  // Mirrors the setState updater API (accepts either a value or a
  // `prev => next` function) so callers don't have to change how they
  // call it — the only difference is this also persists to Firestore
  // for signed-in users.
  const setCart = (updater) => {
    setCartState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (user) {
        setDoc(doc(db, COLLECTION, user.uid), { items: next, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
      }
      return next;
    });
  };

  return { cart, setCart, loading };
}
