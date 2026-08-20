// This is the original demo catalog that used to live directly inside
// App.jsx. It's no longer read by the storefront at runtime — products
// now live in Firestore (see hooks/useProducts.js) so the admin panel
// can edit price / stock / availability / images. This array is kept
// around purely as one-click seed data (Admin Panel → "Load demo
// catalog") for a brand new Firestore project that has no products yet.
export const SEED_PRODUCTS = [
  { id: "c1", cat: "cigars", name: "Ceniza Robusto", price: 14, note: "Nicaraguan wrapper, cedar & cocoa finish", pattern: "stripe", stock: 24, available: true },
  { id: "c2", cat: "cigars", name: "Vestidor Toro", price: 19, note: "Dominican blend, slow burn, pepper close", pattern: "grid", stock: 18, available: true },
  { id: "c3", cat: "cigars", name: "Humo Corona", price: 11, note: "Connecticut shade, mellow and creamy", pattern: "dots", stock: 30, available: true },
  { id: "v1", cat: "vapes", name: "Ember Mini Pen", price: 29, note: "1200mAh, 3 heat settings, USB-C", pattern: "grid", stock: 12, available: true },
  { id: "v2", cat: "vapes", name: "Halo Pod Kit", price: 34, note: "Refillable pods, ceramic coil", pattern: "stripe", stock: 15, available: true },
  { id: "v3", cat: "vapes", name: "Drift Disposable 3-Pack", price: 22, note: "600 puffs each, five profiles", pattern: "dots", stock: 20, available: true },
  { id: "g1", cat: "glass", name: "Amber Spoon Pipe", price: 38, note: "Hand-blown borosilicate, honeycomb base", pattern: "dots", stock: 9, available: true },
  { id: "g2", cat: "glass", name: "Smoked Quartz Bubbler", price: 65, note: "Water-cooled, removable downstem", pattern: "grid", stock: 5, available: true },
  { id: "g3", cat: "glass", name: "Onyx Chillum", price: 21, note: "Compact, pocket case included", pattern: "stripe", stock: 17, available: true },
  { id: "l1", cat: "lubricants", name: "Silk Water-Based 4oz", price: 16, note: "Glycerin-free, toy-safe, unscented", pattern: "dots", stock: 40, available: true },
  { id: "l2", cat: "lubricants", name: "Ember Warming Gel", price: 18, note: "Aloe base, long-lasting glide", pattern: "stripe", stock: 33, available: true },
  { id: "l3", cat: "lubricants", name: "Silicone Reserve 8oz", price: 24, note: "Ultra-long-lasting, condom-compatible", pattern: "grid", stock: 28, available: true },
  { id: "t1", cat: "intimacy", name: "Aria Wand", price: 89, note: "Whisper-quiet motor, 8 patterns, USB-C", pattern: "grid", stock: 11, available: true },
  { id: "t2", cat: "intimacy", name: "Nocturne Set", price: 64, note: "Two-piece couples set, medical silicone", pattern: "dots", stock: 8, available: true },
  { id: "t3", cat: "intimacy", name: "Velvet Cuffs", price: 32, note: "Adjustable, quick-release clasp", pattern: "stripe", stock: 14, available: true },
  { id: "x1", cat: "tools", name: "Brass Torch Lighter", price: 24, note: "Windproof triple-flame, refillable", pattern: "stripe", stock: 22, available: true },
  { id: "x2", cat: "tools", name: "Walnut Grinder 4-Piece", price: 27, note: "Sharp teeth, pollen catcher included", pattern: "dots", stock: 19, available: true },
  { id: "x3", cat: "tools", name: "Hemp Rolling Papers 3-Pack", price: 6, note: "Unbleached, slow burn, natural gum", pattern: "grid", stock: 60, available: true },
  { id: "x4", cat: "tools", name: "Glass Cleaning Kit", price: 15, note: "Reusable pipe cleaners and solution", pattern: "stripe", stock: 26, available: true },
];
