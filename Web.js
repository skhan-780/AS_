/* =========================================================
   AS STUDIO — WEB.JS
   Home page only (Web.html)
   ========================================================= */


/* =========================================================
   3D TILT HELPER
   ========================================================= */

function addTilt(element, amount = 7) {
    if (!element) return;

    element.addEventListener("pointermove", (event) => {

        if (window.innerWidth < 700) return;

        const rect =
            element.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        const rotateY =
            ((x / rect.width) - 0.5) * amount;

        const rotateX =
            ((y / rect.height) - 0.5) * -amount;

        element.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-7px)`;
    });

    element.addEventListener("pointerleave", () => {
        element.style.transform = "";
    });
}

document
    .querySelectorAll(".feature-card, .security-card")
    .forEach((card) => addTilt(card, 8));


/* =========================================================
   STATIC BUTTON EVENTS (Home page)
   ========================================================= */

document
    .getElementById("getStartedBtn")
    ?.addEventListener(
        "click",
        () => {
            /* Scroll to CTA section */
            const ctaSection =
                document.getElementById("view");

            if (ctaSection) {
                ctaSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    );


document
    .getElementById("exploreServicesBtn")
    ?.addEventListener(
        "click",
        () => {
            openProducts();
        }
    );


document
    .getElementById("startProjectBtn")
    ?.addEventListener(
        "click",
        () => {

            /* ✅ 1. Check if already logged in */
            const token = sessionStorage.getItem("token");

            if (token) {
                /* Direct redirect — no modal */
                window.location.href = "/products";
                return;
            }

            /* ✅ 2. Set flag for future signin/signup */
            window.openProductsAfterLogin = true;

            /* ✅ 3. Open modal */
            openAuth("signup");
        }
    );


/* ============================================================
   NAVBAR — Ultra Transparent → Glass on Scroll
============================================================ */

(function navbarScroll() {
    const nav = document.querySelector("nav");
    if (!nav) return;

    let ticking = false;
    let isScrolled = false;

    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY > 40;

                if (scrolled !== isScrolled) {
                    isScrolled = scrolled;

                    if (scrolled) {
                        nav.classList.add("scrolled");
                    } else {
                        nav.classList.remove("scrolled");
                    }
                }

                ticking = false;
            });

            ticking = true;
        }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
})();