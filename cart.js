
/* ========================================
   ShopEase Cart Page
   File: cart.js
   Storage key: ecommerce_cart
======================================== */

const cartStorageKey = "ecommerce_cart";
const cartShippingLimit = 2000;
const cartShippingCharge = 50;

const cartProductList = document.getElementById("cart-product-list");
const cartEmptyState = document.getElementById("cart-empty-state");
const cartPanelFooter = document.getElementById("cart-panel-footer");

const cartItemCount = document.getElementById("cart-item-count");
const cartNavCount = document.getElementById("cart-nav-count");
const cartSummaryQuantity = document.getElementById("cart-summary-quantity");

const cartSubtotalElement = document.getElementById("cart-subtotal");
const cartShippingElement = document.getElementById("cart-shipping");
const cartTotalElement = document.getElementById("cart-total");

const cartClearButton = document.getElementById("cart-clear-button");
const cartCheckoutButton = document.getElementById("cart-checkout-button");
const cartToast = document.getElementById("cart-toast");
const cartYear = document.getElementById("cart-year");

let cartProducts = [];
let cartToastTimer;

// Format numbers as Indian Rupees.
function cartFormatPrice(cartAmount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cartAmount);
}

// Read the shared cart from localStorage.
function cartLoadProducts() {
    try {
        const cartStoredData = localStorage.getItem(cartStorageKey);

        if (!cartStoredData) {
            return [];
        }

        const cartParsedData = JSON.parse(cartStoredData);

        if (!Array.isArray(cartParsedData)) {
            return [];
        }

        // Keep the Home Page's product format:
        // { id, name, price, image, quantity }
        return cartParsedData
            .filter(cartProduct => {
                return (
                    cartProduct &&
                    cartProduct.id !== undefined &&
                    cartProduct.id !== null &&
                    String(cartProduct.id).trim() !== "" &&
                    typeof cartProduct.name === "string" &&
                    cartProduct.name.trim() !== "" &&
                    Number.isFinite(Number(cartProduct.price)) &&
                    Number(cartProduct.price) >= 0 &&
                    Number.isSafeInteger(Number(cartProduct.quantity)) &&
                    Number(cartProduct.quantity) > 0 &&
                    Number(cartProduct.quantity) <= 999999 &&
                    (
                        typeof cartProduct.image === "string" ||
                        cartProduct.image == null
                    )
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
        console.error("Unable to read the shopping cart:", cartError);
        return [];
    }
}

// Save changes using the exact shared storage key.
function cartSaveProducts() {
    try {
        localStorage.setItem(
            cartStorageKey,
            JSON.stringify(cartProducts)
        );

        return true;
    } catch (cartError) {
        console.error("Unable to save the shopping cart:", cartError);
        cartShowToast(
            "Unable to save cart changes. Check browser storage settings."
        );
        return false;
    }
}

// Display a temporary message.
function cartShowToast(cartMessage) {
    cartToast.textContent = cartMessage;
    cartToast.hidden = false;

    clearTimeout(cartToastTimer);

    cartToastTimer = setTimeout(() => {
        cartToast.hidden = true;
    }, 2800);
}

// Create an element without inserting untrusted HTML.
function cartCreateElement(cartTag, cartClass, cartText) {
    const cartElement = document.createElement(cartTag);

    if (cartClass) {
        cartElement.className = cartClass;
    }

    if (cartText !== undefined) {
        cartElement.textContent = cartText;
    }

    return cartElement;
}

// Build one product row.
function cartCreateProductRow(cartProduct) {
    const cartRow = cartCreateElement(
        "article",
        "cart-product-row"
    );

    // Product image
    const cartImageWrap = cartCreateElement(
        "div",
        "cart-product-image-wrap"
    );

    const cartImage = cartCreateElement(
        "img",
        "cart-product-image"
    );

    cartImage.alt = cartProduct.name;
    cartImage.loading = "lazy";

    if (cartProduct.image) {
        cartImage.src = cartProduct.image;
    } else {
        cartImage.alt = `${cartProduct.name} image unavailable`;
    }

    // Hide broken image files instead of displaying a broken icon.
    cartImage.addEventListener("error", () => {
        cartImage.style.display = "none";
        cartImageWrap.style.background = "#eef2ff";
        cartImageWrap.setAttribute(
            "aria-label",
            "Product image unavailable"
        );
    }, { once: true });

    cartImageWrap.appendChild(cartImage);

    // Product details
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

    cartInfo.append(cartName, cartPrice, cartItemTotal);

    // Quantity controls
    const cartControls = cartCreateElement(
        "div",
        "cart-product-controls"
    );

    const cartQuantityControl = cartCreateElement(
        "div",
        "cart-quantity-control"
    );

    const cartDecreaseButton = cartCreateElement(
        "button",
        "cart-quantity-button",
        "−"
    );

    cartDecreaseButton.type = "button";
    cartDecreaseButton.setAttribute(
        "aria-label",
        `Decrease quantity of ${cartProduct.name}`
    );
    cartDecreaseButton.disabled = cartProduct.quantity <= 1;

    cartDecreaseButton.addEventListener("click", () => {
        cartChangeQuantity(cartProduct.id, -1);
    });

    const cartQuantityValue = cartCreateElement(
        "span",
        "cart-quantity-value",
        String(cartProduct.quantity)
    );

    cartQuantityValue.setAttribute(
        "aria-label",
        `Quantity: ${cartProduct.quantity}`
    );

    const cartIncreaseButton = cartCreateElement(
        "button",
        "cart-quantity-button",
        "+"
    );

    cartIncreaseButton.type = "button";
    cartIncreaseButton.setAttribute(
        "aria-label",
        `Increase quantity of ${cartProduct.name}`
    );
    cartIncreaseButton.disabled = cartProduct.quantity >= 999999;

    cartIncreaseButton.addEventListener("click", () => {
        cartChangeQuantity(cartProduct.id, 1);
    });

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

    cartControls.append(cartQuantityControl, cartRemoveButton);

    cartRow.append(cartImageWrap, cartInfo, cartControls);

    return cartRow;
}

// Render the product list and update totals.
function cartRender() {
    cartProductList.replaceChildren();

    let cartSubtotal = 0;
    let cartTotalQuantity = 0;

    cartProducts.forEach(cartProduct => {
        cartProductList.appendChild(
            cartCreateProductRow(cartProduct)
        );

        cartSubtotal += cartProduct.price * cartProduct.quantity;
        cartTotalQuantity += cartProduct.quantity;
    });

    // Shipping: free for orders of ₹2,000 or more.
    // This is a demo calculation, not a real shipping quote.
    const cartShipping =
        cartTotalQuantity === 0 || cartSubtotal >= cartShippingLimit
            ? 0
            : cartShippingCharge;

    const cartTotal = cartSubtotal + cartShipping;

    cartItemCount.textContent =
        `${cartTotalQuantity} ${
            cartTotalQuantity === 1 ? "item" : "items"
        }`;

    cartNavCount.textContent = String(cartTotalQuantity);
    cartSummaryQuantity.textContent = String(cartTotalQuantity);

    cartSubtotalElement.textContent = cartFormatPrice(cartSubtotal);
    cartShippingElement.textContent = cartFormatPrice(cartShipping);
    cartTotalElement.textContent = cartFormatPrice(cartTotal);

    const cartIsEmpty = cartProducts.length === 0;

    cartEmptyState.hidden = !cartIsEmpty;
    cartPanelFooter.hidden = cartIsEmpty;

    cartCheckoutButton.disabled = cartIsEmpty;
    cartClearButton.disabled = cartIsEmpty;

    cartCheckoutButton.setAttribute(
        "aria-disabled",
        String(cartIsEmpty)
    );
}

// Change a product's quantity.
function cartChangeQuantity(cartProductId, cartChange) {
    const cartProduct = cartProducts.find(
        item => String(item.id) === String(cartProductId)
    );

    if (!cartProduct) {
        return;
    }

    const cartNewQuantity = cartProduct.quantity + cartChange;

    if (cartNewQuantity < 1 || cartNewQuantity > 999999) {
        return;
    }

    cartProduct.quantity = cartNewQuantity;

    if (cartSaveProducts()) {
        cartRender();
    }
}

// Remove a product from the cart.
function cartRemoveProduct(cartProductId) {
    const cartProduct = cartProducts.find(
        item => String(item.id) === String(cartProductId)
    );

    if (!cartProduct) {
        return;
    }

    cartProducts = cartProducts.filter(
        item => String(item.id) !== String(cartProductId)
    );

    if (cartSaveProducts()) {
        cartRender();
        cartShowToast(`${cartProduct.name} removed from your cart.`);
    } else {
        // Restore the in-memory product if saving fails.
        cartProducts.push(cartProduct);
        cartRender();
    }
}

// Remove all products after user confirmation.
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

    const cartPreviousProducts = [...cartProducts];

    cartProducts = [];

    if (cartSaveProducts()) {
        cartRender();
        cartShowToast("Your cart has been cleared.");
    } else {
        cartProducts = cartPreviousProducts;
        cartRender();
    }
}

// Demo checkout: no order or payment is created.
function cartDemoCheckout() {
    if (cartProducts.length === 0) {
        cartShowToast("Your cart is empty. Add products to continue.");
        return;
    }

    window.alert(
        "Demo Checkout\n\n" +
        "Your cart contains " +
        cartProducts.reduce(
            (cartCount, cartProduct) =>
                cartCount + cartProduct.quantity,
            0
        ) +
        " item(s).\n\n" +
        "This is a student project demonstration. " +
        "No order has been placed and no payment will be processed."
    );
}

// Keep the cart synchronized when another tab changes localStorage.
window.addEventListener("storage", cartEvent => {
    if (cartEvent.key === cartStorageKey || cartEvent.key === null) {
        cartProducts = cartLoadProducts();
        cartRender();
    }
});

// Initialize the page.
cartYear.textContent = String(new Date().getFullYear());

cartClearButton.addEventListener("click", cartClearAll);
cartCheckoutButton.addEventListener("click", cartDemoCheckout);

cartProducts = cartLoadProducts();
cartRender();
