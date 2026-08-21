// Fallback catalog shown before the admin has added any categories in
// Firestore (and used as the "Load default categories" seed button in
// the admin panel). Once the `categories` collection has documents,
// those take over completely — this file is never read at that point.
export const DEFAULT_CATEGORIES = [
  { id: "cigars", name: "Cigars", icon: "Flame", tone: "brass", blurb: "Hand-rolled, slow-cured, built for the long pour." },
  { id: "vapes", name: "Vape Pens", icon: "Wind", tone: "brass", blurb: "Clean hits, discreet builds, all-day batteries." },
  { id: "glass", name: "Glass & Pipes", icon: "Gem", tone: "brass", blurb: "Hand-blown pieces, small-batch, no two alike." },
  { id: "lubricants", name: "Lubricants", icon: "Droplet", tone: "oxblood", blurb: "Body-safe formulas for every kind of night." },
  { id: "intimacy", name: "Adult Toys", icon: "Gem", tone: "oxblood", blurb: "Considered design, quiet packaging, discreet shipping." },
  { id: "tools", name: "Tools & Accessories", icon: "Wrench", tone: "brass", blurb: "Grinders, lighters, papers, and cleaning kits." },
];
