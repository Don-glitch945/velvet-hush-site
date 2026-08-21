import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase.js";

const AuthContext = createContext(null);

// New accounts land here. Nobody can grant themselves "admin" — that
// field can only ever be changed by someone whose OWN Firestore doc
// already has role: "admin" (enforced in firestore.rules, not just
// in this client code).
const DEFAULT_ROLE = "customer";
const DEFAULT_BALANCE = 0;

async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "Customer",
      role: DEFAULT_ROLE,
      balance: DEFAULT_BALANCE,
      createdAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setAuthLoading(false);
      if (!fbUser) {
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  // Live-subscribe to the user's own Firestore doc so balance/role
  // changes made by an admin show up without a page refresh.
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setProfileLoading(false);
      },
      () => setProfileLoading(false)
    );
    return unsub;
  }, [user?.uid]);

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await ensureUserDoc(cred.user);
    return cred.user;
  };

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await ensureUserDoc(cred.user);
    return cred.user;
  };

  const logOut = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Firebase requires a "recent login" before it'll let you change a
  // password, so we re-authenticate with the current password first.
  // This only works for email/password accounts — Google-only accounts
  // don't have a Firebase password to change.
  const changePassword = async (currentPassword, newPassword) => {
    const current = auth.currentUser;
    if (!current || !current.email) throw new Error("Not signed in.");
    const credential = EmailAuthProvider.credential(current.email, currentPassword);
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, newPassword);
  };

  // Updates the display name both on the Firebase Auth user record and
  // on the Firestore profile doc (the latter is what the UI actually
  // renders from, via the live onSnapshot subscription above).
  const updateDisplayName = async (displayName) => {
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in.");
    const trimmed = (displayName || "").trim();
    if (!trimmed) throw new Error("Username can't be empty.");
    await updateProfile(current, { displayName: trimmed });
    await updateDoc(doc(db, "users", current.uid), { displayName: trimmed });
  };

  // Delivery address lives on the user's own Firestore doc. Firestore
  // rules allow a signed-in user to update any field on their own doc
  // except role/balance, so this is a plain merge-style update.
  const updateDeliveryAddress = async (address) => {
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in.");
    await updateDoc(doc(db, "users", current.uid), { address });
  };

  const value = {
    user,
    profile,
    isAdmin: profile?.role === "admin",
    loading: authLoading || profileLoading,
    signUp,
    signIn,
    signInGoogle,
    logOut,
    resetPassword,
    changePassword,
    updateDisplayName,
    updateDeliveryAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
