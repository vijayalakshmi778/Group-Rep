/* =========================================
   NOVAMART HOME PAGE JAVASCRIPT
   Shared cart key: ecommerce_cart
   ========================================= */

"use strict";

// Shared storage key agreed upon by all three group members.
const homeCartStorageKey = "ecommerce_cart";

// Product data used by the Home Page.
// The Cart Page must use the same object field names.
const homeProducts = [
    {
        id: "product-001",
        name: "Classic Everyday Tote",
        category: "Fashion",
        price: 799,
        oldPrice: 999,
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80",
        description: "A versatile companion for everyday outings.",
        tag: "BESTSELLER"
    },
    {
        id: "product-002",
        name: "Wireless Headphones",
        category: "Electronics",
        price: 1499,
        oldPrice: 1999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
        description: "Enjoy your favourite sounds in style.",
        tag: "POPULAR"
    },
    {
        id: "product-003",
        name: "Minimal Wristwatch",
        category: "Accessories",
        price: 1199,
        oldPrice: 1499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
        description: "A timeless accent for every outfit.",
        tag: "FAVOURITE"
    },
    {
        id: "product-004",
        name: "Modern Table Lamp",
        category: "Lifestyle",
        price: 999,
        oldPrice: 1299,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
        description: "Bring a warm glow to your space.",
        tag: "NEW FIND"
    },
    {
        id: "product-005",
        name: "Everyday Sneakers",
        category: "Fashion",
        price: 1799,
        oldPrice: 2199,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
        description: "Comfort meets a clean, modern look.",
        tag: "TRENDING"
    },
    {
        id: "product-006",
        name: "Portable Bluetooth Speaker",
        category: "Electronics",
        price: 1299,
        oldPrice: 1599,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
        description: "Take your favourite playlists anywhere.",
        tag: "TOP PICK"
    },
    {
        id: "product-007",
        name: "Classic Sunglasses",
        category: "Accessories",
        price: 599,
        oldPrice: 799,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80",
        description: "An effortless finishing touch.",
        tag: "EVERYDAY"
    },
    {
        id: "product-008",
        name: "Ceramic Coffee Mug",
        category: "Lifestyle",
        price: 349,
        oldPrice: 449,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80",
        description: "Make your daily coffee ritual special.",
        tag: "UNDER ₹500"
    }
];

// Current filter and search values.
let homeActiveFilter = "All";
let homeSearchTerm = "";
let homeToastTimer = null;


// =========================================
// 1. GET CART FROM LOCAL STORAGE
// =========================================

function homeGetCart() {
    try {
        const homeStoredCart = localStorage.getItem(homeCartStorageKey);

        if (!homeStoredCart) {
            return [];
        }

        const homeParsedCart = JSON.parse(homeStoredCart);

        if (!Array.isArray(homeParsedCart)) {
            return [];
        }

        // Accept only valid cart items.
        return homeParsedCart.filter(function (homeItem) {
            return (
                homeItem &&
                typeof homeItem.id === "string" &&
                typeof homeItem.name === "string" &&
                Number.isFinite(homeItem.price) &&
                homeItem.price >= 0 &&
                typeof homeItem.image === "string" &&
                Number.isSafeInteger(homeItem.quantity) &&
                homeItem.quantity > 0
            );
        });
    } catch (homeError) {
        console.error("Unable to read the shopping cart:", homeError);
        return [];
    }
}


// =========================================
// 2. SAVE CART TO LOCAL STORAGE
// =========================================

function homeSaveCart(homeCartItems) {
    try {
        localStorage.setItem(
            homeCartStorageKey,
            JSON.stringify(homeCartItems)
        );

        homeUpdateCartCount();

        return true;
    } catch (homeError) {
        console.error("Unable to save the shopping cart:", homeError);

        homeShowToast(
            "Your cart could not be saved. Check your browser storage settings."
        );

        return false;
    }
}


// =========================================
// 3. UPDATE CART COUNT IN NAVIGATION
// =========================================

function homeUpdateCartCount() {
    const homeCartCountElement = document.getElementById("homeCartCount");

    if (!homeCartCountElement) {
        return;
    }

    const homeCartItems = homeGetCart();

    const homeTotalQuantity = homeCartItems.reduce(
        function (homeTotal, homeItem) {
            return homeTotal + homeItem.quantity;
        },
        0
    );

    homeCartCountElement.textContent =
        homeTotalQuantity > 99 ? "99+" : String(homeTotalQuantity);

    homeCartCountElement.setAttribute(
        "aria-label",
        homeTotalQuantity + " items in cart"
    );
}


// =========================================
// 4. FORMAT PRICES IN INDIAN RUPEES
// =========================================

function homeFormatPrice(homePrice) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(homePrice);
}


// =========================================
// 5. DISPLAY PRODUCT CARDS
// =========================================

function homeRenderProducts() {
    const homeProductGrid = document.getElementById("homeProductGrid");
    const homeNoProducts = document.getElementById("homeNoProducts");

    if (!homeProductGrid || !homeNoProducts) {
        return;
    }

    const homeFilteredProducts = homeProducts.filter(
        function (homeProduct) {
            const homeMatchesCategory =
                homeActiveFilter === "All" ||
                homeProduct.category === homeActiveFilter;

            const homeSearchText = [
                homeProduct.name,
                homeProduct.category,
                homeProduct.description
            ].join(" ").toLowerCase();

            const homeMatchesSearch =
                homeSearchText.includes(homeSearchTerm);

            return homeMatchesCategory && homeMatchesSearch;
        }
    );

    homeNoProducts.hidden = homeFilteredProducts.length > 0;

    if (homeFilteredProducts.length === 0) {
        homeProductGrid.innerHTML = "";
        return;
    }

    homeProductGrid.innerHTML = homeFilteredProducts.map(
        function (homeProduct) {
            return `
                <article class="home-product-card">
                    <div class="home-product-image-wrap">
                        <img
                            class="home-product-image"
                            src="${homeProduct.image}"
                            alt="${homeProduct.name}"
                            loading="lazy"
                        >

                        <span class="home-product-tag">
                            ${homeProduct.tag}
                        </span>
                    </div>

                    <div class="home-product-details">
                        <p class="home-product-category">
                            ${homeProduct.category}
                        </p>

                        <h3 class="home-product-name">
                            ${homeProduct.name}
                        </h3>

                        <p class="home-product-description">
                            ${homeProduct.description}
                        </p>

                        <div class="home-product-bottom">
                            <div class="home-product-price">
                                ${homeFormatPrice(homeProduct.price)}
                                <span class="home-product-old-price">
                                    ${homeFormatPrice(homeProduct.oldPrice)}
                                </span>
                            </div>

                            <button
                                type="button"
                                class="home-add-button"
                                data-product-id="${homeProduct.id}"
                                aria-label="Add ${homeProduct.name} to cart"
                            >
                                <span aria-hidden="true">+</span>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }
    ).join("");
}


// =========================================
// 6. ADD PRODUCT TO CART
// =========================================

function homeAddToCart(homeProductId) {
    const homeProduct = homeProducts.find(
        function (homeItem) {
            return homeItem.id === homeProductId;
        }
    );

    if (!homeProduct) {
        homeShowToast("This product could not be found.");
        return;
    }

    const homeCartItems = homeGetCart();

    const homeExistingItem = homeCartItems.find(
        function (homeItem) {
            return homeItem.id === homeProduct.id;
        }
    );

    if (homeExistingItem) {
        if (homeExistingItem.quantity >= 99) {
            homeShowToast("Maximum quantity reached for this product.");
            return;
        }

        homeExistingItem.quantity += 1;
    } else {
        // Use the exact shared product format agreed by the team.
        homeCartItems.push({
            id: homeProduct.id,
            name: homeProduct.name,
            price: homeProduct.price,
            image: homeProduct.image,
            quantity: 1
        });
    }

    const homeSavedSuccessfully = homeSaveCart(homeCartItems);

    if (homeSavedSuccessfully) {
        homeShowToast(homeProduct.name + " added to your cart!");
    }
}


// =========================================
// 7. TOAST NOTIFICATIONS
// =========================================

function homeShowToast(homeMessage) {
    const homeToast = document.getElementById("homeToast");

    if (!homeToast) {
        return;
    }

    homeToast.textContent = homeMessage;
    homeToast.classList.add("home-toast-visible");

    if (homeToastTimer !== null) {
        clearTimeout(homeToastTimer);
    }

    homeToastTimer = setTimeout(function () {
        homeToast.classList.remove("home-toast-visible");
        homeToastTimer = null;
    }, 2800);
}


// =========================================
// 8. PRODUCT CATEGORY FILTERS
// =========================================

function homeSetupFilters() {
    const homeFilterButtons = document.querySelectorAll(
        ".home-filter-button"
    );

    homeFilterButtons.forEach(function (homeButton) {
        homeButton.addEventListener("click", function () {
            homeActiveFilter = homeButton.dataset.filter;

            homeFilterButtons.forEach(function (homeFilterButton) {
                const homeIsActive =
                    homeFilterButton === homeButton;

                homeFilterButton.classList.toggle(
                    "home-filter-active",
                    homeIsActive
                );

                homeFilterButton.setAttribute(
                    "aria-pressed",
                    String(homeIsActive)
                );
            });

            homeRenderProducts();
        });
    });

    // Clicking a category card selects the matching product category.
    const homeCategoryLinks = document.querySelectorAll(
        "[data-category-link]"
    );

    homeCategoryLinks.forEach(function (homeLink) {
        homeLink.addEventListener("click", function () {
            const homeCategory = homeLink.dataset.categoryLink;

            homeActiveFilter = homeCategory;
            homeSearchTerm = "";

            const homeSearchInput =
                document.getElementById("homeProductSearch");

            if (homeSearchInput) {
                homeSearchInput.value = "";
            }

            homeFilterButtons.forEach(function (homeButton) {
                const homeIsActive =
                    homeButton.dataset.filter === homeCategory;

                homeButton.classList.toggle(
                    "home-filter-active",
                    homeIsActive
                );

                homeButton.setAttribute(
                    "aria-pressed",
                    String(homeIsActive)
                );
            });

            homeRenderProducts();
        });
    });
}


// =========================================
// 9. PRODUCT SEARCH
// =========================================

function homeSetupSearch() {
    const homeSearchInput = document.getElementById("homeProductSearch");
    const homeSearchToggle = document.getElementById("homeSearchToggle");

    if (homeSearchInput) {
        homeSearchInput.addEventListener("input", function () {
            homeSearchTerm = homeSearchInput.value.trim().toLowerCase();
            homeRenderProducts();
        });
    }

    if (homeSearchToggle && homeSearchInput) {
        homeSearchToggle.addEventListener("click", function () {
            homeSearchInput.focus();

            document.getElementById("homeProducts").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }
}


// =========================================
// 10. MOBILE NAVIGATION
// =========================================

function homeSetupMobileMenu() {
    const homeMenuToggle = document.getElementById("homeMenuToggle");
    const homeNavLinks = document.getElementById("homeNavLinks");

    if (!homeMenuToggle || !homeNavLinks) {
        return;
    }

    function homeCloseMenu() {
        homeNavLinks.classList.remove("home-nav-open");
        homeMenuToggle.setAttribute("aria-expanded", "false");
        homeMenuToggle.setAttribute("aria-label", "Open navigation menu");
        document.body.classList.remove("home-menu-open");
    }

    homeMenuToggle.addEventListener("click", function () {
        const homeIsOpen =
            homeNavLinks.classList.toggle("home-nav-open");

        homeMenuToggle.setAttribute(
            "aria-expanded",
            String(homeIsOpen)
        );

        homeMenuToggle.setAttribute(
            "aria-label",
            homeIsOpen ? "Close navigation menu" : "Open navigation menu"
        );

        document.body.classList.toggle("home-menu-open", homeIsOpen);
    });

    homeNavLinks.querySelectorAll("a").forEach(function (homeLink) {
        homeLink.addEventListener("click", homeCloseMenu);
    });

    // Close the menu when switching to desktop width.
    window.addEventListener("resize", function () {
        if (window.innerWidth > 760) {
            homeCloseMenu();
        }
    });

    // Close the menu when the Escape key is pressed.
    document.addEventListener("keydown", function (homeEvent) {
        if (homeEvent.key === "Escape") {
            homeCloseMenu();
        }
    });
}


// =========================================
// 11. NEWSLETTER DEMO FORM
// =========================================

function homeSetupNewsletter() {
    const homeNewsletterForm =
        document.getElementById("homeNewsletterForm");

    const homeNewsletterMessage =
        document.getElementById("homeNewsletterMessage");

    if (!homeNewsletterForm || !homeNewsletterMessage) {
        return;
    }

    homeNewsletterForm.addEventListener("submit", function (homeEvent) {
        homeEvent.preventDefault();

        const homeEmailInput =
            document.getElementById("homeNewsletterEmail");

        if (!homeEmailInput || !homeEmailInput.checkValidity()) {
            if (homeEmailInput) {
                homeEmailInput.reportValidity();
            }
            return;
        }

        homeNewsletterMessage.textContent =
            "Thanks for your interest! This demo form is not connected to a mailing service.";

        homeNewsletterForm.reset();
    });
}


// =========================================
// 12. FOOTER YEAR
// =========================================

function homeSetCurrentYear() {
    const homeYearElement = document.getElementById("homeCurrentYear");

    if (homeYearElement) {
        homeYearElement.textContent = String(new Date().getFullYear());
    }
}


// =========================================
// 13. INITIALIZE HOME PAGE
// =========================================

function homeInitialize() {
    homeRenderProducts();
    homeUpdateCartCount();

    homeSetupFilters();
    homeSetupSearch();
    homeSetupMobileMenu();
    homeSetupNewsletter();
    homeSetCurrentYear();

    // Keep the cart count current if another open tab changes the cart.
    window.addEventListener("storage", function (homeEvent) {
        if (homeEvent.key === homeCartStorageKey) {
            homeUpdateCartCount();
        }
    });
}

homeInitialize();