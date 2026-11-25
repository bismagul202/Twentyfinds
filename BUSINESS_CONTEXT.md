# TWENTYFINDS – Business Context & Project Requirements

Before continuing development, understand the complete business model and long-term vision of this project.

## Business Overview

- Brand Name: TWENTYFINDS
- Brand Concept: Everything Under £20
- Business Type: Multi-category online department store
- Target Market: United Kingdom
- Currency: GBP (£)
- Target Audience: Gen-Z, Millennials, men, women and families
- Ownership: 100% independently owned by the business owner
- Business Management: Pakistan
- Inventory Storage and Fulfilment: United Kingdom

TWENTYFINDS is not limited to fashion or a single product category. It is a complete online shopping destination offering affordable, trendy, useful and quality everyday products.

Every individual product must be priced between £0.01 and £19.99.

## Product Categories

The platform should support unlimited dynamic categories and subcategories, including:

- Men's and Women's Fashion
- Clothing
- Fashion Accessories
- Bags and Wallets
- Home and Living
- Kitchen Essentials
- Stationery and Office Supplies
- Beauty Accessories
- Electronics Accessories
- Household Essentials
- Storage and Organization
- Toys and Games
- Fitness and Sports
- Pet Accessories
- Travel Essentials
- Gifts and Seasonal Products

Categories must be manageable dynamically from the admin dashboard.

## Business Operational Model

The business owner will operate and manage the entire business remotely from Pakistan.

Products will be sourced from Pakistan at wholesale prices and shipped in bulk to the United Kingdom.

The business owner's family in the UK will receive and store the inventory and handle physical order fulfilment.

This is an inventory-based e-commerce business, not a dropshipping business.

Individual customer orders will not be shipped from Pakistan. All customer orders will be fulfilled from available UK inventory.

## Order Workflow

1. The business owner sources products in Pakistan.
2. Products are shipped in bulk to the UK.
3. The UK fulfilment team receives and stores inventory.
4. Available inventory is updated in the system.
5. UK customers browse the TWENTYFINDS website.
6. Customers add products to their cart and place orders.
7. Customers select online payment or Cash on Delivery, where supported.
8. Orders appear in the admin and fulfilment dashboards.
9. The UK fulfilment team picks and packs the products.
10. Orders are dispatched through local UK courier services.
11. Tracking information is updated in the system.
12. Customers receive order and delivery notifications.
13. The business owner monitors sales, expenses, inventory and profits remotely.

## Platform Architecture

The platform must have three separate interfaces:

### 1. Customer Storefront

- Homepage
- Product browsing
- Categories and subcategories
- Product search and filters
- Product details
- Wishlist
- Shopping cart
- Checkout
- Online payment
- Cash on Delivery
- Customer accounts
- Order history
- Order tracking
- Reviews and ratings
- Returns and refund requests
- Promotional offers

### 2. Business Owner / Admin Dashboard

The business owner must have complete control over the platform.

Features:

- Product management
- Category management
- Product variants
- Inventory management
- Bulk shipment records
- Supplier management
- Purchase cost management
- Selling price management
- Order management
- Customer management
- Payment management
- COD reconciliation
- Shipping management
- Returns and refunds
- Coupons and promotions
- Website content management
- Banner management
- Expense management
- Sales analytics
- Profit and loss reporting
- Staff and permission management
- Business settings

Financial reporting should account for product purchase costs, international shipping, customs charges, packaging, local delivery, payment fees, taxes, refunds and marketing expenses.

Support PKR for sourcing expenses and GBP for UK sales, with recorded exchange rates for financial calculations.

### 3. UK Fulfilment Dashboard

The UK fulfilment team must have a separate role-based dashboard with restricted access.

Features:

- Receive incoming inventory
- Verify received stock
- View assigned orders
- View delivery addresses
- Pick and pack orders
- Update packing status
- Enter courier details
- Add tracking numbers
- Mark orders as dispatched
- Manage physical returns
- Report damaged or missing inventory
- Update COD collection records where applicable

Fulfilment staff must not have access to confidential financial information, supplier purchase costs, profit reports, business settings or administrative permissions.

## Payment and Delivery

The platform should support:

- Online payments
- Cash on Delivery
- Configurable UK delivery charges
- Free delivery thresholds
- Discount codes
- Order tracking
- Courier management
- Returns and refunds

Keep payment and courier integrations modular. Do not assume that a particular provider is available or approved. COD must only be enabled for supported delivery services.

The initial business will operate on a small scale and expand gradually. Keep business registration details, VAT settings, tax calculations and payment provider configuration flexible.

Do not assume that registration or tax compliance can be postponed until after sales begin.

## Brand Identity and Design Vision

TWENTYFINDS should have a modern, luxurious, trendy and Gen-Z-friendly visual identity while remaining accessible and attractive to Millennials and families.

The website should feel like a premium shopping destination despite its affordable pricing.

Design principles:

- Modern typography
- Premium colour combinations
- Editorial-style promotional banners
- Clean product cards
- Attractive category layouts
- Engaging shopping experience
- Smooth micro-interactions
- Mobile-first responsive design
- Simple navigation
- Fast page loading

Avoid generic e-commerce templates, outdated layouts, excessive gradients and childish designs.

## Technology Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- App Router

Backend:
- Laravel
- PHP
- REST APIs
- MySQL
- Eloquent ORM
- Role-based access control

The frontend and backend must remain separate applications connected through secure APIs.

## Development Instructions

- Inspect the existing project before making any changes.
- Preserve all previously completed functionality.
- Do not recreate the project.
- Do not duplicate existing database tables or models.
- All future development must align with this business model.
- Build real functionality instead of static demonstrations.
- Use dynamic database-driven content.
- Maintain clean, reusable and scalable architecture.
- Develop the platform incrementally in small phases.
- Do not implement multiple modules without explicit instructions.
- Avoid unnecessary token consumption and lengthy explanations.
