"use client";
import { storefrontBrand } from "@/features/storefront/brand";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import type { CmsPage } from "@/features/storefront/cms";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import { Icon } from "./Icon";
import { BrandLogo } from "./BrandLogo";
import { ShoppingPanel, type ShoppingPanelProduct } from "./ShoppingPanel";
import { departmentGroups, informationLinks, moreLinks, newIn, shopAll } from "@/features/storefront/navigation";

type HeaderProps = {
  announcement?: CmsPage;
  logo: string;
  categories: { name: string; slug: string }[];
  shoppingProducts: ShoppingPanelProduct[];
};

export function SiteHeader({ announcement, logo, categories, shoppingProducts }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const copy = useStorefrontCopy();
  const { cartCount, wishlistCount } = useStorefront();
  const drawer = useRef<HTMLDialogElement>(null);
  const desktopMenu = useRef<HTMLDetailsElement>(null);
  const actionTrigger = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState<"account" | "wishlist" | "bag" | null>(
    null,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeAtBreakpoint = () => {
      if (desktop.matches) drawer.current?.close();
      else if (desktopMenu.current) desktopMenu.current.open = false;
    };
    function closeOnOutsideClick(event: PointerEvent) {
      const menu = desktopMenu.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    }
    desktop.addEventListener("change", closeAtBreakpoint);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      desktop.removeEventListener("change", closeAtBreakpoint);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, []);

  function openMobileMenu() {
    if (!drawer.current || drawer.current.open) return;
    drawer.current.showModal();
    setMobileOpen(true);
    setSearchOpen(false);
    setPanel(null);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    closeMenus();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  function closeMenus() {
    setPanel(null);
    setSearchOpen(false);
    drawer.current?.close();
  }

  function dismissAction() {
    closeMenus();
    actionTrigger.current?.focus();
  }

  const categorySlugs = new Set(categories.map(({ slug }) => slug));
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const featuredSlugs = new Set(departmentGroups.flatMap(({ items }) =>
    items.map(({ slugs }) => slugs?.find((slug) => categorySlugs.has(slug))),
  ));
  const otherCategories = categories.filter(({ slug }) => !featuredSlugs.has(slug));

  function renderNavigation(inDrawer = false) {
    const arrow = inDrawer && <Icon name="arrow-right" size={20} />;

    function navigationLink({ id, label, href }: { id: string; label: string; href: string }, icon = false) {
      return (
        <Link key={id} href={href} aria-current={pathname === href && href !== "/shop" ? "page" : undefined}
          onClick={(event) => {
            const menu = event.currentTarget.closest("details");
            if (menu) menu.open = false;
            closeMenus();
          }}>
          {id.startsWith("category-") ? label : <StorefrontText id={`header.${id}`} fallback={label} />}{icon && arrow}
        </Link>
      );
    }

    return (
      <>
        {navigationLink(newIn, true)}
        <details className="header-category-menu" ref={inDrawer ? undefined : desktopMenu}
          onBlur={(event) => {
            if (!inDrawer && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
              event.currentTarget.open = false;
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !event.currentTarget.open) return;
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }}>
          <summary className={pathname?.startsWith("/categories/") ? "nav-section-active" : undefined}>
            <StorefrontText id="header.categories" fallback="Shop by category" />
            <Icon name="chevron-down" size={15} />
          </summary>
          <div className="header-category-links">
            {departmentGroups.map(({ id, label, items }) => {
              const published = items.flatMap(({ slugs }) => {
                const slug = slugs?.find((candidate) => categorySlugs.has(candidate));
                const category = slug && categoryBySlug.get(slug);
                return category ? [category] : [];
              });
              if (!published.length) return null;
              return <div className="header-menu-group" key={id}>
                <p><StorefrontText id={`header.menu-${id}`} fallback={label} /></p>
                {published.map(({ name, slug }) => navigationLink({
                  id: `category-${slug}`, label: name, href: `/categories/${slug}`,
                }))}
              </div>;
            })}
            <div className="header-menu-group">
              <p><StorefrontText id="header.menu-more" fallback="More from 20ISH" /></p>
              {otherCategories.map(({ name, slug }) => navigationLink({
                id: `category-${slug}`, label: name, href: `/categories/${slug}`,
              }))}
              {moreLinks.map((item) => navigationLink(item))}
            </div>
          </div>
        </details>
        {navigationLink(shopAll, true)}
        {informationLinks.map((item) => navigationLink(item, true))}
      </>
    );
  }

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === "Escape" && (searchOpen || panel)) {
        event.preventDefault();
        dismissAction();
      }
    }}>
      <div className="announcement-bar">
        <span>{announcement?.title ?? <StorefrontText id="header.the-twentyfinds-edit" fallback="THE 20ISH EDIT" />}</span>
        <span className="announcement-divider" aria-hidden="true">·</span>
        <span>{announcement?.content ?? <StorefrontText id="header.everyday-favourites-always-under-20" fallback="Everyday favourites, always under £20" />}</span>
      </div>

      <div className="header-main container-shell">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          aria-label={mobileOpen ? copy("header.close-menu", "Close menu") : copy("header.open-menu", "Open menu")}
          aria-expanded={mobileOpen}
          aria-controls="storefront-navigation"
          aria-haspopup="dialog"
          onClick={openMobileMenu}
        >
          <Icon name={mobileOpen ? "close" : "menu"} />
        </button>

        <Link href="/" className="brand-lockup" aria-label={copy("header.twentyfinds-home", `${storefrontBrand.name} home`)}>
          <BrandLogo copyId="header.twentyfinds" src={logo} />
        </Link>

        <nav className="primary-nav" aria-label={copy("header.main-navigation", "Main navigation")}>
          {renderNavigation()}
        </nav>

        <div className="header-actions">
          <form className="header-inline-search" onSubmit={submitSearch} role="search">
            <input
              type="search"
              aria-label={copy("header.search-products", "Search products")}
              placeholder={copy("header.search-products", "Search products")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" aria-label={copy("header.search", "Search")}>
              <Icon name="search" size={17} />
            </button>
          </form>
          <button
            type="button"
            className="icon-button header-action header-search-toggle"
            aria-label={searchOpen ? copy("header.close-search", "Close search") : copy("header.search", "Search")}
            aria-expanded={searchOpen}
            aria-controls={searchOpen ? "storefront-search-panel" : undefined}
            onClick={(event) => {
              actionTrigger.current = event.currentTarget;
              setSearchOpen((open) => !open);
              setPanel(null);
            }}
          >
            <Icon name={searchOpen ? "close" : "search"} size={19} />
          </button>
          <button
            type="button"
            className="icon-button header-action"
            aria-label={copy("header.account", "Account")}
            aria-expanded={panel === "account"}
            aria-controls={panel === "account" ? "storefront-header-panel" : undefined}
            onClick={(event) => {
              actionTrigger.current = event.currentTarget;
              setPanel(panel === "account" ? null : "account");
              setSearchOpen(false);
            }}
          >
            <Icon name="user" size={19} />
          </button>
          <button
            type="button"
            className="icon-button header-action"
            aria-label={copy("header.wishlist-wishlistcount-saved", "Wishlist, {wishlistCount} saved", { wishlistCount: wishlistCount })}
            aria-expanded={panel === "wishlist"}
            aria-controls={panel === "wishlist" ? "storefront-header-panel" : undefined}
            onClick={(event) => {
              actionTrigger.current = event.currentTarget;
              setPanel(panel === "wishlist" ? null : "wishlist");
              setSearchOpen(false);
            }}
          >
            <span className="header-icon-wrap">
              <Icon name="heart" size={19} />
              {wishlistCount > 0 && (
                <span className="count-dot" aria-hidden="true">{wishlistCount}</span>
              )}
            </span>
          </button>
          <button
            type="button"
            className="icon-button header-action"
            aria-label={copy("header.shopping-cart-cartcount-items", "Shopping cart, {cartCount} items", { cartCount: cartCount })}
            aria-expanded={panel === "bag"}
            aria-controls={panel === "bag" ? "storefront-header-panel" : undefined}
            onClick={(event) => {
              actionTrigger.current = event.currentTarget;
              setPanel(panel === "bag" ? null : "bag");
              setSearchOpen(false);
            }}
          >
            <span className="header-icon-wrap">
              <Icon name="bag" size={19} />
              {cartCount > 0 && <span className="count-dot" aria-hidden="true">{cartCount}</span>}
            </span>
          </button>
        </div>

        {panel && (
          <div className={panel === "account" ? "header-popover" : "header-popover shopping-panel"}
            id="storefront-header-panel" aria-live={panel === "account" ? "polite" : undefined}>
            <button
              type="button"
              className="popover-close"
              aria-label={copy("header.close-popover", "Close popover")}
              onClick={dismissAction}
              autoFocus
            >
              <Icon name="close" size={17} />
            </button>
            {panel === "account" && (
              <>
                <strong><StorefrontText id="header.your-account" fallback="Your account" /></strong>
                <p><StorefrontText id="header.accounts-preview" fallback="20ISH customer accounts are currently unavailable." /></p>
                <Link href="/contact" className="text-link" onClick={closeMenus}>
                  <StorefrontText id="header.account-contact" fallback="Contact customer care" /><Icon name="arrow-right" size={15} />
                </Link>
              </>
            )}
            {panel !== "account" && <ShoppingPanel key={panel} mode={panel} products={shoppingProducts} onNavigate={closeMenus} />}
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="header-search-panel" id="storefront-search-panel">
          <form onSubmit={submitSearch} role="search" className="container-shell">
            <Icon name="search" size={20} />
            <input
              type="search"
              aria-label={copy("header.search-products", "Search products")}
              placeholder={copy("header.what-are-you-looking-for", "What are you looking for?")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
            <button type="submit" className="button button-dark"><StorefrontText id="header.search" fallback="Search" /></button>
          </form>
        </div>
      )}

      <dialog
        ref={drawer}
        id="storefront-navigation"
        className="storefront-drawer"
        aria-label={copy("header.mobile-navigation", "Mobile navigation")}
        onClose={() => setMobileOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) drawer.current?.close(); }}
      >
        <div className="storefront-drawer-inner">
          <div className="storefront-drawer-header">
            <Link href="/" className="brand-lockup" onClick={closeMenus} aria-label={copy("header.twentyfinds-home", `${storefrontBrand.name} home`)}>
              <BrandLogo copyId="header.twentyfinds" src={logo} />
            </Link>
            <button type="button" className="icon-button drawer-close" aria-label={copy("header.close-menu", "Close menu")} onClick={() => drawer.current?.close()}>
              <Icon name="close" size={22} />
            </button>
          </div>
          <nav className="storefront-drawer-links" aria-label={copy("header.main-navigation", "Main navigation")}>
            {renderNavigation(true)}
          </nav>
        </div>
      </dialog>
    </header>
  );
}
