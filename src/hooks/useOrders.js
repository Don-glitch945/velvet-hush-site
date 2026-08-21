import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const COLLECTION = "orders";

// Live-subscribes to the signed-in user's own orders, newest first.
// Orders are written server-side (by the checkout/payment webhook,
// using the Admin SDK) once a payment actually completes — nothing in
// the client ever creates one. Firestore rules only let a user read
// docs where `uid` matches their own auth uid (or let an admin read
// any), so this naturally returns nothing for signed-out visitors.
export function useOrders(user) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, COLLECTION),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user?.uid]);

  return { orders, loading };
}
