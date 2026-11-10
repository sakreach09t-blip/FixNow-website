const navToggle = document.querySelector(".nav-toggle");
const mobileNavigation = document.querySelector("#mobile-navigation");
const navClose = document.querySelector(".nav-close");

function setMobileNavigationOpen(isOpen) {
    mobileNavigation.hidden = !isOpen;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

navToggle.addEventListener("click", () => {
    setMobileNavigationOpen(mobileNavigation.hidden);
});

navClose.addEventListener("click", () => {
    setMobileNavigationOpen(false);
    navToggle.focus();
});

mobileNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        setMobileNavigationOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNavigation.hidden) {
        setMobileNavigationOpen(false);
        navToggle.focus();
    }
});