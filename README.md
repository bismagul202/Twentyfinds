# TWENTYFINDS

International multi-category shopping for UK customers, with every product priced under £20.

The applications are separate:

- `twentyfinds-frontend/` — Next.js App Router, TypeScript, and Tailwind CSS.
- `twentyfinds-backend/` — Laravel REST API.

## Run the frontend

Requirements: Node.js and npm.

```powershell
cd twentyfinds-frontend
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Open <http://localhost:3000>. Set `NEXT_PUBLIC_API_URL` in `.env.local` to the Laravel API base URL; it defaults to `http://localhost:8000/api`.

## Run the backend

Requirements: PHP 8.3 or later, Composer 2, and MySQL for database-backed features.

```powershell
cd twentyfinds-backend
composer install
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  php artisan key:generate
}
php artisan serve
```

The API is available at <http://localhost:8000/api>. The health endpoint is <http://localhost:8000/api/health>. Set the MySQL connection values in `.env` for another environment.

## Database

The local `twentyfinds` MySQL database has the Laravel migrations applied. For another environment, configure and provision the MySQL database in `twentyfinds-backend/.env`, then run `php artisan migrate`. Composer setup does not run migrations.

## Structure

```text
twentyfinds-frontend/
  src/
    app/                 Next.js routes and global styles
    components/          Shared UI components
    features/            Feature-specific modules
    lib/api.ts           Laravel API base URL configuration
    types/               Shared TypeScript types

twentyfinds-backend/
  app/                   Laravel application code
  bootstrap/             Laravel application bootstrap
  config/                Laravel configuration
  database/              Laravel database scaffolding
  routes/api.php         API routes
```

## Owner CMS

Run the migrations, then create the first owner from the backend directory:

```powershell
php artisan migrate
php artisan cms:create-owner owner@example.com
```

Use your own email and enter your password at the hidden prompt. Sign in at <http://localhost:8000/admin>. Create a category, then add a product and upload its photos. Set the status to **Published** to show the item on the storefront. Draft status removes it from public listings. Parent categories must also be published. The dashboard also manages variants, homepage banners, and website pages.

Set `STOREFRONT_CMS_URL=http://localhost:8000/api` in the frontend's `.env.local` to read published content from Laravel. The example environment includes this setting. When it is omitted, Next.js uses the demo catalog. In an environment with CMS enabled, a fresh storefront request reads the current published data.

The Pages section accepts plain text and SEO fields. Use `homepage` for hero copy, `site-announcement` for the announcement bar, or `site-footer` for footer copy. A slug such as `about` or `returns` edits the matching page. Other published pages appear under `/pages/<slug>` and are linked in the footer. Banner placements control the homepage hero, promotion, and seasonal panels.

The shopping bag and wishlist are still previews. CMS publishing is independent of checkout, payments, and fulfilment.
