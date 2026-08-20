import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { SEED_PRODUCTS } from "../data/seedProducts.js";

const COLLECTION = "products";

// Live-subscribes to every product in Firestore. Used by both the
// public storefront (read-only) and the admin panel (read + write).
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTION),
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { products, loading };
}

// Admin-only writes. Firestore security rules re-check role === "admin"
// server-side, so these calls fail closed for anyone else even if they
// somehow triggered them.
export async function createProduct(data) {
  return addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(id, data) {
  return updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}

// One-click "Load demo catalog" button for a fresh Firestore project
// that has zero products yet. Writes the original 19 demo items using
// their original fixed ids (c1, v1, l1, ...) so they line up with the
// ids already referenced in server/server.js's PRODUCT_CATALOG.
export async function seedDemoCatalog() {
  const batch = writeBatch(db);
  SEED_PRODUCTS.forEach((p) => {
    const { id, ...rest } = p;
    batch.set(doc(db, COLLECTION, id), {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
