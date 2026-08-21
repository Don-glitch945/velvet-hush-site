import { Flame, Wind, Droplet, Gem, Wrench, Package, Sparkles, Star, Heart, Leaf, ShoppingBag } from "lucide-react";

// Categories are stored in Firestore with `icon` as a string key (icons
// aren't serializable), so this maps that key back to the actual lucide
// component for rendering. Used by both the storefront and the admin
// panel's category editor (so the <select> options line up with what
// actually renders).
export const ICON_MAP = {
  Flame,
  Wind,
  Droplet,
  Gem,
  Wrench,
  Package,
  Sparkles,
  Star,
  Heart,
  Leaf,
  ShoppingBag,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);

export function resolveIcon(key) {
  return ICON_MAP[key] || Package;
}
