/* =========================================================
   AS STUDIO — COMMON.JS
   Shared across: Web.html, products.html, Admin.html
   Loader, Auth, Theme, Mobile Menu, Support Panels
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

// common.js line ~15
var API_BASE = "http://localhost:5000";




/* =========================================================
   LOADER
   ========================================================= */

const loader = document.getElementById("loader");

function hideLoader() {
    if (loader) {
        loader.classList.add("hide");
    }
}

setTimeout(hideLoader, 1200);

window.addEventListener("load", () => {
    setTimeout(hideLoader, 300);
});




/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements =
    document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

    revealElements.forEach((element) => {
        observer.observe(element);
    });

} else {

    revealElements.forEach((element) => {
        element.classList.add("show");
    });

}


/* =========================================================
   DATA SCROLL
   ========================================================= */

document
    .querySelectorAll("[data-scroll]")
    .forEach((button) => {

        button.addEventListener("click", () => {

            const section =
                document.getElementById(
                    button.dataset.scroll
                );

            if (section) {

                section.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });


/* =========================================================
   AUTH
   ========================================================= */

function openAuth(mode = "signup") {

    const modal =
        document.getElementById("authModal");

    if (!modal) return;

    modal.classList.add("active");

    switchAuth(mode);
}


function closeAuth() {

    const modal =
        document.getElementById("authModal");

    if (modal) {
        modal.classList.remove("active");
    }
}


function switchAuth(mode) {

    const signin =
        mode === "signin";

    document
        .getElementById("signinPanel")
        ?.classList.toggle(
            "active",
            signin
        );

    document
        .getElementById("signupPanel")
        ?.classList.toggle(
            "active",
            !signin
        );

    document
        .getElementById("signinTab")
        ?.classList.toggle(
            "active",
            signin
        );

    document
        .getElementById("signupTab")
        ?.classList.toggle(
            "active",
            !signin
        );
}


/* =========================================================
   AUTH MODAL CLOSE
   ========================================================= */

document
    .getElementById("authModal")
    ?.addEventListener(
        "click",
        (event) => {

            if (
                event.target.id ===
                "authModal"
            ) {
                closeAuth();
            }

        }
    );


/* =========================================================
   SIGN UP
   ========================================================= */

document
    .getElementById("signupForm")
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const password =
                document.getElementById(
                    "signupPassword"
                )?.value;

            const confirm =
                document.getElementById(
                    "confirmPassword"
                )?.value;

            if (password !== confirm) {

                alert(
                    "Passwords do not match."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/users/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name:
                                        document.getElementById(
                                            "signupName"
                                        )?.value,

                                    email:
                                        document.getElementById(
                                            "signupEmail"
                                        )?.value,

                                    password
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Registration failed."
                    );

                    return;
                }

                sessionStorage.setItem("token", data.token);
                updateNavbarAuth();
                event.target.reset();
                closeAuth();

                /* ✅ Redirect check — FIRST priority */
                if (window.openProductsAfterLogin) {
                    window.openProductsAfterLogin = false;
                    window.location.href = "products.html";
                    return;
                }

                showWelcomePrompt();

            } catch (error) {

                console.error(
                    "Registration failed:",
                    error
                );

                alert(
                    "Server connection failed."
                );
            }

        }
    );


/* =========================================================
   WELCOME PROMPT
   ========================================================= */

function showWelcomePrompt() {

    const prompt =
        document.getElementById(
            "welcomePrompt"
        );

    if (prompt) {
        prompt.classList.add("active");
    }
}


function closeWelcomePrompt() {

    const prompt =
        document.getElementById(
            "welcomePrompt"
        );

    if (prompt) {
        prompt.classList.remove("active");
    }
}


/* =========================================================
   SIGN IN
========================================================= */

/* ✅ Use window property — accessible from all scripts */
window.openProductsAfterLogin = false;

document
    .getElementById("signinForm")
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "signinEmail"
                )?.value;

            const password =
                document.getElementById(
                    "signinPassword"
                )?.value;

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/users/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Login failed."
                    );

                    return;
                }

                sessionStorage.setItem("token", data.token);
                updateNavbarAuth();
                event.target.reset();
                closeAuth();

                /* ✅ Redirect check — FIRST priority */
                if (window.openProductsAfterLogin) {
                    window.openProductsAfterLogin = false;
                    window.location.href = "products.html";
                    return;
                }

                /* ✅ SIGN IN WELCOME ANIMATION (only if no redirect) */
                showSignInWelcome(
                    data.user?.name || "User"
                );

            } catch (error) {

                console.error(
                    "Login failed:",
                    error
                );

                alert(
                    "Server connection failed."
                );
            }

        }
    );


/* =========================================================
   OPEN PRODUCTS
   ========================================================= */

function openProducts() {

    const token =
        sessionStorage.getItem("token");

    if (token) {

        window.location.href =
            "products.html";

        return;
    }

    window.openProductsAfterLogin = true;

    openAuth("signin");
}


/* =========================================================
   PRODUCTS PAGE PROTECTION
   ========================================================= */


if (
    window.location.pathname.toLowerCase().endsWith("products.html") ||
    window.location.pathname.toLowerCase() === "/products"
) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "/";  // ✅ Direct root
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}



/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (!toggle || !input) return;

    toggle.addEventListener("click", () => {
        const visible = input.type === "text";

        input.type = visible ? "password" : "text";
        toggle.textContent = visible ? "👁️" : "👁";
        toggle.setAttribute(
            "aria-label",
            visible ? "Show password" : "Hide password"
        );

        toggle.parentElement.classList.toggle("password-visible", !visible);
    });
}

setupPasswordToggle("signinPasswordToggle", "signinPassword");
setupPasswordToggle("signupPasswordToggle", "signupPassword");
setupPasswordToggle("confirmPasswordToggle", "confirmPassword");


/* =========================================================
   LIGHT / DARK THEME TOGGLE
   ========================================================= */

(function setupThemeToggle() {

    const toggle =
        document.getElementById("themeToggle");

    if (!toggle) return;

    const STORAGE_KEY = "asStudioTheme";

    try {

        const saved =
            sessionStorage.getItem(STORAGE_KEY);

        if (saved === "light") {

            document.body.classList.add("light-theme");

        }

    } catch (e) {

        console.warn("Theme storage unavailable");

    }

    toggle.addEventListener("click", () => {

        const isLight =
            document.body.classList.toggle("light-theme");

        try {

            sessionStorage.setItem(
                STORAGE_KEY,
                isLight ? "light" : "dark"
            );

        } catch (e) {

            console.warn("Theme storage unavailable");

        }

    });

})();


/* =========================================================
   NAVBAR AUTH STATE
   ========================================================= */

function updateNavbarAuth() {

    const authButtons =
        document.getElementById("authButtons");

    const supportActions =
        document.getElementById("supportActions");

    const token =
        sessionStorage.getItem("token");

    if (token) {

        if (authButtons) {
            authButtons.style.display = "none";
        }

        if (supportActions) {
            supportActions.style.display = "flex";
        }

    } else {

        if (authButtons) {
            authButtons.style.display = "flex";
        }

        if (supportActions) {
            supportActions.style.display = "none";
        }

    }
}


document.addEventListener("DOMContentLoaded", () => {

    updateNavbarAuth();

});


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMobileMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    const hamburger =
        document.getElementById(
            "hamburger"
        );

    if (!menu || !hamburger) return;

    menu.classList.toggle(
        "active"
    );

    hamburger.classList.toggle(
        "active"
    );

}


function closeMobileMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    const hamburger =
        document.getElementById(
            "hamburger"
        );

    if (menu) {

        menu.classList.remove(
            "active"
        );

    }

    if (hamburger) {

        hamburger.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   MOBILE MENU BUTTON
   ========================================================= */

document
    .getElementById("hamburger")
    ?.addEventListener(
        "click",
        toggleMobileMenu
    );


document
    .getElementById("mobileCloseBtn")
    ?.addEventListener(
        "click",
        closeMobileMenu
    );


document
    .getElementById("mobileSigninBtn")
    ?.addEventListener(
        "click",
        () => {

            openAuth("signin");

            closeMobileMenu();

        }
    );


document
    .getElementById("mobileSignupBtn")
    ?.addEventListener(
        "click",
        () => {

            openAuth("signup");

            closeMobileMenu();

        }
    );


document
    .querySelectorAll(
        "#mobileMenu a"
    )
    .forEach((link) => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });


/* =========================================================
   NAV / AUTH STATIC BUTTONS
   ========================================================= */

document
    .getElementById("navSignin")
    ?.addEventListener(
        "click",
        () => {
            openAuth("signin");
        }
    );


document
    .getElementById("navSignup")
    ?.addEventListener(
        "click",
        () => {
            openAuth("signup");
        }
    );


document
    .getElementById("closeAuthBtn")
    ?.addEventListener(
        "click",
        closeAuth
    );


document
    .getElementById("signinTab")
    ?.addEventListener(
        "click",
        () => {
            switchAuth("signin");
        }
    );


document
    .getElementById("signupTab")
    ?.addEventListener(
        "click",
        () => {
            switchAuth("signup");
        }
    );


document
    .getElementById("switchToSignupBtn")
    ?.addEventListener(
        "click",
        () => {
            switchAuth("signup");
        }
    );


document
    .getElementById("switchToSigninBtn")
    ?.addEventListener(
        "click",
        () => {
            switchAuth("signin");
        }
    );


document
    .getElementById("welcomeContinueBtn")
    ?.addEventListener(
        "click",
        closeWelcomePrompt
    );


/* =========================================================
   SUPPORT / FAQ / GUIDELINES PANELS
   ========================================================= */

const supportInfo = {

    faq: {
        title: "Frequently Asked Questions (FAQ)",
        icon: "?",
        description:
            "Find clear answers to common questions about using AS Studio, managing your account, and accessing digital assets.<br><br>" +

            "<strong>How do I create an account and log in?</strong><br>" +
            "Click the Sign Up button on the homepage, enter your details, and verify your email address. Once registered, log in anytime using your email and password via the Log In button.<br><br>" +

            "<strong>How do I access and download resources?</strong><br>" +
            "Browse or search for your required materials in the catalog. Free resources can be downloaded directly from the file page. For premium resources, access is unlocked instantly in your account library after completing checkout.<br><br>" +

            "<strong>How do purchases and payments work?</strong><br>" +
            "Select the premium resource you want, proceed to checkout, and complete payment through our secure checkout system. A confirmation receipt and direct download link will be available immediately in your account dashboard and sent to your email.<br><br>" +

            "<strong>What should I do if a download fails or a file won't open?</strong><br>" +
            "First, check your internet connection and try refreshing your browser cache. If the download remains broken or the file appears corrupted, visit your account dashboard to retry or contact our support team with your order details."
    },



       support: {
        title: "User Support",
        icon: "◉",
        description:
            "Need help resolving an issue? The AS Studio support team is here to assist with account access, billing, downloads, and technical troubleshooting.<br><br>" +

            "To help us resolve your issue quickly, please include:<br><br>" +

            "<strong>Account Email:</strong><br>" +
            "The email address associated with your AS Studio account.<br><br>" +

            "<strong>Category:</strong><br>" +
            "Account access, resource availability, billing, or site error.<br><br>" +

            "<strong>Details & Evidence:</strong><br>" +
            "A brief description of the issue, along with order numbers, transaction IDs, or screenshots if available.<br><br>" +

            "Contact support directly at <strong>as.studio.site@gmail.com</strong> or open a ticket through the <strong>Support Portal</strong>."
    },
        guidelines: {
        title: "Community Guidelines",
        icon: "✓",
        description:
            "AS Studio is committed to maintaining a professional, respectful, and reliable environment for accessing and sharing digital resources. By using our platform, you agree to:<br><br>" +

            "<strong>Maintain Professionalism:</strong><br>" +
            "Communicate respectfully and constructively with other members, creators, and staff in all platform interactions.<br><br>" +

            "<strong>Respect Intellectual Property:</strong><br>" +
            "All resources, templates, and digital media hosted on AS Studio are protected by copyright. Content is licensed for individual use only according to the specified terms.<br><br>" +

            "<strong>Prohibit Redistribution:</strong><br>" +
            "Reselling, sublicensing, sharing access credentials, or publicly uploading restricted files to third-party sites is strictly forbidden.<br><br>" +

            "<strong>Ensure Platform Security:</strong><br>" +
            "Any attempt to scrape content, bypass access restrictions, or disrupt website operations will result in immediate suspension."
    }

};


function openSupportPanel(type) {

    const info = supportInfo[type];

    if (!info) return;

    let panel =
        document.getElementById(
            "supportInfoPanel"
        );

    if (!panel) {

        panel =
            document.createElement("div");

        panel.id =
            "supportInfoPanel";

        panel.className =
            "support-info-panel";

        document.body.appendChild(panel);
    }


    panel.innerHTML = `

        <div class="support-info-card">

            <button
                type="button"
                class="support-info-close"
                id="supportInfoClose"
                aria-label="Close">
                ×
            </button>


            <div class="support-info-icon">
                ${info.icon}
            </div>


            <h2>
                ${info.title}
            </h2>


            <p>
                ${info.description}
            </p>


            <label class="support-accept-row">

                <input
                    type="checkbox"
                    id="supportAcceptCheckbox">

                <span>
                    I have read and accept this information.
                </span>

            </label>


            <button
                type="button"
                class="support-accept-btn"
                id="supportAcceptBtn"
                disabled>

                Accept & Continue →

            </button>

        </div>

    `;


    const acceptCheckbox =
        document.getElementById(
            "supportAcceptCheckbox"
        );


    const acceptButton =
        document.getElementById(
            "supportAcceptBtn"
        );


    if (acceptCheckbox && acceptButton) {

        acceptCheckbox.addEventListener(
            "change",
            () => {

                acceptButton.disabled =
                    !acceptCheckbox.checked;

            }
        );

    }


    acceptButton?.addEventListener(
        "click",
        () => {

            if (!acceptCheckbox?.checked) {
                return;
            }

            window.location.href =
                "Web.html";

        }
    );


    requestAnimationFrame(() => {

        panel.classList.add("active");

    });


    document
        .getElementById("supportInfoClose")
        ?.addEventListener(
            "click",
            closeSupportPanel
        );


    panel.addEventListener(
        "click",
        (event) => {

            if (event.target === panel) {

                closeSupportPanel();

            }

        }
    );

}


function closeSupportPanel() {

    const panel =
        document.getElementById(
            "supportInfoPanel"
        );

    if (!panel) return;


    panel.classList.remove("active");


    setTimeout(() => {

        panel.remove();

    }, 250);

}


document
    .getElementById("faqBtn")
    ?.addEventListener(
        "click",
        () => {
            openSupportPanel("faq");
        }
    );


document
    .getElementById("supportBtn")
    ?.addEventListener(
        "click",
        () => {
            openSupportPanel("support");
        }
    );


document
    .getElementById("guidelinesBtn")
    ?.addEventListener(
        "click",
        () => {
            openSupportPanel("guidelines");
        }
    );


/* =========================================================
   ESCAPE KEY (Common modals)
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }

        closeAuth();

        closeMobileMenu();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.switchAuth = switchAuth;
window.openProducts = openProducts;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.closeWelcomePrompt = closeWelcomePrompt;
window.updateNavbarAuth = updateNavbarAuth;

/* =========================================================
   FORGOT PASSWORD + RESET PASSWORD
========================================================= */


/* =========================================================
   OPEN FORGOT PASSWORD PANEL
========================================================= */

document
    .getElementById("forgotPasswordLink")
    ?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            showAuthPanel("forgotPanel");

        }
    );


/* =========================================================
   BACK TO SIGNIN
========================================================= */

document
    .getElementById("backToSigninBtn")
    ?.addEventListener(
        "click",
        () => {

            showAuthPanel("signinPanel");

        }
    );


/* =========================================================
   SHOW AUTH PANEL (Helper)
========================================================= */

function showAuthPanel(panelId) {

    const allPanels =
        document.querySelectorAll(".auth-panel");

    allPanels.forEach((panel) => {

        panel.classList.remove("active");

    });


    const target =
        document.getElementById(panelId);

    if (target) {

        target.classList.add("active");

    }


    /* Tabs — hide when not signin/signup */
    const tabs =
        document.querySelector(".auth-tabs");

    if (tabs) {

        const isMainTab =
            panelId === "signinPanel" ||
            panelId === "signupPanel";

        tabs.style.display =
            isMainTab ? "grid" : "none";

    }

}


/* =========================================================
   FORGOT PASSWORD FORM SUBMIT
========================================================= */
/* =========================================================
   FORGOT PASSWORD FORM SUBMIT
========================================================= */

/* =========================================================
   FORGOT PASSWORD FORM SUBMIT — WITH 60s TIMER
========================================================= */

let forgotTimerInterval = null;
const FORGOT_COOLDOWN_SECONDS = 60;


document
    .getElementById("forgotForm")
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("forgotEmail")
                    ?.value
                    .trim();


            const submitBtn =
                document.getElementById("forgotSubmitBtn");

            const btnText =
                document.getElementById("forgotBtnText");


            /* Already disabled? Do nothing */
            if (submitBtn?.disabled) {
                return;
            }


            if (!email) {

                alert("Please enter your email address.");

                return;

            }


            try {

                await fetch(
                    `${API_BASE}/api/users/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email
                        })
                    }
                );


                /* ✅ Success — Start 60s cooldown */
                startForgotCooldown();


            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );

                alert(
                    "Something went wrong. Please try again."
                );

            }

        }
    );


/* =========================================================
   START COOLDOWN (60 SECONDS)
========================================================= */

function startForgotCooldown() {

    const submitBtn =
        document.getElementById("forgotSubmitBtn");

    const btnText =
        document.getElementById("forgotBtnText");


    if (!submitBtn || !btnText) return;


    let secondsLeft = FORGOT_COOLDOWN_SECONDS;


    /* Disable button */
    submitBtn.disabled = true;

    btnText.textContent =
        `Resend in ${secondsLeft}s...`;


    /* Clear any existing timer */
    if (forgotTimerInterval) {

        clearInterval(forgotTimerInterval);

    }


    /* Start countdown */
    forgotTimerInterval = setInterval(() => {

        secondsLeft--;


        if (secondsLeft <= 0) {

            /* Timer complete — Enable button */
            clearInterval(forgotTimerInterval);
            forgotTimerInterval = null;

            submitBtn.disabled = false;

            btnText.textContent = "Resend Link →";

        } else {

            btnText.textContent =
                `Resend in ${secondsLeft}s...`;

        }

    }, 1000);

}


/* =========================================================
   RESET PASSWORD FORM SUBMIT
========================================================= */


document
    .getElementById("resetPasswordForm")
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const newPassword =
                document.getElementById("newPassword")?.value;

            const confirmPassword =
                document.getElementById("confirmNewPassword")?.value;


            /* Validation */
            if (
                typeof newPassword !== "string" ||
                newPassword.length < 8
            ) {

                alert(
                    "Password must be at least 8 characters long."
                );

                return;

            }


            if (newPassword !== confirmPassword) {

                alert("Passwords do not match.");

                return;

            }


            /* Get token from URL */
            const urlParams =
                new URLSearchParams(window.location.search);

            const token =
                urlParams.get("reset");


            if (!token) {

                alert(
                    "Reset token is missing. Please use the link from your email."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/users/reset-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                token,
                                password: newPassword
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Failed to reset password."
                    );

                    return;

                }


                /* Reset form */
                event.target.reset();


                /* Remove token from URL */
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                );


                /* Show sign in panel */
                showAuthPanel("signinPanel");


            } catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );

                alert(
                    "Something went wrong. Please try again."
                );

            }

        }
    );


/* =========================================================
   CHECK URL FOR RESET TOKEN ON PAGE LOAD
========================================================= */

(function checkResetToken() {

    const urlParams =
        new URLSearchParams(window.location.search);

    const token =
        urlParams.get("reset");


    if (token) {

        /* Open auth modal with reset panel */
        const modal =
            document.getElementById("authModal");

        if (modal) {

            modal.classList.add("active");

            showAuthPanel("resetPasswordPanel");

        }

    }

})();


/* =========================================================
   PASSWORD TOGGLE — Forgot + Reset
========================================================= */

setupPasswordToggle(
    "newPasswordToggle",
    "newPassword"
);

setupPasswordToggle(
    "confirmNewPasswordToggle",
    "confirmNewPassword"
);
/* =========================================================
   SIGN IN WELCOME ANIMATION
========================================================= */

function showSignInWelcome(userName) {

    const overlay =
        document.getElementById(
            "signInWelcomeOverlay"
        );

    const nameEl =
        document.getElementById(
            "signInWelcomeName"
        );


    if (!overlay) return;


    /* Set user name */
    if (nameEl) {

        if (nameEl) {
    nameEl.textContent = `Hello, ${userName} 👋`;
}

    }


    /* Show overlay */
    overlay.classList.add("active");


    /* Auto hide after 3.5 seconds */
    setTimeout(() => {

        overlay.classList.remove("active");

    }, 2000);

}


/* =========================================================
   GLOBAL FUNCTION
========================================================= */

window.showSignInWelcome = showSignInWelcome;
/* ============================================================
   SATELLITE — Scroll Responsive Movement
============================================================ */


/* =========================================================
   LOGOUT ICON BUTTON — Navbar (Sirf login ke baad)
========================================================= */

const logoutIconBtn = document.getElementById("logoutIconBtn");

if (logoutIconBtn) {
    logoutIconBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to logout?")) {
            logout();
        }
    });
}