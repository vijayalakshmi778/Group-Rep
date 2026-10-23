
/* =========================================
   SHOPORA ABOUT PAGE
   File: about.js
   JavaScript names use the about prefix.
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    // Mobile navigation elements
    const aboutMenuToggle = document.getElementById("aboutMenuToggle");
    const aboutNavigation = document.getElementById("aboutNavigation");
    const aboutNavLinks = document.querySelectorAll(".about-nav-link");

    // Copyright year element
    const aboutCurrentYear = document.getElementById("aboutCurrentYear");

    // Back to top element
    const aboutBackTop = document.getElementById("aboutBackTop");

    // Set the current year automatically
    if (aboutCurrentYear) {
        aboutCurrentYear.textContent = new Date().getFullYear();
    }

    // Open and close the mobile navigation
    function aboutToggleNavigation(shouldOpen) {
        if (!aboutMenuToggle || !aboutNavigation) {
            return;
        }

        aboutMenuToggle.classList.toggle("about-menu-open", shouldOpen);
        aboutNavigation.classList.toggle("about-navigation-open", shouldOpen);

        aboutMenuToggle.setAttribute(
            "aria-expanded",
            String(shouldOpen)
        );

        aboutMenuToggle.setAttribute(
            "aria-label",
            shouldOpen ? "Close navigation menu" : "Open navigation menu"
        );
    }

    if (aboutMenuToggle && aboutNavigation) {
        aboutMenuToggle.addEventListener("click", function () {
            const aboutIsOpen =
                aboutMenuToggle.getAttribute("aria-expanded") === "true";

            aboutToggleNavigation(!aboutIsOpen);
        });

        // Close the menu after choosing a navigation link
        aboutNavLinks.forEach(function (aboutLink) {
            aboutLink.addEventListener("click", function () {
                aboutToggleNavigation(false);
            });
        });

        // Close the menu when clicking outside it
        document.addEventListener("click", function (aboutEvent) {
            const aboutClickedInsideNavigation =
                aboutNavigation.contains(aboutEvent.target);

            const aboutClickedToggle =
                aboutMenuToggle.contains(aboutEvent.target);

            if (!aboutClickedInsideNavigation && !aboutClickedToggle) {
                aboutToggleNavigation(false);
            }
        });

        // Close the menu with the Escape key
        document.addEventListener("keydown", function (aboutEvent) {
            if (aboutEvent.key === "Escape") {
                aboutToggleNavigation(false);
                aboutMenuToggle.focus();
            }
        });

        // Close the mobile menu when returning to desktop width
        window.addEventListener("resize", function () {
            if (window.innerWidth > 700) {
                aboutToggleNavigation(false);
            }
        });
    }

    // Smoothly scroll back to the top
    if (aboutBackTop) {
        aboutBackTop.addEventListener("click", function (aboutEvent) {
            aboutEvent.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
                    ? "auto"
                    : "smooth"
            });
        });
    }

    // Highlight the current About link
    aboutNavLinks.forEach(function (aboutLink) {
        if (aboutLink.getAttribute("href") === "about.html") {
            aboutLink.setAttribute("aria-current", "page");
        }
    });
});
