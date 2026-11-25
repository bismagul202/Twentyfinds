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

The frontend includes the home page, shop-all catalog, category and product detail routes, and About, Contact, FAQ, Shipping, Returns, Privacy, and Terms pages. Search, category/price filters, sorting, saved-item buttons, the preview bag, and forms are front-end interactions only. Checkout, customer accounts, and storefront contact/newsletter submissions remain preview functionality. The owner CMS and public storefront API run in Laravel.

Product and policy content is illustrative. Product imagery is loaded from Unsplash; confirm image rights and replace sample content before launch.
