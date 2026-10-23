
/* =========================================
   NOVAMART ABOUT PAGE
   File: about.js
   Independent About Page interactions.
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const aboutMenuToggle = document.getElementById("aboutMenuToggle");
    const aboutNavigation = document.getElementById("aboutNavigation");
    const aboutNavLinks = document.querySelectorAll(".about-nav-link");
    const aboutCartBadge = document.getElementById("aboutCartBadge");
    const aboutCurrentYear = document.getElementById("aboutCurrentYear");
    const aboutBackTop = document.getElementById("aboutBackTop");

    const aboutCartStorageKey = "ecommerce_cart";

    // Automatically update the footer copyright year.
    if (aboutCurrentYear) {
        aboutCurrentYear.textContent = new Date().getFullYear();
    }

    // Mobile navigation.
    function aboutSetNavigation(isOpen) {
        if (!aboutMenuToggle || !aboutNavigation) {
            return;
        }

        aboutMenuToggle.classList.toggle("about-menu-open", isOpen);
        aboutNavigation.classList.toggle("about-navigation-open", isOpen);

        aboutMenuToggle.setAttribute("aria-expanded", String(isOpen));
        aboutMenuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    }

    if (aboutMenuToggle && aboutNavigation) {
        aboutMenuToggle.addEventListener("click", function () {
            const aboutIsOpen =
                aboutMenuToggle.getAttribute("aria-expanded") === "true";

            aboutSetNavigation(!aboutIsOpen);
        });

        aboutNavLinks.forEach(function (aboutLink) {
            aboutLink.addEventListener("click", function () {
                aboutSetNavigation(false);
            });
        });

        document.addEventListener("click", function (aboutEvent) {
            const aboutClickedInsideMenu =
                aboutNavigation.contains(aboutEvent.target);

            const aboutClickedToggle =
                aboutMenuToggle.contains(aboutEvent.target);

            if (!aboutClickedInsideMenu && !aboutClickedToggle) {
                aboutSetNavigation(false);
            }
        });

        document.addEventListener("keydown", function (aboutEvent) {
            if (aboutEvent.key === "Escape") {
                const aboutWasOpen =
                    aboutMenuToggle.getAttribute("aria-expanded") === "true";

                aboutSetNavigation(false);

                if (aboutWasOpen) {
                    aboutMenuToggle.focus();
                }
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 700) {
                aboutSetNavigation(false);
            }
        });
    }

    // Read the cart without modifying the shared cart storage.
    function aboutGetCartCount() {
        try {
            const aboutStoredCart = localStorage.getItem(aboutCartStorageKey);

            if (!aboutStoredCart) {
                return 0;
            }

            const aboutCartItems = JSON.parse(aboutStoredCart);

            // A cart stored as an array of products.
            if (Array.isArray(aboutCartItems)) {
                return aboutCartItems.reduce(function (aboutTotal, aboutItem) {
                    if (!aboutItem || typeof aboutItem !== "object") {
                        return aboutTotal;
                    }

                    const aboutQuantity =
                        aboutItem.quantity ??
                        aboutItem.qty ??
                        aboutItem.count ??
                        1;

                    const aboutValidQuantity = Number(aboutQuantity);

                    if (
                        Number.isFinite(aboutValidQuantity) &&
                        aboutValidQuantity > 0
                    ) {
                        return aboutTotal + aboutValidQuantity;
                    }

                    return aboutTotal;
                }, 0);
            }

            // Also recognise common object-based cart containers.
            if (aboutCartItems && typeof aboutCartItems === "object") {
                const aboutNestedItems =
                    aboutCartItems.items ?? aboutCartItems.products;

                if (Array.isArray(aboutNestedItems)) {
                    return aboutNestedItems.reduce(
                        function (aboutTotal, aboutItem) {
                            if (!aboutItem || typeof aboutItem !== "object") {
                                return aboutTotal;
                            }

                            const aboutQuantity =
                                aboutItem.quantity ??
                                aboutItem.qty ??
                                aboutItem.count ??
                                1;

                            const aboutValidQuantity = Number(aboutQuantity);

                            return aboutTotal +
                                (
                                    Number.isFinite(aboutValidQuantity) &&
                                    aboutValidQuantity > 0
                                        ? aboutValidQuantity
                                        : 0
                                );
                        },
                        0
                    );
                }
            }

            return 0;
        } catch (aboutError) {
            console.warn("NovaMart: Unable to read cart data.", aboutError);
            return 0;
        }
    }

    // Refresh the visible cart badge.
    function aboutUpdateCartBadge() {
        if (!aboutCartBadge) {
            return;
        }

        const aboutCartCount = aboutGetCartCount();

        aboutCartBadge.textContent = String(aboutCartCount);
        aboutCartBadge.setAttribute(
            "aria-label",
            aboutCartCount + (aboutCartCount === 1 ? " item in cart" : " items in cart")
        );
    }

    aboutUpdateCartBadge();

    // Synchronise the badge when another tab changes the cart.
    window.addEventListener("storage", function (aboutEvent) {
        if (
            aboutEvent.key === aboutCartStorageKey ||
            aboutEvent.key === null
        ) {
            aboutUpdateCartBadge();
        }
    });

    // Back-to-top interaction.
    if (aboutBackTop) {
        aboutBackTop.addEventListener("click", function (aboutEvent) {
            aboutEvent.preventDefault();

            const aboutReduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            window.scrollTo({
                top: 0,
                behavior: aboutReduceMotion ? "auto" : "smooth"
            });
        });
    }
});
