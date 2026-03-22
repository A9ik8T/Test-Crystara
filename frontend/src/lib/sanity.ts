import { createClient } from "@sanity/client";

// ─── FIX #2: Sanity secret key was exposed in frontend code ───────────────────
// BEFORE: token: import.meta.env.VITE_SANITY_TOKEN  ← visible in browser DevTools
// FIX:    Remove the token entirely for the public read-only client.
//         The write token must ONLY live on your backend server, never in frontend code.
//
// ─── FIX #8: Use CDN for faster product loading ───────────────────────────────
// BEFORE: useCdn: false  ← every request goes to Sanity's US origin server
// FIX:    useCdn: true   ← requests served from the nearest CDN edge node (India CDN
//         for your customers) — significantly faster page loads on mobile.
//
// NOTE: CDN data can be ~60 seconds stale. For a product catalogue this is fine.
// If you need real-time data (e.g. stock counts), keep useCdn: false for those
// specific queries by passing `{ useCdn: false }` per-query.

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_ID,
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,       // ✅ uses nearest CDN edge – much faster for Indian users
  // token intentionally removed – read-only queries don't need it
  // NEVER put VITE_SANITY_TOKEN here; any VITE_ variable is bundled into
  // the public JS and visible to anyone who opens Chrome DevTools → Sources.
});

// If you have queries that genuinely need authentication (e.g. drafts preview),
// create a separate server-side client in your Express backend using
// process.env.SANITY_TOKEN (no VITE_ prefix = not exposed to the browser).
