# TWENTYFINDS Frontend

Next.js App Router application using TypeScript and Tailwind CSS.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Set `NEXT_PUBLIC_API_URL` in `.env.local` to the Laravel API base URL (including `/api`). Set the server-side `STOREFRONT_CMS_URL` to the Laravel API base URL to display published dashboard content. Omitting this setting uses the local demo catalog.

## Structure

- `src/app/` — App Router routes and global styles
- `src/components/storefront/` — shared navigation, catalog, and content UI
- `src/features/storefront/` — local catalog data and preview shopping state
- `src/lib/` — shared utilities and API configuration
- `src/types/` — shared TypeScript types

## Storefront preview

The storefront reads published catalogue and content data from Laravel. Search, filters and sorting run against the loaded catalogue in the browser. Contact uses the existing API and confirms receipt only after acknowledgement. Newsletter sign-up, accounts and checkout are unavailable.

Shop results and homepage product sections are empty until products are published. Collection guides use frontend fallbacks when no CMS page is published. The Personalisation and Wedding & Nikah guides support browsing and enquiries. Customisation, proof approval and bespoke order workflows are future work.

### Cart and wishlist persistence

The cart and wishlist use in-memory React state. Items stay available during client-side navigation while the storefront provider stays mounted. A full reload, a new tab or closing the browsing session starts with empty lists. There is no browser storage, account synchronisation or server-side cart.

The subtotal is calculated from published catalogue prices for display. Delivery charges are unavailable and checkout is disabled. Persistent carts and server-validated pricing and delivery belong to a future commerce phase.

### Supporting content for owner review

The fallback Privacy Policy, Terms and Conditions, and Returns and Refunds pages are draft preview copy. Before launch, the owner should confirm and publish the business and contact details, actual data handling and retention, sales terms, and returns eligibility, timing and process. Delivery destinations, charges and time estimates also need confirmation. Review published CMS overrides alongside these drafts, since published content takes precedence.
