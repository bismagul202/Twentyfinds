# TWENTYFINDS project vision

TWENTYFINDS is a premium UK multi-category online department store. The owner manages the business from Pakistan, and the UK team fulfils customer orders from UK stock. Each sellable product or variant must cost £0.01–£19.99 in GBP. Sourcing and expense reporting must support PKR and GBP with recorded exchange rates.

This document records the platform vision and current audit. Use [BUSINESS_CONTEXT.md](BUSINESS_CONTEXT.md) for the operating model, [CMS_REQUIREMENTS.md](CMS_REQUIREMENTS.md) for CMS details, and [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for the prioritized implementation backlog.

## Target experience

- **Storefront.** Preserve the existing burgundy-and-cream visual identity, editorial layouts and motion. Deliver responsive catalog discovery, server-backed search and filters, persistent shopping, checkout, accounts and order tracking. Published content is server-rendered and updates without a redeploy.
- **Owner dashboard.** Build on the existing themed Laravel dashboard. Add global search, charted metrics backed by actual records, advanced data tables, filters, sorting, bulk actions, reusable forms, dialogs and drawers, media selection, notifications, loading and empty states, and responsive light/dark themes.
- **UK fulfilment.** Provide a restricted interface for receiving bulk stock, verifying quantities, picking and packing assigned orders, recording dispatch and tracking, managing physical returns and reporting discrepancies. Restrict supplier prices, finance and settings to authorized roles.
- **Headless CMS.** Manage built-in and custom pages, typed sections, drag-and-drop ordering, animation and layout options, mobile/desktop assets, protected preview, drafts, scheduling and revisions. Manage global navigation and mega menus, logo/theme, header/footer, announcements, banners/sliders, FAQs, contact/social/WhatsApp, media, forms, SEO, redirects, newsletter and consent.
- **Commerce and reporting.** Manage products, attributes, variants, images, nested categories, tags and collections, inventory adjustments, inbound shipments, suppliers, customers and addresses, carts, wishlists, orders, payments, COD, shipping, returns, refunds, discounts, genuine reviews and abandoned carts. Report sales, inventory, performance, landed costs, expenses and profit from recorded transactions.
- **System boundaries.** Laravel REST APIs and MySQL own business state. Use permission checks on every administrative operation, validated configuration, transactions for multi-record writes, actor-attributed audits and targeted cache invalidation. Laravel calculates prices, stock, discounts and totals. Keep identity, checkout and payments outside the CMS, and integrate payment/courier providers only when eligible services are confirmed.

## Audited baseline

| Area | Completed or partial functionality | Remaining gap |
|---|---|---|
| Storefront | Nine fixed Next.js routes and three dynamic templates. Responsive storefront with animated hero, catalog filters, variants and image galleries. | Search/filtering is client-side. No customer account, checkout, order history or tracking screens backed by Laravel. |
| Catalog and images | Owner edits products, variants, images, previous prices, categories and subcategories. Public API filters by active product/category and supplies approved review aggregates. Model/database price bounds exist. | Product availability, stock reservations, structured attributes, true collections/tags and review workflows are missing. Current homepage collections use flags, item age and previous prices. |
| CMS publishing | Laravel publishes banners, plain-text pages and SEO fields. 346 defined text fields can be overridden. Owner Pages index lists built-in routes and saved page/catalog records. `GET /api/storefront` returns published data and Next.js fetches it with `no-store`. | Structured sections, protected preview, separate saved drafts for live pages, scheduled page publishing, revision history, media library, global settings, robots/sitemap/redirects and targeted caching are missing. Banner scheduling already exists. |
| Admin | Owner session login, admin role gate, collapsible sidebar, database-backed totals, recent updates, quick actions, resource editors and page search/filtering. | Admin writes use authenticated Laravel web actions. Dedicated permission-scoped REST write endpoints, global search, charts, bulk actions, common overlays, notifications and dark mode remain pending. |
| Customer actions | Product quick-add and wishlist update React state. Contact and newsletter forms provide client feedback. | Cart/wishlist reset on reload. Forms send no submissions or subscription requests. Review submission and moderation are missing. |
| Operational data | Existing models/tables cover users/addresses, roles/permissions, activity logs, cart/wishlist, stock movements, order items, payments, coupons, shipments, returns, refunds and newsletter subscriptions. | Routes and workflows for customer commerce, UK fulfilment, supplier receipts, COD reconciliation, expense tracking and GBP/PKR reporting remain missing or unwired. |

### Hardcoded and disconnected points

- [Homepage](twentyfinds-frontend/src/app/page.tsx) defines section order, component composition and fallback campaign imagery. [Demo data](twentyfinds-frontend/src/features/storefront/data.ts) supplies editorial fallbacks and a demo catalog when the CMS URL is unset.
- [Header](twentyfinds-frontend/src/components/storefront/SiteHeader.tsx) and [footer](twentyfinds-frontend/src/components/storefront/SiteFooter.tsx) retain code-defined navigation, link destinations and social targets. Text and selected page slots are CMS-controlled. Branding, favicon and visual tokens live in source.
- [StorefrontProvider](twentyfinds-frontend/src/features/storefront/StorefrontProvider.tsx), [ContactForm](twentyfinds-frontend/src/components/storefront/ContactForm.tsx) and [NewsletterForm](twentyfinds-frontend/src/components/storefront/NewsletterForm.tsx) use client state.
- [Public API routes](twentyfinds-backend/routes/api.php) expose health, storefront and media reads. [Admin web routes](twentyfinds-backend/routes/web.php) handle catalog and CMS writes. Existing [migrations](twentyfinds-backend/database/migrations) establish the schema foundation for later workflows.
