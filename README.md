# Velvet Hush

A demo storefront (React + Vite + Tailwind) with Firebase-backed login
and an admin panel, plus a companion payment backend (Express +
Stripe) that isn't wired to the admin panel yet. Nothing here is
deployed yet — see "Getting it live" below.

## Project layout

```
velvet-hush-site/
├── src/App.jsx                    the storefront (pages, cart, checkout)
├── src/main.jsx                   React entry point (wraps app in AuthProvider)
├── src/firebase.js                Firebase app/auth/firestore init
├── src/contexts/AuthContext.jsx   signed-in user + their Firestore profile (role, balance)
├── src/hooks/useProducts.js       live product catalog (read) + admin CRUD (write)
├── src/hooks/useUsers.js          admin: list users, edit role/balance
├── src/components/AuthModal.jsx   sign in / register (email+password, Google)
├── src/components/AdminPanel.jsx  admin UI: products tab + users/balances tab
├── src/data/seedProducts.js       original demo catalog, used only as one-click seed data
├── firestore.rules                security rules (admin-only writes, enforced server-side)
├── index.html
├── server/server.js               Stripe checkout backend (unrelated to Firebase)
└── server/.env.example            environment variables the backend needs
```

## Firebase setup

You said you already created a Firebase project, so:

1. **Enable Authentication providers** — Firebase Console → your
   project → Build → Authentication → Sign-in method → enable
   **Email/Password** and **Google**.
2. **Create a Firestore database** — Build → Firestore Database →
   Create database → start in production mode (the rules below
   replace the defaults) → pick a region.
3. **Get your web app config** — Project settings (gear icon) →
   General → scroll to "Your apps" → if you don't have a web app yet,
   click **</>** to register one → copy the `firebaseConfig` values.
4. **Set up your `.env`**:
   ```bash
   cp .env.example .env
   # then paste the six VITE_FIREBASE_* values from step 3
   ```
5. **Deploy the security rules** — these are what actually enforce
   "only admins can edit products/balances" (the UI hides buttons,
   but the rules are what stop someone from calling the API directly).
   Easiest path, using the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point it at this project, keep existing firestore.rules
   firebase deploy --only firestore:rules
   ```
   Or just paste the contents of `firestore.rules` into Firebase
   Console → Firestore Database → Rules → publish.
6. **Load the product catalog** — once the app is running, sign up
   for an account, make yourself admin (next section), open
   **Admin Panel → Products**, and click **"Load demo catalog"** to
   seed the original 19 products into Firestore. From then on you can
   edit price/stock/availability/image per product, or add new ones.

### Making your first admin

The security rules only let an *existing* admin promote someone else
— which means the very first admin has to be set by hand, once:

1. Sign up for an account normally on the running site.
2. Firebase Console → Firestore Database → `users` collection → find
   the document with your `uid` → edit the `role` field from
   `"customer"` to `"admin"`.
3. Refresh the site — you'll see **Admin Panel** in your account menu.
   From there you can promote/demote any other user's role too.

### About balances

Admins can set a customer's `balance` field from the Users tab. This
is just a number in Firestore right now — it isn't connected to
Stripe or spent at checkout yet, since you said to set up payments
later. When you're ready to wire it in, the natural place is inside
the `/api/create-checkout-session` flow in `server/server.js`,
checking/decrementing balance server-side (via the Firebase Admin
SDK) before creating the Stripe session.

## Run it locally

```bash
# frontend
npm install
npm run dev              # → http://localhost:5173

# backend (separate terminal)
cd server
npm install
cp .env.example .env     # then fill in real Stripe keys
npm start                # → http://localhost:4000
```

The cart's checkout button now calls the backend for real (for
lubricants/toys/tools — cigars/vapes/glass are held back with an
explanatory message, since Stripe can't process those). Copy
`.env.example` to `.env` in the project root and set `VITE_API_URL`
to wherever the backend is running (`http://localhost:4000` for
local dev, your Render URL once deployed).

## Getting it live

### 1. Frontend → Vercel (or Netlify / Cloudflare Pages)
- Push this folder to a GitHub repo.
- Import it in Vercel → it auto-detects Vite → deploy.
- Add the six `VITE_FIREBASE_*` variables (and `VITE_API_URL`) under
  Project Settings → Environment Variables — the `.env` file itself
  never gets committed or deployed.
- In Firebase Console → Authentication → Settings → **Authorized
  domains**, add your `*.vercel.app` URL (and later your custom
  domain) or sign-in will fail on the deployed site.
- You get a `*.vercel.app` URL immediately; add your own domain under
  Project Settings → Domains once you own one.

### 2. Backend → Render (or Railway / Fly.io)
- New Web Service → point at the `server/` folder.
- Build command: `npm install`. Start command: `npm start`.
- Add the real environment variables from `.env.example` in the
  host's dashboard — never commit actual keys to the repo.
- You'll get a `*.onrender.com` URL — that's what the frontend's
  `fetch("/api/create-checkout-session")` needs to point at (or put
  both behind the same domain with a reverse proxy/rewrite).

### 3. Domain
- Buy one (Namecheap, Cloudflare Registrar, Google Domains successor,
  etc.), point its DNS at Vercel per their instructions.

### 4. Before going live with these specific products
- Confirm your hosting provider and domain registrar's terms allow
  tobacco/vape and adult-product sales — some explicitly prohibit it.
- Cigars, vapes, and glass/pipes are not payable through Stripe,
  PayPal, or Square. Get a high-risk merchant account (e.g.
  Authorize.net high-risk tier, PayKings, NMI) for those categories.
- Add real age/ID verification — the current checkbox gate is
  demo-only.
- Check state/country-level rules for shipping tobacco, vape, and
  adult products — they vary a lot and some jurisdictions ban it
  outright.
