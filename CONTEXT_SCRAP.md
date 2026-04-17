# CHOKKA WEBSITE — CONTEXT SCRAP
Last updated: April 2026

---

## WHAT THIS PROJECT IS

Chokka Collectives BD — an e-commerce site selling Bangladeshi card games.
Built with React 19 + Vite (client), Express 5 (server on Render.com), Supabase (PostgreSQL), HashRouter, Framer Motion, GSAP + ScrollTrigger, Tailwind CSS 3.

---

## GAMES & PRODUCT IDs (CRITICAL — never change these)

| ID | Product             | Price | Delivery Dhaka | Delivery Outside |
|----|---------------------|-------|----------------|------------------|
| 1  | The Syndicate       | 360৳  | 80৳            | 80৳              |
| 2  | Tong                | 500৳  | 80৳            | 80৳              |
| 4  | Sholo Ana           | 420৳  | 80৳            | 80৳              |
| 3  | Bundle: Syn + Tong  | 800৳  | 0 (incl.)      | 0 (incl.)        |
| 5  | Bundle: Syn + Sholo | 800৳  | 0 (incl.)      | 0 (incl.)        |
| 6  | Bundle: Tong+Sholo  | 850৳  | 0 (incl.)      | 0 (incl.)        |
| 7  | Complete Collection | 1099৳ | 0 (incl.)      | 0 (incl.)        |

Product ID 3 was skipped (legacy). Sholo Ana is ID 4, not 3.
Bundles have delivery_dhaka = 0 and delivery_outside = 0 (delivery always included).

---

## BIG UPDATE — WHAT WAS BUILT

### New Files Created
- `client/src/context/CartContext.jsx` — React context for cart state with localStorage persistence
- `client/src/components/SholoAnaShowcase.jsx` — Sholo Ana section on HomePage
- `client/src/components/BundlesSection.jsx` — Bundles section on HomePage
- `client/public/cards/sholo-ana/hero.webp` — Hero card image (upload via git push)
- `client/public/cards/sholo-ana/front-1.webp` through `front-6.webp` — Showcase cards

### Modified Files
- `client/src/App.jsx` — Added CartProvider wrapper, Sholo Ana route, SHOLO_ANA_DATA config
- `client/src/pages/HomePage.jsx` — Full rewrite with cart flow, Buy Now flow, all showcases + bundles
- `client/src/components/GlassNavbar.jsx` — Cart badge with live quantity count, nav links for Sholo Ana + Bundles
- `client/src/components/CartDrawer.jsx` — Real cart (was dummy), quantity selectors, bundle upsell nudge, product images
- `client/src/components/CheckoutModal.jsx` — Dual-mode (Buy Now vs Cart), upsell, product images
- `client/src/components/SyndicateShowcase.jsx` — Added Buy Now button + onBuyNow prop
- `client/src/components/TongShowcase.jsx` — Added Buy Now button + onBuyNow prop
- `client/src/components/HeroSection.jsx` — Added 3rd card (Sholo Ana), fixed mobile animation
- `client/src/utils/metaPixel.js` — Extended PRODUCT_NAMES for all 7 products
- `server/index.js` — product_ids JSONB array, BUNDLE_COMPONENTS inventory deduction, Telegram updated

---

## CART SYSTEM

### CartContext (`client/src/context/CartContext.jsx`)
- `addToCart(product)` — increments quantity if already in cart, else adds with qty 1
- `removeFromCart(id)`
- `updateQuantity(id, qty)` — clamped 1–10
- `clearCart()` — called after successful order
- `cartCount` = sum of all quantities (shown in navbar badge)
- Persisted to localStorage

### Delivery Pricing Rule (IMPORTANT)
Delivery is charged **per distinct product type**, NOT per unit quantity.
- 2 Syndicates = 80৳ delivery (not 160৳)
- 1 Syndicate + 1 Tong = 160৳ delivery
- Any bundle = 0৳ delivery (always included)

### product_ids in Orders (server)
Quantities are encoded by repeating IDs: 2 Syndicates = `[1, 1]`, not `{id:1, qty:2}`.
Server BUNDLE_COMPONENTS map: `{ 3:[1,2], 5:[1,4], 6:[2,4], 7:[1,2,4] }` — used for inventory deduction.

---

## CHECKOUT MODAL — DUAL MODE

Controlled by what props are passed from HomePage:
- **Buy Now mode**: `product={product}` passed, `cartItems={null}` — single product + upsell shown
- **Cart mode**: `product={null}` passed, `cartItems={cartItems}` — all cart items with quantities

### Upsell Logic (`UPSELL_FOR` in CheckoutModal)
- Buy game 1 (Syndicate) → show Syn+Tong bundle (save 140৳) + All 3 (save 341৳)
- Buy game 2 (Tong)      → show Tong+Sholo bundle (save 150৳) + All 3 (save 341৳)
- Buy game 4 (Sholo Ana) → show Tong+Sholo bundle (save 150৳) + All 3 (save 341৳)
- Buy bundle 3, 5, or 6  → ALWAYS upsell to All 3 (product 7)
- Buy bundle 7           → no upsell (already the best)

Clicking an upsell swaps `activeProduct` to the bundle. The form then submits the bundle ID.

---

## BUNDLE CART UPSELL (CartDrawer)
`UPSELL_RULES` checked against current cart IDs (most specific first):
1. IDs [1,2,4] in cart → suggest bundle 7 (save 341৳)
2. IDs [1,2] in cart   → suggest bundle 3 (save 140৳)
3. IDs [1,4] in cart   → suggest bundle 5 (save 140৳)
4. IDs [2,4] in cart   → suggest bundle 6 (save 150৳)

Accepting upsell: removes individual items, adds bundle product.

---

## PRODUCT IMAGES MAP (used in CartDrawer + CheckoutModal)

```js
const PRODUCT_IMAGES = {
  1: '/cards/syndicate/hero.webp',
  2: '/cards/tong/hero.webp',
  4: '/cards/sholo-ana/hero.webp',
  3: '/cards/bundle/syn-tong.webp',
  5: '/cards/bundle/syn-sholo.webp',
  6: '/cards/bundle/tong-sholo.webp',
  7: '/cards/bundle/all-three.webp',
};
```

---

## IMAGE UPLOAD LOCATIONS

All card images are hardcoded via git push — NOT uploaded via admin panel.

| Image                          | Path in /public                          |
|-------------------------------|------------------------------------------|
| Syndicate hero card            | /cards/syndicate/hero.webp               |
| Syndicate showcase cards       | /cards/syndicate/front-1.webp … front-5  |
| Tong hero card                 | /cards/tong/hero.webp                    |
| Tong showcase cards            | /cards/tong/front-1.webp … front-8       |
| Sholo Ana hero card            | /cards/sholo-ana/hero.webp               |
| Sholo Ana showcase cards       | /cards/sholo-ana/front-1.webp … front-6  |
| Bundle: Syn + Tong             | /cards/bundle/syn-tong.webp              |
| Bundle: Syn + Sholo Ana        | /cards/bundle/syn-sholo.webp             |
| Bundle: Tong + Sholo Ana       | /cards/bundle/tong-sholo.webp            |
| Bundle: Complete Collection    | /cards/bundle/all-three.webp             |

**Sholo Ana "View Product" page gallery images** → uploaded via admin panel (same as Syndicate/Tong).

---

## SHOLO ANA — DESIGN COLORS

Derived from the logo: light powder blue watercolor background, dark navy Bengali text.

| Usage         | Color     |
|---------------|-----------|
| Section bg    | `#daeef9` |
| Primary text  | `#1a3a6c` |
| Accent / CTA  | `#2672b0` |
| Secondary bg  | `#c8e8f5` |

These apply to BOTH the SholoAnaShowcase and the GameTemplate route (`/sholo-ana`).
GameTemplate gets colors from `SHOLO_ANA_DATA.colors` in `App.jsx`.

---

## HERO SECTION — 3 CARDS

Cards: Syndicate (left, −12°), Tong (center, 0°), Sholo Ana (right, +12°).
Spread: 200px desktop, 110px mobile. Float animation after landing.
Mobile uses load animation (NOT scroll-triggered — hero fills screen so scroll trigger never fires).

---

## SUPABASE — REQUIRED SQL

Run this once in Supabase SQL editor if not already done:

```sql
-- Add product_ids column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_ids JSONB;

-- Insert new products (check if they exist first)
INSERT INTO products (id, title, price, delivery_dhaka, delivery_outside) VALUES
  (4, 'Sholo Ana', 420, 80, 80),
  (3, 'Syndicate + Tong Bundle', 800, 0, 0),
  (5, 'Syndicate + Sholo Ana Bundle', 800, 0, 0),
  (6, 'Tong + Sholo Ana Bundle', 850, 0, 0),
  (7, 'The Complete Collection', 1099, 0, 0)
ON CONFLICT (id) DO NOTHING;
```

Prices are editable from the admin panel after insertion.

---

## KNOWN ISSUES FIXED THIS SESSION

1. Sholo Ana folder was named `shono-ana` (typo) — renamed to `sholo-ana`
2. Mobile hero animation was scroll-triggered — hero fills screen so trigger never fired; changed to load animation
3. Sholo Ana GameTemplate had dark navy/gold colors — corrected to match logo (light blue)
4. Buy Now on Syndicate/Tong was calling addToCart — fixed by adding separate onBuyNow prop
5. Bundle hero card had yellow (#c9a227) accent — replaced with Chokka green (#2e8b57)
6. Cart/Checkout showed blank Package icon — replaced with actual hero/bundle images

---

## PENDING / NOT YET DONE

- Meta Pixel reconfiguration (explicitly deferred)
- Landing page update (explicitly skipped)
- Bundle images still need to be uploaded: `/cards/bundle/*.webp`
- Admin panel may need updating to display product_ids array (not urgent)
