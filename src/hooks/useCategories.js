import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories.js";

const COLLECTION = "categories";

// Live-subscribes to every category in Firestore. Empty until the admin
// adds categories or clicks "Load default categories" — callers should
// fall back to DEFAULT_CATEGORIES while this is empty/loading.
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTION),
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { categories, loading };
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `cat-${Date.now()}`;
}

// Admin-only writes. Firestore security rules re-check role === "admin"
// server-side (see firestore.rules), same pattern as products.
// The doc id is the slug (e.g. "cigars") so it matches product.cat
// values directly — if the slug's already taken, a numeric suffix is
// appended so two categories never collide.
export async function createCategory({ name, blurb, icon, tone }) {
  let id = slugify(name);
  let n = 2;
  while ((await getDoc(doc(db, COLLECTION, id))).exists()) {
    id = `${slugify(name)}-${n++}`;
  }
  await setDoc(doc(db, COLLECTION, id), {
    name,
    blurb: blurb || "",
    icon: icon || "Package",
    tone: tone === "oxblood" ? "oxblood" : "brass",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function seedDefaultCategories() {
  const batch = writeBatch(db);
  DEFAULT_CATEGORIES.forEach((c) => {
    const { id, ...rest } = c;
    batch.set(doc(db, COLLECTION, id), {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
