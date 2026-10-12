/* =========================================================
   AS STUDIO — PRODUCTS.JS
   products.html only
   Resource Hub: products, work, project resources
   Search, filter, preview, download limit, work request
   + XSS PROTECTION
   ========================================================= */


/* =========================================================
   XSS PROTECTION — HTML ESCAPE HELPER
========================================================= */
const YOUTUBE_URL = "https://youtube.com/@grimmhz?si=0GxLioYyLNANJph6";
function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}


/* =========================================================
   ELEMENT REFERENCES
   ========================================================= */

const dynamicProducts =
    document.getElementById("dynamicProducts");

const dynamicWork =
    document.getElementById("dynamicWork");

const dynamicResources =
    document.getElementById("dynamicResources");

const resourceSearch =
    document.getElementById("resourceSearch");

const categoryButtons =
    document.querySelectorAll(".category-btn");

let allResources = [];
let allWork = [];
let allUserResources = [];


/* =========================================================
   RESOURCE HELPERS
   ========================================================= */

function getFileUrl(file) {

    if (!file) return "";

    if (
        file.startsWith("http://") ||
        file.startsWith("https://")
    ) {

        return file;

    }

    return `${API_BASE}/uploads/${file}`;
}


function getFileExtension(file) {

    if (!file) return "";

    const cleanFile =
        file.split("?")[0];

    const parts =
        cleanFile.split(".");

    if (parts.length < 2) {
        return "";
    }

    return parts
        .pop()
        .toLowerCase();
}


function getResourceType(file) {

    const extension =
        getFileExtension(file);

    const imageTypes = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg"
    ];

    const videoTypes = [
        "mp4",
        "webm",
        "ogg",
        "mov"
    ];

    if (imageTypes.includes(extension)) {
        return "image";
    }

    if (videoTypes.includes(extension)) {
        return "video";
    }

    if (extension === "pdf") {
        return "pdf";
    }

    return "file";
}


function getResourceIcon(
    category = "",
    file = ""
) {

    const categoryText =
        category.toLowerCase();

    const extension =
        getFileExtension(file);

    if (categoryText.includes("html")) {
        return "HTML";
    }

    if (categoryText.includes("css")) {
        return "CSS";
    }

    if (
        categoryText.includes("javascript") ||
        categoryText === "js"
    ) {
        return "JS";
    }

    if (categoryText.includes("react")) {
        return "REACT";
    }

    if (categoryText.includes("node")) {
        return "NODE";
    }

    if (categoryText.includes("express")) {
        return "EXPRESS";
    }

    if (categoryText.includes("mongo")) {
        return "MONGO";
    }

    if (categoryText.includes("python")) {
        return "PY";
    }

    if (categoryText.includes("c++")) {
        return "C++";
    }

    if (categoryText.includes("figma")) {
        return "FIGMA";
    }

    if (categoryText.includes("ai")) {
        return "AI";
    }

    if (categoryText.includes("video")) {
        return "VIDEO";
    }

    if (extension === "pdf") {
        return "PDF";
    }

    if (
        getResourceType(file) === "video"
    ) {
        return "VIDEO";
    }

    return "FILE";
}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

let visibleResourceCount = 10;
const RESOURCE_BATCH_SIZE = 10;
let visibleProjectResourceCount = 10;
const PROJECT_RESOURCE_BATCH_SIZE = 10;


if (dynamicProducts) {
    loadProducts();
}


async function loadProducts() {

    if (!dynamicProducts) return;

    dynamicProducts.innerHTML = `
        <div class="resource-loading">
            Loading resources...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/products`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load resources"
            );

        }

        const products =
            await response.json();

        allResources =
            products.filter(
                (product) =>
                    product.type === "product"
            );

        visibleResourceCount = 10;

        renderProducts(
            allResources
        );

    } catch (error) {

        console.error(
            "Products loading failed:",
            error
        );

        dynamicProducts.innerHTML = `
            <div class="resource-error">

                <h3>
                    Unable to load resources
                </h3>

                <p>
                    Please make sure the server is running.
                </p>

            </div>
        `;
    }
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(products) {

    if (!dynamicProducts) return;

    dynamicProducts.innerHTML = "";

    if (!products.length) {

        dynamicProducts.innerHTML = `
            <div class="no-products">

                <h3></h3>

                <p></p>

            </div>
        `;

        return;
    }


    const visibleProducts =
        products.slice(
            0,
            visibleResourceCount
        );


    visibleProducts.forEach((product) => {

        const fileUrl =
            getFileUrl(
                product.file
            );

        const resourceType =
            getResourceType(
                product.file
            );

        const icon =
            getResourceIcon(
                product.category,
                product.file
            );

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "resource-card work-card";

        card.innerHTML = `

            <div class="resource-card-top">

                <div class="resource-icon">
                    ${esc(icon)}
                </div>

                <span class="resource-type">
                    ${esc(product.category) || "Resource"}
                </span>

            </div>


            <div class="resource-preview">

                ${
                    resourceType === "image"
                        ? `
                            <img
                                src="${esc(fileUrl)}"
                                alt="${esc(product.name) || "Resource"}"
                                class="product-image"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="resource-placeholder">

                                <span>
                                    ${esc(icon)}
                                </span>

                                <small>
                                    ${
                                        resourceType === "video"
                                            ? "VIDEO RESOURCE"
                                            : resourceType === "pdf"
                                                ? "PDF RESOURCE"
                                                : "DIGITAL RESOURCE"
                                    }
                                </small>

                            </div>
                        `
                }

            </div>


            <div class="resource-content">

                <span class="work-category">
                    ${esc(product.category) || "Resource"}
                </span>

                <h2>
                    ${esc(product.name) || "Untitled Resource"}
                </h2>

                <p class="resource-description">
                    ${esc(product.description) || "No description available."}
                </p>


                <div class="resource-meta">

                    <span>
                        ${
                            resourceType === "video"
                                ? "Watch"
                                : resourceType === "pdf"
                                    ? "PDF"
                                    : "Digital Resource"
                        }
                    </span>

                    <strong>
                        Rs. ${esc(product.price) || 0}
                    </strong>

                </div>


                <div class="resource-actions">

                    ${
                        fileUrl
                            ? `
                                <button
                                    type="button"
                                    class="product-view-btn">

                                    ${
                                        resourceType === "video"
                                            ? "Watch Video →"
                                            : "View Resource →"
                                    }

                                </button>
                            `
                            : ""
                    }

                </div>

            </div>
        `;


        const viewButton =
            card.querySelector(
                ".product-view-btn"
            );

        if (viewButton) {

            viewButton.addEventListener(
                "click",
                () => {

                    openFilePreview(
                        fileUrl,
                        product.name ||
                            "Resource Preview",
                        product.description ||
                            "",
                        resourceType
                    );

                }
            );

        }


        dynamicProducts.appendChild(
            card
        );

    });


    if (
        visibleResourceCount <
        products.length
    ) {

        const loadMoreWrapper =
            document.createElement(
                "div"
            );

        loadMoreWrapper.className =
            "resource-load-more";

        loadMoreWrapper.innerHTML = `

            <button
                type="button"
                id="loadMoreResourcesBtn"
                class="load-more-resources-btn">

                Load More Resources →

            </button>

        `;

        dynamicProducts.appendChild(
            loadMoreWrapper
        );


        document
            .getElementById(
                "loadMoreResourcesBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    visibleResourceCount +=
                        RESOURCE_BATCH_SIZE;

                    renderProducts(
                        products
                    );

                }
            );

    }

}

/* =========================================================
   RESOURCE SEARCH
   ========================================================= */

/* =========================================================
   RESOURCE SEARCH — WITH DEBOUNCE (300ms)
   ========================================================= */

let searchDebounceTimer = null;

if (resourceSearch) {

    resourceSearch.addEventListener(
        "input",
        () => {

            /* Clear previous timer */
            clearTimeout(searchDebounceTimer);

            /* Set new timer — 300ms wait */
            searchDebounceTimer = setTimeout(() => {

                const searchTerm =
                    resourceSearch.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    allResources.filter(
                        (resource) => {

                            const name =
                                (
                                    resource.name ||
                                    ""
                                ).toLowerCase();

                            const description =
                                (
                                    resource.description ||
                                    ""
                                ).toLowerCase();

                            const category =
                                (
                                    resource.category ||
                                    ""
                                ).toLowerCase();

                            return (
                                name.includes(searchTerm) ||
                                description.includes(searchTerm) ||
                                category.includes(searchTerm)
                            );

                        }
                    );

                visibleResourceCount = 10;

                renderProducts(
                    filtered
                );

            }, 300);

        }
    );
}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

categoryButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            categoryButtons.forEach(
                (item) => {
                    item.classList.remove(
                        "active"
                    );
                }
            );

            button.classList.add(
                "active"
            );

            const selectedCategory =
                (
                    button.dataset.category ||
                    button.textContent
                )
                .trim()
                .toLowerCase();

            if (
                selectedCategory === "all" ||
                selectedCategory === "all resources"
            ) {

                visibleResourceCount = 10;

                renderProducts(
                    allResources
                );

                return;
            }

            const filtered =
                allResources.filter(
                    (resource) => {

                        const category =
                            (
                                resource.category ||
                                ""
                            ).toLowerCase();

                        const name =
                            (
                                resource.name ||
                                ""
                            ).toLowerCase();

                        return (
                            category.includes(
                                selectedCategory
                            ) ||
                            name.includes(
                                selectedCategory
                            )
                        );

                    }
                );

            visibleResourceCount = 10;

            renderProducts(
                filtered
            );

        }
    );

});


/* =========================================================
   LOAD WORK
   ========================================================= */

if (dynamicWork) {
    loadWork();
}


async function loadWork() {

    if (!dynamicWork) return;

    dynamicWork.innerHTML = `
        <div class="resource-loading">
            Loading projects...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/products`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load work"
            );

        }

        const items =
            await response.json();

        allWork =
            items.filter(
                (item) =>
                    item.type === "work"
            );

        renderWork(
            allWork
        );

    } catch (error) {

        console.error(
            "Work loading failed:",
            error
        );

        dynamicWork.innerHTML = `
            <div class="resource-error">

                <h3>
                    Unable to load projects
                </h3>

                <p>
                    Please make sure the server is running.
                </p>

            </div>
        `;
    }
}


function openWorkRequest(workId) {

    const work =
        allWork.find(
            item =>
                item._id === workId
        );

    if (!work) {

        alert(
            "Work not found."
        );

        return;
    }

    const requestWork =
        document.getElementById(
            "requestWork"
        );

    if (requestWork) {

        requestWork.value =
            work.name ||
            "Untitled Project";

    }

    const modal =
        document.getElementById(
            "workRequestModal"
        );

    if (modal) {
        modal.style.display =
            "flex";
    }
}


function closeWorkRequest() {

    const modal =
        document.getElementById(
            "workRequestModal"
        );

    if (modal) {
        modal.style.display =
            "none";
    }

    document
        .getElementById(
            "workRequestForm"
        )
        ?.reset();
}


/* =========================================================
   WORK REQUEST FORM
   ========================================================= */

document
    .getElementById("workRequestForm")
    ?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "requestName"
                ).value.trim();

            const email =
                document.getElementById(
                    "requestEmail"
                ).value.trim();

            const work =
                document.getElementById(
                    "requestWork"
                ).value.trim();

            const message =
                document.getElementById(
                    "requestMessage"
                ).value.trim();

            if (
                !name ||
                !email ||
                !work ||
                !message
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/work-requests`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    work,
                                    message
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to submit request."
                    );

                }

                alert(
                    "Your work request has been submitted successfully!"
                );

                closeWorkRequest();

            } catch (error) {

                console.error(
                    "Work request error:",
                    error
                );

                alert(
                    error.message ||
                    "Something went wrong. Please try again."
                );

            }

        }
    );


/* =========================================================
   RENDER WORK
   ========================================================= */

function renderWork(works) {

    if (!dynamicWork) return;

    dynamicWork.innerHTML = "";

    if (!works.length) {

        dynamicWork.innerHTML = `
            <div class="no-products">

                <h3>
                    No projects available
                </h3>

                <p>
                    Our latest work will appear here.
                </p>

            </div>
        `;

        return;
    }

    works.forEach((work) => {

        const fileUrl =
            getFileUrl(
                work.file
            );

        const resourceType =
            getResourceType(
                work.file
            );

        const icon =
            getResourceIcon(
                work.category,
                work.file
            );

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "project-card work-card";

        card.innerHTML = `

            <div class="project-visual">

                ${
                    resourceType === "image"
                        ? `
                            <img
                                src="${esc(fileUrl)}"
                                alt="${esc(work.name) || "Project"}"
                                class="product-image"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="resource-placeholder">

                                <span>
                                    ${esc(icon)}
                                </span>

                                <small>
                                    PROJECT
                                </small>

                            </div>
                        `
                }

            </div>


            <div class="project-content">

                <span class="work-category">
                    ${esc(work.category) || "Project"}
                </span>

                <h2>
                    ${esc(work.name) || "Untitled Project"}
                </h2>


                <button
                    type="button"
                    class="request-work-btn"
                    data-work-id="${esc(work._id)}">

                    Request This Work

                </button>

            </div>
        `;


        const requestButton =
            card.querySelector(
                ".request-work-btn"
            );

        if (requestButton) {

            requestButton.addEventListener(
                "click",
                () => {

                    openWorkRequest(
                        requestButton.dataset.workId
                    );

                }
            );

        }


        dynamicWork.appendChild(
            card
        );

    });
}


/* =========================================================
   LOAD PROJECT RESOURCES
   ========================================================= */
if (dynamicResources) {
    loadUserResources();
}


async function loadUserResources() {

    if (!dynamicResources) return;

    dynamicResources.innerHTML = `
        <div class="resource-loading">
            Loading project resources...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/resources`
            );

        const resources =
            await response.json();

        if (!response.ok) {

            throw new Error(
                resources.message ||
                resources.error ||
                "Failed to load project resources."
            );

        }

        allUserResources = resources;

        visibleProjectResourceCount = 10;

        renderUserResources(
            resources
        );

    } catch (error) {

        console.error(
            "Project resources loading failed:",
            error
        );

        dynamicResources.innerHTML = `

            <div class="resource-error">

                <h3>
                    Unable to load resources
                </h3>

                <p>
                    Please make sure the server is running.
                </p>

            </div>

        `;

    }

}




/* =========================================================
   RENDER PROJECT RESOURCES
   ========================================================= */

function renderUserResources(resources) {

    if (!dynamicResources) return;

    dynamicResources.innerHTML = "";

    if (!resources.length) {

        dynamicResources.innerHTML = `
            <div class="no-products">
                <h3>No project resources available</h3>
                <p>New resources will appear here soon.</p>
            </div>
        `;

        return;
    }


    const visibleResources =
        resources.slice(
            0,
            visibleProjectResourceCount
        );


    visibleResources.forEach((resource) => {

        const fileUrl = getFileUrl(resource.file);
        const resourceType = getResourceType(resource.file);
        const icon = getResourceIcon(
            resource.projectName,
            resource.file
        );

        const access = resource.access || "free";
        const price = Number(resource.price) || 0;


        const card = document.createElement("article");

        card.className =
            "resource-card project-resource-card";


        card.innerHTML = `

            <div class="resource-card-top">

                <div class="resource-icon">
                    ${esc(icon)}
                </div>

                <span class="resource-type ${access === "paid" ? "paid" : ""}">
                    ${
                        access === "paid"
                            ? `Rs. ${esc(price)}`
                            : "FREE"
                    }
                </span>

            </div>


            <div class="resource-content">

                <h2>
                    ${esc(resource.projectName) || "Untitled Project"}
                </h2>

                <span class="resource-filename">
                    ${esc(resource.fileName) || "Resource"}
                </span>

            </div>


            <div class="resource-actions">

                <button
                    type="button"
                    class="resource-open-btn">

                    Open →

                </button>

            </div>
        `;


        const openButton =
            card.querySelector(
                ".resource-open-btn"
            );


        if (openButton) {

            openButton.addEventListener(
                "click",
                () => {

                    if (!fileUrl) {

                        alert(
                            "Resource file is not available."
                        );

                        return;
                    }


                    openFilePreview(
                        fileUrl,
                        resource.projectName ||
                            "Project Resource",

                        resource.description || "",

                        resourceType
                    );

                }
            );

        }


        dynamicResources.appendChild(card);

    });


    if (
        visibleProjectResourceCount <
        resources.length
    ) {

        const loadMoreWrapper =
            document.createElement("div");


        loadMoreWrapper.className =
            "resource-load-more";


        loadMoreWrapper.innerHTML = `

            <button
                type="button"
                id="loadMoreProjectResourcesBtn"
                class="load-more-resources-btn">

                Load More Resources →

            </button>

        `;


        dynamicResources.appendChild(
            loadMoreWrapper
        );


        document
            .getElementById(
                "loadMoreProjectResourcesBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    visibleProjectResourceCount +=
                        PROJECT_RESOURCE_BATCH_SIZE;

                    renderUserResources(
                        resources
                    );

                }
            );

    }

}


/* =========================================================
   FILE PREVIEW
   ========================================================= */

function safeGet(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "null");
    } catch (e) {
        return null;
    }
}

function safeSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("Storage failed");
    }
}


/* =====================================================
   GET DOWNLOAD DATA
===================================================== */

function getDownloadData() {

    const now = Date.now();

    let data;

    try {
        data = JSON.parse(localStorage.getItem("downloadLimit") || "null");
    } catch (e) {
        data = null;
    }

    if (!data) {
        data = { count: 0, resetAt: now };
    }

    if (
        !data.resetAt ||
        (now - data.resetAt) / 3600000 >= 24
    ) {
        data.count = 0;
        data.resetAt = now;
    }

    return data;
}


/* =====================================================
   SAVE DOWNLOAD DATA
===================================================== */

function saveDownloadData(data) {
    try {
        localStorage.setItem("downloadLimit", JSON.stringify(data));
    } catch (e) {}
}


/* =====================================================
   GET DAILY LIMIT
===================================================== */

function getDailyLimit() {
    return 3;
}


/* =====================================================
   FORCE DOWNLOAD
===================================================== */

function forceDownload(fileUrl, title) {

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = title || "resource";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/* =====================================================
   OPEN FILE PREVIEW
===================================================== */

function openFilePreview(
    fileUrl,
    title = "Preview",
    description = "",
    type = ""
) {

    const previewModal =
        document.getElementById("filePreviewModal");

    if (!previewModal) {

        if (fileUrl) {
            window.open(fileUrl, "_blank");
        }

        return;
    }

    const previewImage =
        document.getElementById("previewImage");

   

    const previewPdf =
        document.getElementById("previewPdf");

    const previewFallback =
        document.getElementById("previewFallback");

    const previewTitle =
        document.getElementById("previewTitle");

    const previewDescription =
        document.getElementById("previewDescription");

    const previewOpenLink =
        document.getElementById("previewOpenLink");


    if (previewTitle) {
        previewTitle.textContent = title;
    }

    if (previewDescription) {
        previewDescription.textContent =
            description || "No description available.";
    }

    if (previewImage) {
        previewImage.style.display = "none";
        previewImage.src = "";
    }

    

    if (previewPdf) {
        previewPdf.style.display = "none";
        previewPdf.src = "";
    }

    if (previewFallback) {
        previewFallback.style.display = "none";
    }


    const resourceType =
        type || getResourceType(fileUrl);


    if (resourceType === "image" && previewImage) {

        previewImage.src = fileUrl;
        previewImage.style.display = "block";

        previewImage.onerror = () => {
            previewImage.style.display = "none";
            if (previewFallback) {
                previewFallback.style.display = "block";
            }
        };

    }

    else if (resourceType === "pdf" && previewPdf) {

        previewPdf.src = fileUrl;
        previewPdf.style.display = "block";

    }

    else if (previewFallback) {

        previewFallback.style.display = "block";

    }


    /* =====================================================
       DOWNLOAD BUTTON — LIMIT + YOUTUBE REDIRECT
    ===================================================== */

    if (previewOpenLink) {

        previewOpenLink.href = fileUrl;
        previewOpenLink.target = "_blank";
        previewOpenLink.rel = "noopener noreferrer";

        previewOpenLink.textContent =
            resourceType === "video"
                ? "Open / Download Video →"
                : "Download →";


        const newLink = previewOpenLink.cloneNode(true);
        previewOpenLink.parentNode.replaceChild(newLink, previewOpenLink);


        newLink.addEventListener("click", (e) => {

            e.preventDefault();

            const data = getDownloadData();
            const limit = getDailyLimit();


            if (data.count >= limit) {

                const goYouTube = confirm(
                    `❌ Daily download limit reached!\n\n` +
                    `You can download ${limit} resources per 24 hours.\n\n` +
                    `🎬 Subscribe to our YouTube channel to get more downloads.\n\n` +
                    `Click OK to open YouTube.`
                );

                if (goYouTube) {
                    window.open(YOUTUBE_URL, "_blank");
                }

                return;
            }


            data.count += 1;
            saveDownloadData(data);

            forceDownload(fileUrl, title);

        });

    }


    previewModal.classList.add("active");
}


/* =========================================================
   CLOSE FILE PREVIEW
   ========================================================= */

function closeFilePreview() {

    const previewModal =
        document.getElementById(
            "filePreviewModal"
        );

    if (previewModal) {

        previewModal.classList.remove(
            "active"
        );

    }

}


document
    .getElementById("filePreviewModal")
    ?.addEventListener(
        "click",
        (event) => {

            if (
                event.target.id ===
                "filePreviewModal"
            ) {

                closeFilePreview();

            }

        }
    );


document
    .getElementById("closeFilePreviewBtn")
    ?.addEventListener(
        "click",
        closeFilePreview
    );


document
    .getElementById("closeWorkRequestBtn")
    ?.addEventListener(
        "click",
        closeWorkRequest
    );


/* =========================================================
   RESOURCE CARD 3D EFFECT
   ========================================================= */

function enableResourceTilt() {

    if (window.innerWidth < 700) {
        return;
    }

    document
        .querySelectorAll(
            ".resource-card, .project-card"
        )
        .forEach((card) => {

            if (card.dataset.tiltReady) {
                return;
            }

            card.dataset.tiltReady =
                "true";

            card.addEventListener(
                "pointermove",
                (event) => {

                    const rect =
                        card.getBoundingClientRect();

                    if (
                        !rect.width ||
                        !rect.height
                    ) {
                        return;
                    }

                    const x =
                        event.clientX -
                        rect.left;

                    const y =
                        event.clientY -
                        rect.top;

                    const rotateX =
                        ((y - rect.height / 2) /
                            (rect.height / 2)) *
                        -3;

                    const rotateY =
                        ((x - rect.width / 2) /
                            (rect.width / 2)) *
                        3;

                    card.style.transform =
                        `perspective(1000px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-6px)`;

                }
            );

            card.addEventListener(
                "pointerleave",
                () => {

                    card.style.transform =
                        "";

                }
            );

        });

}


const resourceObserver =
    new MutationObserver(
        () => {
            enableResourceTilt();
        }
    );


if (dynamicProducts) {

    resourceObserver.observe(
        dynamicProducts,
        {
            childList: true
        }
    );

}


if (dynamicWork) {

    resourceObserver.observe(
        dynamicWork,
        {
            childList: true
        }
    );

}


window.addEventListener(
    "load",
    () => {

        setTimeout(
            enableResourceTilt,
            300
        );

    }
);


/* =========================================================
   ESCAPE KEY (products page modals)
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }

        closeFilePreview();

    }
);


/* =========================================================
   SEARCH SUGGESTIONS — Products, Work, Project Resources
   ========================================================= */

(function setupSearchSuggestions() {

    const searchInput = document.getElementById("resourceSearch");
    const suggestionsBox = document.getElementById("searchSuggestions");

    if (!searchInput || !suggestionsBox) return;

    let currentSuggestionIndex = -1;
    let allSearchItems = [];

    function getAllSearchItems() {

        const items = [];

        (typeof allResources !== "undefined" ? allResources : []).forEach((p) => {
            items.push({
                id: p._id,
                name: p.name || "Untitled Product",
                category: p.category || "Product",
                description: p.description || "",
                type: "product",
                icon: getResourceIcon(p.category, p.file)
            });
        });

        (typeof allWork !== "undefined" ? allWork : []).forEach((w) => {
            items.push({
                id: w._id,
                name: w.name || "Untitled Work",
                category: w.category || "Work",
                description: w.description || "",
                type: "work",
                icon: getResourceIcon(w.category, w.file)
            });
        });

        (typeof allUserResources !== "undefined" ? allUserResources : []).forEach((r) => {
            items.push({
                id: r._id,
                name: r.projectName || "Untitled Project",
                category: "Project Resource",
                description: r.description || "",
                type: "resource",
                icon: getResourceIcon(r.projectName, r.file)
            });
        });

        return items;
    }

    function filterItems(term) {

        if (!term) return [];

        const lowerTerm = term.toLowerCase();

        return allSearchItems
            .filter((item) => {
                const name = (item.name || "").toLowerCase();
                const category = (item.category || "").toLowerCase();
                const description = (item.description || "").toLowerCase();

                return (
                    name.includes(lowerTerm) ||
                    category.includes(lowerTerm) ||
                    description.includes(lowerTerm)
                );
            })
            .slice(0, 8);
    }

    function renderSuggestions(items, term) {

        suggestionsBox.innerHTML = "";
        currentSuggestionIndex = -1;

        if (!term.trim()) {
            suggestionsBox.classList.remove("active");
            return;
        }

        if (!items.length) {
            suggestionsBox.innerHTML = `
                <div class="search-no-results">
                    No results found for "${esc(term)}"
                </div>
            `;
            suggestionsBox.classList.add("active");
            return;
        }

        items.forEach((item, index) => {

            const el = document.createElement("div");
            el.className = "search-suggestion";
            el.setAttribute("role", "option");
            el.dataset.index = index;

            el.innerHTML = `
                <div class="search-suggestion-info">
                    <h4>${esc(item.name)}</h4>
                </div>
                <span class="search-suggestion-type ${esc(item.type)}">
                    ${esc(item.type)}
                </span>
            `;

            el.addEventListener("click", () => {
                selectSuggestion(item);
            });

            suggestionsBox.appendChild(el);
        });

        suggestionsBox.classList.add("active");
    }

      function selectSuggestion(item) {

        searchInput.value = item.name;

        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        suggestionsBox.classList.remove("active");
        currentSuggestionIndex = -1;

        setTimeout(() => {

            let targetElement = null;

            /* ---------- FIND IN PRODUCTS ---------- */

            document.querySelectorAll(".resource-card:not(.project-resource-card)").forEach((card) => {
                const title = card.querySelector("h2");
                if (title && title.textContent.trim() === item.name) {
                    targetElement = card;
                }
            });

            /* ---------- FIND IN WORK ---------- */

            if (!targetElement) {
                document.querySelectorAll(".project-card").forEach((card) => {
                    const title = card.querySelector("h2");
                    if (title && title.textContent.trim() === item.name) {
                        targetElement = card;
                    }
                });
            }

            /* ---------- FIND IN PROJECT RESOURCES ---------- */

            if (!targetElement) {
                document.querySelectorAll(".project-resource-card").forEach((card) => {
                    const title = card.querySelector("h2");
                    if (title && title.textContent.trim() === item.name) {
                        targetElement = card;
                    }
                });
            }

            /* ---------- IF NOT FOUND — LOAD MORE ---------- */

            if (!targetElement) {

                /* Product Load More */
                const productLoadMore =
                    document.getElementById("loadMoreResourcesBtn");

                /* Project Resource Load More */
                const resourceLoadMore =
                    document.getElementById("loadMoreProjectResourcesBtn");

                let clicked = false;

                if (productLoadMore) {
                    productLoadMore.click();
                    clicked = true;
                }

                if (resourceLoadMore) {
                    resourceLoadMore.click();
                    clicked = true;
                }

                /* Wait for DOM update — phir dobara dhoondo */

                if (clicked) {

                    setTimeout(() => {

                        findAndScroll(item, searchInput);

                    }, 400);

                    return;
                }
            }

            /* ---------- SCROLL TO ELEMENT ---------- */

            scrollToTarget(targetElement);

        }, 150);
    }


    /* =====================================================
       FIND AND SCROLL (after load more)
    ===================================================== */

    function findAndScroll(item, searchInput) {

        let targetElement = null;

        document.querySelectorAll(".resource-card:not(.project-resource-card)").forEach((card) => {
            const title = card.querySelector("h2");
            if (title && title.textContent.trim() === item.name) {
                targetElement = card;
            }
        });

        if (!targetElement) {
            document.querySelectorAll(".project-card").forEach((card) => {
                const title = card.querySelector("h2");
                if (title && title.textContent.trim() === item.name) {
                    targetElement = card;
                }
            });
        }

        if (!targetElement) {
            document.querySelectorAll(".project-resource-card").forEach((card) => {
                const title = card.querySelector("h2");
                if (title && title.textContent.trim() === item.name) {
                    targetElement = card;
                }
            });
        }

        scrollToTarget(targetElement);
    }


    /* =====================================================
       SCROLL TO TARGET
    ===================================================== */

    function scrollToTarget(targetElement) {

        if (targetElement) {

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            targetElement.style.transition =
                "box-shadow 0.5s ease, border-color 0.5s ease";

            targetElement.style.boxShadow =
                "0 0 40px rgba(100, 240, 223, 0.4)";

            targetElement.style.borderColor =
                "rgba(100, 240, 223, 0.8)";

            setTimeout(() => {
                targetElement.style.boxShadow = "";
                targetElement.style.borderColor = "";
            }, 2500);

        } else {

            const resultsSection = document.getElementById("resources");

            if (resultsSection) {
                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    }

    searchInput.addEventListener("input", () => {

        allSearchItems = getAllSearchItems();

        const term = searchInput.value.trim();
        const filtered = filterItems(term);

        renderSuggestions(filtered, term);
    });

    searchInput.addEventListener("focus", () => {

        allSearchItems = getAllSearchItems();

        const term = searchInput.value.trim();

        if (term) {
            const filtered = filterItems(term);
            renderSuggestions(filtered, term);
        }
    });

    searchInput.addEventListener("keydown", (e) => {

        const suggestions = suggestionsBox.querySelectorAll(".search-suggestion");

        if (!suggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
            updateActiveSuggestion(suggestions);
        }

        else if (e.key === "ArrowUp") {
            e.preventDefault();
            currentSuggestionIndex = (currentSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            updateActiveSuggestion(suggestions);
        }

        else if (e.key === "Enter") {
            if (currentSuggestionIndex >= 0) {
                e.preventDefault();
                suggestions[currentSuggestionIndex].click();
            }
        }

        else if (e.key === "Escape") {
            suggestionsBox.classList.remove("active");
            currentSuggestionIndex = -1;
        }
    });

    function updateActiveSuggestion(suggestions) {

        suggestions.forEach((s, i) => {
            s.classList.toggle("active", i === currentSuggestionIndex);
        });

        if (suggestions[currentSuggestionIndex]) {
            suggestions[currentSuggestionIndex].scrollIntoView({
                block: "nearest"
            });
        }
    }

    document.addEventListener("click", (e) => {

        if (
            !suggestionsBox.contains(e.target) &&
            !searchInput.contains(e.target)
        ) {
            suggestionsBox.classList.remove("active");
            currentSuggestionIndex = -1;
        }
    });

})();
/* =========================================================
   WORK REQUEST — WHATSAPP BUTTON
========================================================= */

const sendWhatsAppBtn =
    document.getElementById("sendWhatsAppBtn");

if (sendWhatsAppBtn) {

    sendWhatsAppBtn.addEventListener(
        "click",
        () => {

            const name =
                document.getElementById("requestName").value.trim();

            const email =
                document.getElementById("requestEmail").value.trim();

            const work =
                document.getElementById("requestWork").value.trim();

            const message =
                document.getElementById("requestMessage").value.trim();


            /* Validation */
            if (!name || !email || !work || !message) {

                alert("Please fill all fields first.");

                return;

            }


            /* WhatsApp Message */
            const whatsappMessage =

                `Hello AS Studio! 👋\n\n` +

                `I want to request this work:\n\n` +

                `📌 *Work:* ${work}\n` +
                `👤 *Name:* ${name}\n` +
                `📧 *Email:* ${email}\n\n` +

                `📝 *Requirements:*\n${message}\n\n` +

                `Sent from AS Studio Website`;


            const encodedMessage =
                encodeURIComponent(whatsappMessage);


            /* WhatsApp Number */
            const whatsappNumber =
                "923449896081";


            const whatsappURL =
                `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;


            /* Open WhatsApp */
            window.open(whatsappURL, "_blank");


            /* Close Modal */
            closeWorkRequest();

        }
    );

}