
/* ==========================================
   NovaMart - Shopping Cart
   File: cart.js
   Storage key: ecommerce_cart

   Shared product format:
   { id, name, price, image, quantity }
========================================== */

"use strict";

// ------------------------------------------
// 1. CONFIGURATION
// ------------------------------------------

const cartStorageKey = "ecommerce_cart";
const cartShippingLimit = 2000;
const cartShippingCharge = 50;
const cartMaximumQuantity = 999999;

// ------------------------------------------
// 2. HTML ELEMENTS
// ------------------------------------------

const cartProductList = document.getElementById("cart-product-list");
const cartEmptyState = document.getElementById("cart-empty-state");
const cartPanelFooter = document.getElementById("cart-panel-footer");

const cartItemCount = document.getElementById("cart-item-count");
const cartNavCount = document.getElementById("cart-nav-count");
const cartSummaryQuantity = document.getElementById(
    "cart-summary-quantity"
);

const cartSubtotalElement = document.getElementById("cart-subtotal");
const cartShippingElement = document.getElementById("cart-shipping");
const cartTotalElement = document.getElementById("cart-total");

const cartClearButton = document.getElementById("cart-clear-button");
const cartCheckoutButton = document.getElementById(
    "cart-checkout-button"
);

const cartToast = document.getElementById("cart-toast");
const cartYear = document.getElementById("cart-year");

const cartMobileToggle = document.getElementById("cart-mobile-toggle");
const cartNavigation = document.getElementById("cart-navigation");

// ------------------------------------------
// 3. CART STATE
// ------------------------------------------

let cartProducts = [];
let cartToastTimer = null;

// ------------------------------------------
// 4. FORMAT PRICE
// ------------------------------------------

function cartFormatPrice(cartAmount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cartAmount);
}

// ------------------------------------------
// 5. READ CART FROM LOCALSTORAGE
// ------------------------------------------

function cartLoadProducts() {
    try {
        const cartStoredData = localStorage.getItem(cartStorageKey);

        if (!cartStoredData) {
            return [];
        }

        const cartParsedData = JSON.parse(cartStoredData);

        if (!Array.isArray(cartParsedData)) {
            console.error("Cart data must be an array.");
            return [];
        }

        return cartParsedData
            .filter(cartProduct => {
                if (
                    !cartProduct ||
                    typeof cartProduct !== "object"
                ) {
                    return false;
                }

                const cartValidId =
                    cartProduct.id !== undefined &&
                    cartProduct.id !== null &&
                    String(cartProduct.id).trim() !== "";

                const cartValidName =
                    typeof cartProduct.name === "string" &&
                    cartProduct.name.trim() !== "";

                const cartValidPrice =
                    cartProduct.price !== null &&
                    cartProduct.price !== "" &&
                    Number.isFinite(Number(cartProduct.price)) &&
                    Number(cartProduct.price) >= 0;

                const cartValidQuantity =
                    Number.isSafeInteger(Number(cartProduct.quantity)) &&
                    Number(cartProduct.quantity) >= 1 &&
                    Number(cartProduct.quantity) <= cartMaximumQuantity;

                const cartValidImage =
                    typeof cartProduct.image === "string" ||
                    cartProduct.image == null;

                return (
                    cartValidId &&
                    cartValidName &&
                    cartValidPrice &&
                    cartValidQuantity &&
                    cartValidImage
                );
            })
            .map(cartProduct => ({
                id: cartProduct.id,
                name: cartProduct.name,
                price: Number(cartProduct.price),
                image: cartProduct.image || "",
                quantity: Number(cartProduct.quantity)
            }));

    } catch (cartError) {
        console.error(
            "Error reading cart from localStorage:",
            cartError
        );

        return [];
    }
}

// ------------------------------------------
// 6. SAVE CART TO LOCALSTORAGE
// ------------------------------------------

function cartSaveProducts() {
    try {
        localStorage.setItem(
            cartStorageKey,
            JSON.stringify(cartProducts)
        );

        return true;

    } catch (cartError) {
        console.error(
            "Error saving cart to localStorage:",
            cartError
        );

        cartShowToast(
            "Could not save changes. Check your browser storage."
        );

        return false;
    }
}

// ------------------------------------------
// 7. SHOW NOTIFICATION
// ------------------------------------------

function cartShowToast(cartMessage) {
    if (!cartToast) {
        return;
    }

    cartToast.textContent = cartMessage;
    cartToast.hidden = false;

    if (cartToastTimer !== null) {
        clearTimeout(cartToastTimer);
    }

    cartToastTimer = setTimeout(() => {
        cartToast.hidden = true;
        cartToastTimer = null;
    }, 2800);
}

// ------------------------------------------
// 8. CREATE HTML ELEMENTS SAFELY
// ------------------------------------------

function cartCreateElement(
    cartTag,
    cartClass = "",
    cartText = undefined
) {
    const cartElement = document.createElement(cartTag);

    if (cartClass) {
        cartElement.className = cartClass;
    }

    if (cartText !== undefined) {
        cartElement.textContent = cartText;
    }

    return cartElement;
}

// ------------------------------------------
// 9. CREATE PRODUCT IMAGE
// ------------------------------------------

function cartCreateProductImage(cartProduct) {
    const cartImageWrap = cartCreateElement(
        "div",
        "cart-product-image-wrap"
    );

    if (!cartProduct.image) {
        cartImageWrap.textContent = "Image unavailable";
        cartImageWrap.setAttribute("role", "img");
        cartImageWrap.setAttribute(
            "aria-label",
            `${cartProduct.name}: image unavailable`
        );

        return cartImageWrap;
    }

    const cartImage = cartCreateElement(
        "img",
        "cart-product-image"
    );

    cartImage.src = cartProduct.image;
    cartImage.alt = cartProduct.name;
    cartImage.loading = "lazy";

    cartImage.addEventListener("error", () => {
        cartImage.remove();

        cartImageWrap.textContent = "Image unavailable";
        cartImageWrap.setAttribute("role", "img");
        cartImageWrap.setAttribute(
            "aria-label",
            `${cartProduct.name}: image unavailable`
        );
    }, { once: true });

    cartImageWrap.appendChild(cartImage);

    return cartImageWrap;
}

// ------------------------------------------
// 10. CREATE QUANTITY BUTTON
// ------------------------------------------

function cartCreateQuantityButton(
    cartLabel,
    cartSymbol,
    cartDisabled,
    cartAction
) {
    const cartButton = cartCreateElement(
        "button",
        "cart-quantity-button",
        cartSymbol
    );

    cartButton.type = "button";
    cartButton.setAttribute("aria-label", cartLabel);
    cartButton.disabled = cartDisabled;

    cartButton.addEventListener("click", cartAction);

    return cartButton;
}

// ------------------------------------------
// 11. CREATE A PRODUCT ROW
// ------------------------------------------

function cartCreateProductRow(cartProduct) {
    const cartRow = cartCreateElement(
        "article",
        "cart-product-row"
    );

    // Product image
    const cartImageWrap = cartCreateProductImage(cartProduct);

    // Product information
    const cartInfo = cartCreateElement(
        "div",
        "cart-product-info"
    );

    const cartName = cartCreateElement(
        "h3",
        "cart-product-name",
        cartProduct.name
    );

    const cartPrice = cartCreateElement(
        "p",
        "cart-product-price",
        `Unit price: ${cartFormatPrice(cartProduct.price)}`
    );

    const cartItemTotal = cartCreateElement(
        "p",
        "cart-product-item-total",
        `Item total: ${cartFormatPrice(
            cartProduct.price * cartProduct.quantity
        )}`
    );

    cartInfo.append(
        cartName,
        cartPrice,
        cartItemTotal
    );

    // Quantity controls
    const cartControls = cartCreateElement(
        "div",
        "cart-product-controls"
    );

    const cartQuantityControl = cartCreateElement(
        "div",
        "cart-quantity-control"
    );

    const cartDecreaseButton = cartCreateQuantityButton(
        `Decrease quantity of ${cartProduct.name}`,
        "−",
        cartProduct.quantity <= 1,
        () => cartChangeQuantity(cartProduct.id, -1)
    );

    const cartQuantityValue = cartCreateElement(
        "span",
        "cart-quantity-value",
        String(cartProduct.quantity)
    );

    cartQuantityValue.setAttribute(
        "aria-label",
        `Quantity: ${cartProduct.quantity}`
    );

    const cartIncreaseButton = cartCreateQuantityButton(
        `Increase quantity of ${cartProduct.name}`,
        "+",
        cartProduct.quantity >= cartMaximumQuantity,
        () => cartChangeQuantity(cartProduct.id, 1)
    );

    cartQuantityControl.append(
        cartDecreaseButton,
        cartQuantityValue,
        cartIncreaseButton
    );

    // Remove button
    const cartRemoveButton = cartCreateElement(
        "button",
        "cart-remove-button",
        "Remove item"
    );

    cartRemoveButton.type = "button";

    cartRemoveButton.setAttribute(
        "aria-label",
        `Remove ${cartProduct.name} from cart`
    );

    cartRemoveButton.addEventListener("click", () => {
        cartRemoveProduct(cartProduct.id);
    });

    cartControls.append(
        cartQuantityControl,
        cartRemoveButton
    );

    cartRow.append(
        cartImageWrap,
        cartInfo,
        cartControls
    );

    return cartRow;
}

// ------------------------------------------
// 12. CALCULATE CART TOTALS
// ------------------------------------------

function cartCalculateTotals() {
    let cartSubtotal = 0;
    let cartTotalQuantity = 0;

    cartProducts.forEach(cartProduct => {
        cartSubtotal +=
            cartProduct.price * cartProduct.quantity;

        cartTotalQuantity += cartProduct.quantity;
    });

    const cartShipping =
        cartTotalQuantity === 0 ||
        cartSubtotal >= cartShippingLimit
            ? 0
            : cartShippingCharge;

    const cartTotal = cartSubtotal + cartShipping;

    return {
        subtotal: cartSubtotal,
        quantity: cartTotalQuantity,
        shipping: cartShipping,
        total: cartTotal
    };
}

// ------------------------------------------
// 13. RENDER CART AND UPDATE SUMMARY
// ------------------------------------------

function cartRender() {
    if (!cartProductList) {
        console.error("Cart product list element was not found.");
        return;
    }

    cartProductList.replaceChildren();

    cartProducts.forEach(cartProduct => {
        const cartRow = cartCreateProductRow(cartProduct);

        cartProductList.appendChild(cartRow);
    });

    const cartTotals = cartCalculateTotals();

    const cartIsEmpty = cartProducts.length === 0;

    // Item count
    if (cartItemCount) {
        cartItemCount.textContent =
            `${cartTotals.quantity} ${
                cartTotals.quantity === 1 ? "item" : "items"
            }`;
    }

    // Navigation badge
    if (cartNavCount) {
        cartNavCount.textContent = String(cartTotals.quantity);
    }

    // Summary quantity
    if (cartSummaryQuantity) {
        cartSummaryQuantity.textContent =
            String(cartTotals.quantity);
    }

    // Price summary
    if (cartSubtotalElement) {
        cartSubtotalElement.textContent =
            cartFormatPrice(cartTotals.subtotal);
    }

    if (cartShippingElement) {
        cartShippingElement.textContent =
            cartFormatPrice(cartTotals.shipping);
    }

    if (cartTotalElement) {
        cartTotalElement.textContent =
            cartFormatPrice(cartTotals.total);
    }

    // Empty cart state
    if (cartEmptyState) {
        cartEmptyState.hidden = !cartIsEmpty;
    }

    if (cartPanelFooter) {
        cartPanelFooter.hidden = cartIsEmpty;
    }

    // Buttons
    if (cartCheckoutButton) {
        cartCheckoutButton.disabled = cartIsEmpty;

        cartCheckoutButton.setAttribute(
            "aria-disabled",
            String(cartIsEmpty)
        );
    }

    if (cartClearButton) {
        cartClearButton.disabled = cartIsEmpty;
    }
}

// ------------------------------------------
// 14. INCREASE OR DECREASE QUANTITY
// ------------------------------------------

function cartChangeQuantity(cartProductId, cartChange) {
    const cartProduct = cartProducts.find(
        cartItem =>
            String(cartItem.id) === String(cartProductId)
    );

    if (!cartProduct) {
        return;
    }

    const cartNewQuantity =
        cartProduct.quantity + cartChange;

    if (
        cartNewQuantity < 1 ||
        cartNewQuantity > cartMaximumQuantity
    ) {
        return;
    }

    const cartPreviousQuantity = cartProduct.quantity;

    cartProduct.quantity = cartNewQuantity;

    if (cartSaveProducts()) {
        cartRender();
    } else {
        cartProduct.quantity = cartPreviousQuantity;
        cartRender();
    }
}

// ------------------------------------------
// 15. REMOVE A PRODUCT
// ------------------------------------------

function cartRemoveProduct(cartProductId) {
    const cartProductIndex = cartProducts.findIndex(
        cartItem =>
            String(cartItem.id) === String(cartProductId)
    );

    if (cartProductIndex === -1) {
        return;
    }

    const cartRemovedProduct =
        cartProducts[cartProductIndex];

    cartProducts.splice(cartProductIndex, 1);

    if (cartSaveProducts()) {
        cartRender();

        cartShowToast(
            `${cartRemovedProduct.name} removed from your cart.`
        );
    } else {
        cartProducts.splice(
            cartProductIndex,
            0,
            cartRemovedProduct
        );

        cartRender();
    }
}

// ------------------------------------------
// 16. CLEAR ALL CART ITEMS
// ------------------------------------------

function cartClearAll() {
    if (cartProducts.length === 0) {
        return;
    }

    const cartConfirmed = window.confirm(
        "Are you sure you want to remove all items from your cart?"
    );

    if (!cartConfirmed) {
        return;
    }

    const cartPreviousProducts = cartProducts;

    cartProducts = [];

    if (cartSaveProducts()) {
        cartRender();
        cartShowToast("Your cart has been cleared.");
    } else {
        cartProducts = cartPreviousProducts;
        cartRender();
    }
}

// ------------------------------------------
// 17. DEMO CHECKOUT
// ------------------------------------------

function cartDemoCheckout() {
    if (cartProducts.length === 0) {
        cartShowToast(
            "Your cart is empty. Add products to continue."
        );

        return;
    }

    const cartTotals = cartCalculateTotals();

    window.alert(
        "NovaMart - Demo Checkout\n\n" +
        `Items: ${cartTotals.quantity}\n` +
        `Subtotal: ${cartFormatPrice(cartTotals.subtotal)}\n` +
        `Shipping: ${cartFormatPrice(cartTotals.shipping)}\n` +
        `Total: ${cartFormatPrice(cartTotals.total)}\n\n` +
        "This is a student project demonstration.\n" +
        "No order has been placed and no payment will be processed."
    );
}

// ------------------------------------------
// 18. MOBILE NAVIGATION
// ------------------------------------------

function cartCloseMobileNavigation() {
    if (!cartMobileToggle || !cartNavigation) {
        return;
    }

    cartMobileToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    cartMobileToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
    );

    cartNavigation.classList.remove("cart-nav-open");
}

function cartInitializeMobileNavigation() {
    if (!cartMobileToggle || !cartNavigation) {
        return;
    }

    cartMobileToggle.addEventListener("click", () => {
        const cartMenuIsOpen =
            cartMobileToggle.getAttribute(
                "aria-expanded"
            ) === "true";

        const cartShouldOpen = !cartMenuIsOpen;

        cartMobileToggle.setAttribute(
            "aria-expanded",
            String(cartShouldOpen)
        );

        cartMobileToggle.setAttribute(
            "aria-label",
            cartShouldOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

        cartNavigation.classList.toggle(
            "cart-nav-open",
            cartShouldOpen
        );
    });

    cartNavigation.querySelectorAll("a").forEach(cartLink => {
        cartLink.addEventListener("click", () => {
            cartCloseMobileNavigation();
        });
    });

    document.addEventListener("keydown", cartEvent => {
        if (cartEvent.key === "Escape") {
            const cartWasOpen =
                cartMobileToggle.getAttribute(
                    "aria-expanded"
                ) === "true";

            cartCloseMobileNavigation();

            if (cartWasOpen) {
                cartMobileToggle.focus();
            }
        }
    });

    // Close the mobile menu when resizing to desktop.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 600) {
            cartCloseMobileNavigation();
        }
    });

    // Close the menu if the user clicks outside it.
    document.addEventListener("click", cartEvent => {
        if (
            cartMobileToggle.getAttribute(
                "aria-expanded"
            ) !== "true"
        ) {
            return;
        }

        if (
            !cartNavigation.contains(cartEvent.target) &&
            !cartMobileToggle.contains(cartEvent.target)
        ) {
            cartCloseMobileNavigation();
        }
    });
}

// ------------------------------------------
// 19. SYNC CART ACROSS BROWSER TABS
// ------------------------------------------

window.addEventListener("storage", cartEvent => {
    if (
        cartEvent.key === cartStorageKey ||
        cartEvent.key === null
    ) {
        cartProducts = cartLoadProducts();
        cartRender();
    }
});

// ------------------------------------------
// 20. INITIALIZE CART PAGE
// ------------------------------------------

function cartInitialize() {
    if (cartYear) {
        cartYear.textContent =
            String(new Date().getFullYear());
    }

    if (cartClearButton) {
        cartClearButton.addEventListener(
            "click",
            cartClearAll
        );
    }

    if (cartCheckoutButton) {
        cartCheckoutButton.addEventListener(
            "click",
            cartDemoCheckout
        );
    }

    cartInitializeMobileNavigation();

    cartProducts = cartLoadProducts();

    cartRender();
}

cartInitialize();
