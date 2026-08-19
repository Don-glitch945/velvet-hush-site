/**
 * Payment integration sketch — Velvet Hush
 * -----------------------------------------
 * Covers checkout for the categories mainstream processors allow:
 * lubricants, adult toys, tools & accessories.
 *
 * Cigars / vapes / glass are NOT included here — Stripe, PayPal, and
 * Square all prohibit those categories outright. Those would route
 * through a separate high-risk gateway (Authorize.net high-risk tier,
 * PayKings, NMI, etc.) with a near-identical pattern: create a session
 * server-side, redirect the customer, verify the result via webhook.
 *
 * Install: npm install express stripe dotenv
 * Run:     node server.js
 */

require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// Server-side source of truth for prices — NEVER trust prices sent
// from the browser. The client only ever sends product IDs + quantities.
const PRODUCT_CATALOG = {
  l1: { name: "Silk Water-Based 4oz", price: 1600, restricted: false }, // price in cents
  l2: { name: "Ember Warming Gel", price: 1800, restricted: false },
  l3: { name: "Silicone Reserve 8oz", price: 2400, restricted: false },
  t1: { name: "Aria Wand", price: 8900, restricted: false },
  t2: { name: "Nocturne Set", price: 6400, restricted: false },
  t3: { name: "Velvet Cuffs", price: 3200, restricted: false },
  x1: { name: "Brass Torch Lighter", price: 2400, restricted: false },
  x2: { name: "Walnut Grinder 4-Piece", price: 2700, restricted: false },
  x3: { name: "Hemp Rolling Papers 3-Pack", price: 600, restricted: false },
  x4: { name: "Glass Cleaning Kit", price: 1500, restricted: false },
  // cigars / vapes / glass intentionally omitted — route those to the
  // high-risk gateway instead of Stripe.
};

app.use(express.json());

/**
 * 1. Client sends { items: [{ id, qty }, ...] } from the cart.
 * 2. Server rebuilds the order from the trusted catalog, rejects
 *    anything in a restricted category, and creates a Stripe
 *    Checkout Session.
 * 3. Client redirects the browser to session.url.
 */
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body; // [{ id: "l1", qty: 2 }, ...]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const line_items = items.map(({ id, qty }) => {
      const product = PRODUCT_CATALOG[id];
      if (!product) throw new Error(`Unknown product: ${id}`);
      if (product.restricted) {
        throw new Error(`${product.name} must be processed through the high-risk gateway, not Stripe.`);
      }
      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity: Math.max(1, Number(qty) || 1),
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Stripe Checkout handles card entry itself — the card number
      // never touches your server, which keeps you out of PCI scope.
      success_url: `${process.env.SITE_URL}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cart`,
      // Age-restricted goods: Stripe doesn't do ID verification.
      // For real age gating at checkout, pair this with a service like
      // Stripe Identity, Veriff, or Persona before allowing purchase.
      metadata: { order_source: "velvet-hush-web" },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * Stripe webhook — the source of truth for "did this order actually
 * get paid." Never mark an order as paid just because the browser
 * redirected to your success_url; confirm it here instead.
 *
 * Requires the raw request body, so this route uses express.raw()
 * instead of the express.json() applied globally above.
 */
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // TODO: mark the order paid in your database, trigger
      // fulfillment/shipping, send the confirmation email.
      console.log("Order paid:", session.id, session.amount_total);
    }

    res.json({ received: true });
  }
);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Payment server running on :${port}`));
