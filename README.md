# Velvet Hush

A demo storefront (React + Vite + Tailwind) with a companion payment
backend (Express + Stripe). Nothing here is deployed yet — see
"Getting it live" below.

## Project layout

```
velvet-hush-site/
├── src/App.jsx        the storefront (pages, cart, product data)
├── src/main.jsx        React entry point
├── index.html
├── server/server.js    Stripe checkout backend
└── server/.env.example environment variables the backend needs
```

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
