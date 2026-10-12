/* =========================================================
   AS STUDIO — CONTACT.JS
   contact.html only
   Social card interactions + analytics
   ========================================================= */


/* =========================================================
   SOCIAL CARD CLICK TRACKING
============================================================ */

document
    .querySelectorAll(".social-contact-card")
    .forEach((card) => {

        card.addEventListener(
            "click",
            () => {

                const platform =
                    card.classList[1] ||
                    "unknown";

                console.log(
                    `📱 Contact: ${platform} clicked`
                );

            }
        );

    });


/* =========================================================
   SMOOTH ENTRY ANIMATION
============================================================ */

window.addEventListener(
    "load",
    () => {

        const cards =
            document.querySelectorAll(
                ".social-contact-card"
            );

        cards.forEach((card, index) => {

            card.style.opacity = "0";
            card.style.transform =
                "translateY(30px)";

            setTimeout(() => {

                card.style.transition =
                    "opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

                card.style.opacity = "1";
                card.style.transform =
                    "translateY(0)";

            }, 100 + (index * 80));

        });

    }
);
