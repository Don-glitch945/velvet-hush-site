import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const COLLECTION = "users";

// Admin-only: live list of every registered user, for the admin panel's
// balance-management table. Firestore rules only allow this read for
// docs whose own role is "admin" (see firestore.rules).
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTION),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { users, loading };
}

export async function setUserBalance(uid, balance) {
  return updateDoc(doc(db, COLLECTION, uid), { balance: Number(balance) });
}

export async function adjustUserBalance(uid, currentBalance, delta) {
  return updateDoc(doc(db, COLLECTION, uid), {
    balance: Number(currentBalance) + Number(delta),
  });
}

export async function setUserRole(uid, role) {
  return updateDoc(doc(db, COLLECTION, uid), { role });
}
