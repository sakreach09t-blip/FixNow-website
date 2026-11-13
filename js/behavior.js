const navToggle = document.querySelector(".nav-toggle");
const mobileNavigation = document.querySelector("#mobile-navigation");
const navClose = document.querySelector(".nav-close");

function setMobileNavigationOpen(isOpen) {
    if (!navToggle || !mobileNavigation) return;

    mobileNavigation.hidden = !isOpen;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

if (navToggle && mobileNavigation) {
    navToggle.addEventListener("click", () => {
        setMobileNavigationOpen(mobileNavigation.hidden);
    });

    navClose?.addEventListener("click", () => {
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
}

const navigationLinks = document.querySelectorAll(".desktop-nav .nav-link, .mobile-nav-panel .nav-link");
const observedSections = [...document.querySelectorAll("main section[id]")];

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        const visibleSections = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        const activeSection = visibleSections[0]?.target;

        if (!activeSection) return;

        navigationLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${activeSection.id}`) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }, { rootMargin: "-25% 0px -65% 0px" });

    observedSections.forEach((section) => sectionObserver.observe(section));
}

const searchForm = document.querySelector("#service-search-form");
const searchInput = document.querySelector("#service-search");
const searchFeedback = document.querySelector("#search-feedback");
const technicianCards = [...document.querySelectorAll(".technician-card")];
const noTechnicians = document.querySelector("#no-technicians");

function filterTechnicians() {
    if (!searchInput || !searchFeedback || !noTechnicians) return;

    const query = searchInput.value.trim().toLowerCase().replace(/\s+/g, " ");
    let visibleCount = 0;

    technicianCards.forEach((card) => {
        const searchableText = `${card.dataset.search} ${card.textContent}`.toLowerCase();
        const matches = !query || searchableText.includes(query);
        card.hidden = !matches;
        visibleCount += Number(matches);
    });

    noTechnicians.hidden = visibleCount > 0;
    searchFeedback.textContent = query
        ? `${visibleCount} ${visibleCount === 1 ? "technician" : "technicians"} found for “${searchInput.value.trim()}”.`
        : "";
}

searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    filterTechnicians();
    document.querySelector("#technicians")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput?.addEventListener("input", filterTechnicians);

document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
        if (!searchInput) return;

        searchInput.value = button.dataset.service;
        filterTechnicians();
        document.querySelector("#technicians")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

document.querySelectorAll("[data-book]").forEach((button) => {
    button.addEventListener("click", () => {
        const feedback = document.querySelector("#booking-feedback");
        if (feedback) {
            feedback.textContent = `Online booking for ${button.dataset.book} is not available yet.`;
        }
    });
});

document.querySelectorAll("[data-signup]").forEach((button) => {
    button.addEventListener("click", () => {
        const feedback = document.querySelector("#join-feedback");
        if (feedback) {
            feedback.textContent = `${button.dataset.signup} sign-up is not available yet; a registration page has not been connected.`;
        }
    });
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            const oldWorkerUrl = new URL("./js/server-worker.js", window.location.href).href;
            await Promise.all(registrations
                .filter((registration) => [
                    registration.active?.scriptURL,
                    registration.installing?.scriptURL,
                    registration.waiting?.scriptURL
                ].includes(oldWorkerUrl))
                .map((registration) => registration.unregister()));
            await navigator.serviceWorker.register("./service-worker.js");
        } catch (error) {
            console.error("PWA service worker registration failed:", error);
        }
    });
}

let deferredPrompt;
const installButtons = [...document.querySelectorAll(".install-button")];
const desktopInstallButton = document.querySelector("#installApp");
const mobileInstallButton = document.querySelector("#installAppMobile");
const footerInstallButton = document.querySelector("#installAppFooter");

function isAppInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

function setInstallButtonsHidden(isHidden) {
    installButtons.forEach((button) => {
        button.hidden = isHidden;
    });
}

function showInstallHelp(button, message) {
    const feedback = button.id === "installAppMobile"
        ? document.querySelector("#mobile-install-feedback")
        : document.querySelector("#footer-download-feedback");

    if (feedback) {
        feedback.textContent = message;
        feedback.hidden = false;
    }
}

function isIOSDevice() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function getInstallHelpMessage() {
    if (isIOSDevice()) {
        return "In Safari, tap Share, then choose “Add to Home Screen” to install FixNow.";
    }

    return "The native install prompt is unavailable. Open your browser menu and choose “Install app” or “Add to Home Screen”.";
}

if (isAppInstalled()) {
    setInstallButtonsHidden(true);
} else {
    if (desktopInstallButton) desktopInstallButton.hidden = true;
    if (mobileInstallButton) mobileInstallButton.hidden = false;
    if (footerInstallButton) footerInstallButton.hidden = false;
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    if (isAppInstalled()) return;

    deferredPrompt = event;
    if (desktopInstallButton) desktopInstallButton.hidden = false;
    if (mobileInstallButton) mobileInstallButton.hidden = false;

    [document.querySelector("#mobile-install-feedback"), document.querySelector("#footer-download-feedback")]
        .forEach((feedback) => {
            if (feedback) feedback.hidden = true;
        });
});

window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setInstallButtonsHidden(true);
});

installButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        if (!deferredPrompt) {
            showInstallHelp(button, getInstallHelpMessage());
            return;
        }

        const installPrompt = deferredPrompt;
        deferredPrompt = null;

        try {
            await installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === "accepted" || isAppInstalled()) {
                setInstallButtonsHidden(true);
            } else {
                if (desktopInstallButton) desktopInstallButton.hidden = true;
                showInstallHelp(button, "Installation was canceled. You can install FixNow from your browser menu.");
            }
        } catch (error) {
            console.error("Could not open the FixNow installation prompt:", error);
            showInstallHelp(button, getInstallHelpMessage());
        }
    });
});
