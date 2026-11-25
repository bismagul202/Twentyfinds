"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import type { CmsPage } from "@/features/storefront/cms";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import { Icon } from "./Icon";

type HeaderProps = {
  announcement?: CmsPage;
  categories: { name: string; slug: string }[];
};

export function SiteHeader({ announcement, categories }: HeaderProps) {
  const pathname = usePathname();
  const copy = useStorefrontCopy();
  const { cartCount, wishlistCount } = useStorefront();
  const drawer = useRef<HTMLDialogElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState<"wishlist" | "bag" | null>(
    null,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeAtDesktop = () => {
      if (desktop.matches) drawer.current?.close();
    };
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
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
    window.location.href = query
      ? `/shop?q=${encodeURIComponent(query)}`
      : "/shop";
  }

  function closeMenus() {
    setPanel(null);
    setSearchOpen(false);
    drawer.current?.close();
  }

  const productsSection = pathname === "/shop" || pathname?.startsWith("/products/");
  const categorySection = pathname?.startsWith("/categories/");

  function renderNavigation(withArrow = false) {
    const arrow = withArrow && <span aria-hidden="true"><Icon name="arrow-right" size={20} /></span>;

    return (
      <>
        <Link href="/" onClick={closeMenus} aria-current={pathname === "/" ? "page" : undefined}>
          <StorefrontText id="header.home" fallback="Home" />{arrow}
        </Link>
        <Link href="/shop" onClick={closeMenus} aria-current={pathname === "/shop" ? "page" : undefined}
          className={productsSection ? "nav-section-active" : undefined}>
          <StorefrontText id="header.products" fallback="Products" />{arrow}
        </Link>
        {categories.length > 0 ? (
          <details
            className="header-category-menu"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
            }}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || !event.currentTarget.open) return;
              event.preventDefault();
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }}
          >
            <summary className={categorySection ? "nav-section-active" : undefined}>
              <StorefrontText id="header.categories" fallback="Categories" />
              <Icon name="chevron-down" size={15} />
            </summary>
            <div className="header-category-links">
              {categories.map(({ name, slug }) => (
                <Link key={slug} href={`/categories/${slug}`} onClick={(event) => {
                  const menu = event.currentTarget.closest("details");
                  if (menu) menu.open = false;
                  closeMenus();
                }}>
                  {name}
                </Link>
              ))}
            </div>
          </details>
        ) : (
          <Link href="/#shop-by-category" onClick={closeMenus}>
            <StorefrontText id="header.categories" fallback="Categories" />{arrow}
          </Link>
        )}
        <Link href="/shop?sort=new" onClick={closeMenus}>
          <StorefrontText id="header.new-arrivals" fallback="New Arrivals" />{arrow}
        </Link>
        <Link href="/shop?sort=bestsellers" onClick={closeMenus}>
          <StorefrontText id="header.best-sellers" fallback="Best Sellers" />{arrow}
        </Link>
        <Link href="/shop?deals=1" onClick={closeMenus}>
          <StorefrontText id="header.offers" fallback="Offers" />{arrow}
        </Link>
        <Link href="/about" onClick={closeMenus} aria-current={pathname === "/about" ? "page" : undefined}>
          <StorefrontText id="header.about" fallback="About" />{arrow}
        </Link>
        <Link href="/contact" onClick={closeMenus} aria-current={pathname === "/contact" ? "page" : undefined}>
          <StorefrontText id="header.contact" fallback="Contact" />{arrow}
        </Link>
      </>
    );
  }

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <span>{announcement?.title ?? <StorefrontText id="header.the-twentyfinds-edit" fallback="THE TWENTYFINDS EDIT" />}</span>
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

        <Link href="/" className="brand-lockup" aria-label={copy("header.twentyfinds-home", "TWENTYFINDS home")}>
          <span className="brand-mark">20</span>
          <span className="brand-wordmark"><StorefrontText id="header.twentyfinds" fallback="TWENTYFINDS" /></span>
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
            onClick={() => {
              setSearchOpen((open) => !open);
              setPanel(null);
            }}
          >
            <Icon name={searchOpen ? "close" : "search"} size={19} />
          </button>
          <button
            type="button"
            className="icon-button header-action"
            aria-label={copy("header.wishlist-wishlistcount-saved", "Wishlist, {wishlistCount} saved", { wishlistCount: wishlistCount })}
            aria-expanded={panel === "wishlist"}
            onClick={() => {
              setPanel(panel === "wishlist" ? null : "wishlist");
              setSearchOpen(false);
            }}
          >
            <span className="header-icon-wrap">
              <Icon name="heart" size={19} />
              {wishlistCount > 0 && (
                <span className="count-dot">{wishlistCount}</span>
              )}
            </span>
          </button>
          <button
            type="button"
            className="icon-button header-action"
            aria-label={copy("header.shopping-cart-cartcount-items", "Shopping cart, {cartCount} items", { cartCount: cartCount })}
            aria-expanded={panel === "bag"}
            onClick={() => {
              setPanel(panel === "bag" ? null : "bag");
              setSearchOpen(false);
            }}
          >
            <span className="header-icon-wrap">
              <Icon name="bag" size={19} />
              {cartCount > 0 && <span className="count-dot">{cartCount}</span>}
            </span>
          </button>
        </div>

        {panel && (
          <div className="header-popover">
            <button
              type="button"
              className="popover-close"
              aria-label={copy("header.close-popover", "Close popover")}
              onClick={() => setPanel(null)}
            >
              <Icon name="close" size={17} />
            </button>
            {panel === "wishlist" && (
              <>
                <span className="popover-kicker"><StorefrontText id="header.your-wishlist" fallback="Your wishlist" /></span>
                <strong>
                  {wishlistCount === 0
                    ? <StorefrontText id="header.a-little-list-of-lovely-things" fallback="A little list of lovely things." />
                    : <StorefrontText id="header.wishlistcount-find-value-saved" fallback={"{wishlistCount} find{value} saved"} values={{ wishlistCount: wishlistCount, value: wishlistCount === 1 ? "" : "s" }} />}
                </strong>
                <p><StorefrontText id="header.your-saved-finds-stay-in-this-browsing" fallback="Your saved finds stay in this browsing preview." /></p>
              </>
            )}
            {panel === "bag" && (
              <>
                <span className="popover-kicker"><StorefrontText id="header.your-shopping-cart" fallback="Your shopping cart" /></span>
                <strong>
                  {cartCount === 0
                    ? <StorefrontText id="header.your-cart-is-ready-for-a-good" fallback="Your cart is ready for a good find." />
                    : <StorefrontText id="header.cartcount-item-value-in-your-cart" fallback={"{cartCount} item{value} in your cart"} values={{ cartCount: cartCount, value: cartCount === 1 ? "" : "s" }} />}
                </strong>
                <p><StorefrontText id="header.checkout-is-not-enabled-in-this-storefront" fallback="Checkout is not enabled in this storefront preview." /></p>
                <Link href="/shop" className="text-link" onClick={closeMenus}><StorefrontText id="header.continue-shopping" fallback="Continue shopping" /><Icon name="arrow-right" size={15} />
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="header-search-panel">
          <form onSubmit={submitSearch} role="search" className="container-shell">
            <Icon name="search" size={20} />
            <input
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
            <Link href="/" className="brand-lockup" onClick={closeMenus} aria-label={copy("header.twentyfinds-home", "TWENTYFINDS home")}>
              <span className="brand-mark">20</span>
              <span className="brand-wordmark"><StorefrontText id="header.twentyfinds" fallback="TWENTYFINDS" /></span>
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
