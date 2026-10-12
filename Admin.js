/* =========================================================
   AS STUDIO — ADMIN.JS
   Admin.html only
   Admin login, Product CRUD, Work CRUD, Resource CRUD
   + SECURITY LAYERS + XSS PROTECTION
   ========================================================= */


/* =========================================================
   XSS PROTECTION — HTML ESCAPE HELPER
========================================================= */
/* =========================================================
   ✅ FIX: API_BASE define karo (inline script CSP issue se bachne ke liye)
========================================================= */

var API_BASE = window.location.origin;
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
   ✅ FIX #4: ADMIN PAGE DETECTION — HELPER
   Saare route variations handle karein:
   - /admin
   - /admin/
   - /admin.html
   - /Admin.html (aur koi bhi case)
========================================================= */

function isAdminPage() {

    const path =
        window.location.pathname.toLowerCase();

    return (
        path.endsWith("admin.html") ||
        path === "/admin" ||
        path === "/admin/"
    );

}


/* =========================================================
   ✅ FIX: ADMIN PAGE PROTECTION — SMART REDIRECT
   
   Logic:
   - Agar token nahi hai → login form dikhao (redirect NA karo)
   - Agar token valid hai → dashboard dikhao
   - Agar token invalid/expired hai → token hatao, login form dikhao
========================================================= */

(function protectAdminPage() {

    /* Sirf admin pages pe chalega */
    if (!isAdminPage()) {
        return;
    }

    const adminToken =
        localStorage.getItem("adminToken");


    /* CHECK 1: Token exists? */
    if (!adminToken) {

        /* ✅ FIX: No token → login form dikhao, redirect NA karo */
        return;

    }


    /* CHECK 2: JWT format (3 parts) */
    const tokenParts =
        adminToken.split(".");

    if (tokenParts.length !== 3) {

        /* ✅ Invalid token → hata do, login form dikhao */
        localStorage.removeItem("adminToken");
        return;

    }


    /* CHECK 3: Role + Expiry */
    try {

        const payload = JSON.parse(
            atob(
                tokenParts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );


        /* Role check */
        if (payload.role !== "admin") {

            /* ✅ Invalid role → hata do, login form dikhao */
            localStorage.removeItem("adminToken");
            return;

        }


        /* Expiry check */
        if (payload.exp) {

            const now =
                Math.floor(Date.now() / 1000);

            if (payload.exp < now) {

                /* ✅ Expired → hata do, login form dikhao */
                localStorage.removeItem("adminToken");
                return;

            }

        }


        /* ✅ Token valid hai — dashboard dikhao, login form hide karo */
        const adminLogin =
            document.getElementById("adminLogin");

        const adminDashboard =
            document.getElementById("adminDashboard");

        if (adminLogin) {
            adminLogin.style.display = "none";
        }

        if (adminDashboard) {
            adminDashboard.style.display = "block";
        }


    } catch (error) {

        /* ✅ Invalid token → hata do, login form dikhao */
        localStorage.removeItem("adminToken");
        return;

    }

})();


/* =========================================================
   ✅ FIX #4: AUTO LOGOUT — INACTIVITY (30 min)
   Ab /admin clean URL pe bhi kaam karega.
========================================================= */

(function autoLogoutOnInactivity() {

    if (!isAdminPage()) {
        return;
    }


    const INACTIVITY_LIMIT =
        30 * 60 * 1000;


    let inactivityTimer;


    function resetTimer() {

        clearTimeout(inactivityTimer);

        inactivityTimer =
            setTimeout(() => {

                localStorage.removeItem("adminToken");

                alert(
                    "You have been logged out due to 30 minutes of inactivity."
                );

                window.location.href = "/";

            }, INACTIVITY_LIMIT);

    }


    ["mousemove", "keydown", "click", "scroll"]
        .forEach((event) => {

            document.addEventListener(
                event,
                resetTimer,
                { passive: true }
            );

        });


    resetTimer();

})();


/* =========================================================
   ADMIN LOGIN
========================================================= */

const adminLoginBtn =
    document.getElementById("adminLoginBtn");

if (adminLoginBtn) {

    adminLoginBtn.addEventListener(
        "click",
        async () => {

            try {

                const username =
                    document.getElementById("adminUsername")?.value;

                const password =
                    document.getElementById("adminPassword")?.value;

                const response =
                    await fetch(
                        `${API_BASE}/api/admin/login`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                username,
                                password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!data.success) {

                    alert(
                        data.message ||
                        "Admin login failed."
                    );

                    return;
                }

                localStorage.setItem(
                    "adminToken",
                    data.token
                );

                alert("Admin login successful!");

                const adminLogin =
                    document.getElementById("adminLogin");

                if (adminLogin) {
                    adminLogin.style.display = "none";
                }

                const adminDashboard =
                    document.getElementById("adminDashboard");

                if (adminDashboard) {
                    adminDashboard.style.display = "block";
                }

            } catch (error) {

                console.error(
                    "Admin login failed:",
                    error
                );

                alert("Server connection failed.");
            }

        }
    );
}


/* =========================================================
   ADD PRODUCT
========================================================= */

const addProductBtn =
    document.getElementById("addProductBtn");

const productForm =
    document.getElementById("productForm");

if (addProductBtn) {

    addProductBtn.addEventListener(
        "click",
        () => {

            if (productForm) {
                productForm.style.display = "block";
            }

        }
    );
}


/* =========================================================
   SAVE PRODUCT
========================================================= */

const saveProductBtn =
    document.getElementById("saveProductBtn");

if (saveProductBtn) {

    saveProductBtn.addEventListener(
        "click",
        async () => {

            const fileInput =
                document.getElementById("productFile");

            const file =
                fileInput?.files[0];

            if (!file) {

                alert("Please select a file.");
                return;
            }

            const adminToken =
                localStorage.getItem("adminToken");

            if (!adminToken) {

                alert("Admin login required.");
                return;
            }

            try {

                const formData =
                    new FormData();

                formData.append("file", file);

                const uploadResponse =
                    await fetch(
                        `${API_BASE}/api/upload`,
                        {
                            method: "POST",
                            headers: {
                                Authorization:
                                    `Bearer ${adminToken}`
                            },
                            body: formData
                        }
                    );

                const uploadData =
                    await uploadResponse.json();

                if (!uploadResponse.ok) {

                    alert(
                        uploadData.message ||
                        "File upload failed."
                    );

                    return;
                }

                const product = {

                    name:
                        document.getElementById("productName")?.value,

                    description:
                        document.getElementById("productDescription")?.value,

                    price:
                        document.getElementById("productPrice")?.value,

                    category:
                        document.getElementById("productCategory")?.value,

                    type: "product",

                    file: uploadData.file
                };

                const response =
                    await fetch(
                        `${API_BASE}/api/products`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization:
                                    `Bearer ${adminToken}`
                            },
                            body: JSON.stringify(product)
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to save product."
                    );

                    return;
                }

                alert("Product and file uploaded successfully!");

                clearProductForm();

            } catch (error) {

                console.error(
                    "Save product failed:",
                    error
                );

                alert("Server connection failed.");
            }

        }
    );
}


/* =========================================================
   CLEAR PRODUCT FORM
========================================================= */

function clearProductForm() {

    const fields = [
        "productName",
        "productDescription",
        "productPrice",
        "productCategory",
        "productFile"
    ];

    fields.forEach((id) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });
}


/* =========================================================
   MANAGE PRODUCTS
========================================================= */

const manageProductsBtn =
    document.getElementById("manageProductsBtn");

const productsList =
    document.getElementById("productsList");

if (manageProductsBtn) {

    manageProductsBtn.addEventListener(
        "click",
        async () => {

            if (!productsList) return;

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/products`
                    );

                const products =
                    await response.json();

                const onlyProducts =
                    products.filter(
                        (product) =>
                            product.type === "product"
                    );

                productsList.innerHTML = "";

                if (!onlyProducts.length) {

                    productsList.innerHTML =
                        "<p>No products found.</p>";

                    return;
                }

                onlyProducts.forEach(
                    (product) => {

                        productsList.innerHTML += `
                            <div class="admin-product">
                                <h3>${esc(product.name) || "Untitled Product"}</h3>
                                <p>${esc(product.description) || "No description"}</p>
                                <p>Price: Rs. ${esc(product.price) || 0}</p>
                                <p>Category: ${esc(product.category) || "Product"}</p>
                                <button type="button" class="edit-product-btn" data-product-id="${esc(product._id)}">Edit</button>
                                <button type="button" class="delete-product-btn" data-product-id="${esc(product._id)}">Delete</button>
                            </div>
                        `;
                    }
                );

                productsList
                    .querySelectorAll(".edit-product-btn")
                    .forEach((button) => {
                        button.addEventListener("click", () => {
                            editProduct(button.dataset.productId);
                        });
                    });

                productsList
                    .querySelectorAll(".delete-product-btn")
                    .forEach((button) => {
                        button.addEventListener("click", () => {
                            deleteProduct(button.dataset.productId);
                        });
                    });

            } catch (error) {

                console.error(
                    "Manage products failed:",
                    error
                );

                productsList.innerHTML =
                    "<p>Failed to load products.</p>";
            }

        }
    );
}


/* =========================================================
   EDIT PRODUCT
========================================================= */

async function editProduct(id) {

    try {

        const response =
            await fetch(`${API_BASE}/api/products`);

        const products =
            await response.json();

        const product =
            products.find(
                (item) =>
                    item._id === id &&
                    item.type === "product"
            );

        if (!product) {

            alert("Product not found.");
            return;
        }

        const idInput =
            document.getElementById("editProductId");

        const nameInput =
            document.getElementById("editProductName");

        const descriptionInput =
            document.getElementById("editProductDescription");

        const priceInput =
            document.getElementById("editProductPrice");

        const categoryInput =
            document.getElementById("editProductCategory");

        if (idInput) idInput.value = product._id;
        if (nameInput) nameInput.value = product.name || "";
        if (descriptionInput) descriptionInput.value = product.description || "";
        if (priceInput) priceInput.value = product.price || "";
        if (categoryInput) categoryInput.value = product.category || "";

        const editForm =
            document.getElementById("editProductForm");

        if (editForm) {

            editForm.style.display = "block";

            editForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    } catch (error) {

        console.error("Edit product failed:", error);

        alert("Failed to load product.");
    }
}


/* =========================================================
   UPDATE PRODUCT
========================================================= */

const updateProductBtn =
    document.getElementById("updateProductBtn");

if (updateProductBtn) {

    updateProductBtn.addEventListener(
        "click",
        async () => {

            const id =
                document.getElementById("editProductId")?.value;

            if (!id) {

                alert("Product ID missing.");
                return;
            }

            const adminToken =
                localStorage.getItem("adminToken");

            if (!adminToken) {

                alert("Admin login required.");
                return;
            }

            const updatedProduct = {

                name:
                    document.getElementById("editProductName")?.value,

                description:
                    document.getElementById("editProductDescription")?.value,

                price:
                    document.getElementById("editProductPrice")?.value,

                category:
                    document.getElementById("editProductCategory")?.value,

                type: "product"
            };

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/products/${id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization:
                                    `Bearer ${adminToken}`
                            },
                            body: JSON.stringify(updatedProduct)
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Update failed."
                    );

                    return;
                }

                alert("Product updated successfully!");

                const editForm =
                    document.getElementById("editProductForm");

                if (editForm) {
                    editForm.style.display = "none";
                }

                manageProductsBtn?.click();

            } catch (error) {

                console.error(
                    "Update product failed:",
                    error
                );

                alert("Server connection failed.");
            }

        }
    );
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const adminToken =
        localStorage.getItem("adminToken");

    if (!adminToken) {

        alert("Admin login required.");
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/api/products/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );

        if (!response.ok) {

            const data =
                await response.json().catch(() => ({}));

            alert(
                data.message ||
                data.error ||
                "Failed to delete product."
            );

            return;
        }

        alert("Product deleted successfully!");

        manageProductsBtn?.click();

    } catch (error) {

        console.error("Delete product failed:", error);

        alert("Server connection failed.");
    }
}


/* =========================================================
   WORK ADMIN
========================================================= */

const addWorkBtn =
    document.getElementById("addWorkBtn");

const workForm =
    document.getElementById("workForm");

const saveWorkBtn =
    document.getElementById("saveWorkBtn");

const manageWorkBtn =
    document.getElementById("manageWorkBtn");

const workList =
    document.getElementById("workList");


/* =========================================================
   ADD WORK FORM
========================================================= */

if (addWorkBtn) {

    addWorkBtn.addEventListener(
        "click",
        () => {

            if (workForm) {

                workForm.style.display = "block";

                workForm.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }
    );
}


/* =========================================================
   SAVE WORK
========================================================= */

if (saveWorkBtn) {
    saveWorkBtn.addEventListener("click", saveWork);
}


async function saveWork() {

    const nameInput =
        document.getElementById("workName");

    const descriptionInput =
        document.getElementById("workDescription");

    const categoryInput =
        document.getElementById("workCategory");

    const fileInput =
        document.getElementById("workFile");


    if (
        !nameInput ||
        !descriptionInput ||
        !categoryInput ||
        !fileInput
    ) {

        alert("Work form fields not found.");
        return;
    }


    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const category = categoryInput.value.trim();
    const file = fileInput.files[0];
    const adminToken = localStorage.getItem("adminToken");


    if (!name || !description || !category || !file) {

        alert("Please fill all Work fields.");
        return;
    }


    if (!adminToken) {

        alert("Admin login required.");
        return;
    }


    try {

        const formData = new FormData();

        formData.append("file", file);


        const uploadResponse =
            await fetch(
                `${API_BASE}/api/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: formData
                }
            );


        const uploadData =
            await uploadResponse.json();


        if (!uploadResponse.ok) {

            throw new Error(
                uploadData.message ||
                uploadData.error ||
                "Work file upload failed."
            );

        }


        if (!uploadData.file) {

            throw new Error(
                "Uploaded Work file was not returned."
            );

        }


        const workData = {

            name,
            description,
            category,
            type: "work",
            price: 0,
            file: uploadData.file

        };


        const response =
            await fetch(
                `${API_BASE}/api/products`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(workData)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to save Work."
            );

        }


        alert("Work added successfully!");


        nameInput.value = "";
        descriptionInput.value = "";
        categoryInput.value = "";
        fileInput.value = "";


        if (workForm) {
            workForm.style.display = "none";
        }


        if (manageWorkBtn) {
            loadAdminWork();
        }


    } catch (error) {

        console.error("Save Work failed:", error);

        alert(
            error.message ||
            "Server connection failed."
        );

    }

}


/* =========================================================
   MANAGE WORK
========================================================= */

if (manageWorkBtn) {

    manageWorkBtn.addEventListener(
        "click",
        loadAdminWork
    );

}


async function loadAdminWork() {

    if (!workList) return;


    const adminToken =
        localStorage.getItem("adminToken");


    if (!adminToken) {

        workList.innerHTML =
            "<p>Admin login required.</p>";

        return;

    }


    workList.innerHTML = `
        <div class="resource-loading">
            Loading Work...
        </div>
    `;


    try {

        const response =
            await fetch(`${API_BASE}/api/products`);


        const items =
            await response.json();


        if (!response.ok) {

            throw new Error(
                items.message ||
                items.error ||
                "Failed to load Work."
            );

        }


        const works =
            items.filter(
                (item) =>
                    item.type === "work"
            );


        workList.innerHTML = "";


        if (!works.length) {

            workList.innerHTML =
                "<p>No Work found.</p>";

            return;

        }


        works.forEach((work) => {

            workList.innerHTML += `
                <div class="admin-product">
                    <h3>${esc(work.name) || "Untitled Work"}</h3>
                    <p>${esc(work.description) || "No description"}</p>
                    <p>Category: ${esc(work.category) || "Project"}</p>
                    <p>File: ${esc(work.file) || "No file"}</p>
                    <button type="button" class="edit-work-btn" data-work-id="${esc(work._id)}">Edit</button>
                    <button type="button" class="delete-work-btn" data-work-id="${esc(work._id)}">Delete</button>
                </div>
            `;

        });


        workList
            .querySelectorAll(".edit-work-btn")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    editWork(button.dataset.workId);
                });
            });


        workList
            .querySelectorAll(".delete-work-btn")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    deleteWork(button.dataset.workId);
                });
            });


    } catch (error) {

        console.error("Manage Work failed:", error);

        workList.innerHTML =
            "<p>Failed to load Work.</p>";

    }

}


/* =========================================================
   EDIT WORK
========================================================= */

async function editWork(id) {

    try {

        const response =
            await fetch(`${API_BASE}/api/products`);


        const items =
            await response.json();


        if (!response.ok) {

            throw new Error(
                items.message ||
                items.error ||
                "Failed to load Work."
            );

        }


        const work =
            items.find(
                (item) =>
                    item._id === id &&
                    item.type === "work"
            );


        if (!work) {

            alert("Work not found.");
            return;

        }


        document.getElementById("editWorkId").value = work._id;
        document.getElementById("editWorkName").value = work.name || "";
        document.getElementById("editWorkDescription").value = work.description || "";
        document.getElementById("editWorkCategory").value = work.category || "";


        const editForm =
            document.getElementById("editWorkForm");


        if (editForm) {

            editForm.style.display = "block";

            editForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }


    } catch (error) {

        console.error("Edit Work failed:", error);

        alert("Failed to load Work.");

    }

}


/* =========================================================
   UPDATE WORK
========================================================= */

const updateWorkBtn =
    document.getElementById("updateWorkBtn");


if (updateWorkBtn) {

    updateWorkBtn.addEventListener("click", updateWork);

}


async function updateWork() {

    const id =
        document.getElementById("editWorkId")?.value;


    const adminToken =
        localStorage.getItem("adminToken");


    if (!id) {

        alert("Work ID missing.");
        return;

    }


    if (!adminToken) {

        alert("Admin login required.");
        return;

    }


    const updatedWork = {

        name:
            document.getElementById("editWorkName")?.value.trim(),

        description:
            document.getElementById("editWorkDescription")?.value.trim(),

        category:
            document.getElementById("editWorkCategory")?.value.trim(),

        type: "work"

    };


    if (
        !updatedWork.name ||
        !updatedWork.description ||
        !updatedWork.category
    ) {

        alert("Please fill all Work fields.");
        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/products/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(updatedWork)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Work update failed."
            );

        }


        alert("Work updated successfully!");


        const editForm =
            document.getElementById("editWorkForm");


        if (editForm) {
            editForm.style.display = "none";
        }


        loadAdminWork();


    } catch (error) {

        console.error("Update Work failed:", error);

        alert(
            error.message ||
            "Server connection failed."
        );

    }

}


/* =========================================================
   DELETE WORK
========================================================= */

async function deleteWork(id) {

    const adminToken =
        localStorage.getItem("adminToken");


    if (!adminToken) {

        alert("Admin login required.");
        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this Work?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/products/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json().catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to delete Work."
            );

        }


        alert("Work deleted successfully!");

        loadAdminWork();


    } catch (error) {

        console.error("Delete Work failed:", error);

        alert(
            error.message ||
            "Server connection failed."
        );

    }

}


/* =========================================================
   PROJECT RESOURCE ADMIN
========================================================= */

const resourceForm =
    document.getElementById("resourceForm");

const addResourceBtn =
    document.getElementById("addResourceBtn");

if (addResourceBtn) {

    addResourceBtn.addEventListener(
        "click",
        () => {

            if (resourceForm) {
                resourceForm.style.display = "block";
            }

        }
    );

}


const saveResourceBtn =
    document.getElementById("saveResourceBtn");

if (saveResourceBtn) {

    saveResourceBtn.addEventListener(
        "click",
        saveProjectResource
    );

}


async function saveProjectResource() {

    const projectNameInput =
        document.getElementById("resourceProjectName");

    const descriptionInput =
        document.getElementById("resourceDescription");

    const fileNameInput =
        document.getElementById("resourceFileName");

    const fileInput =
        document.getElementById("resourceFile");

    const accessInput =
        document.getElementById("resourceAccess");

    const priceInput =
        document.getElementById("resourcePrice");


    if (
        !projectNameInput ||
        !descriptionInput ||
        !fileNameInput ||
        !fileInput ||
        !accessInput ||
        !priceInput
    ) {

        alert("Project Resource form fields not found.");
        return;

    }


    const projectName = projectNameInput.value.trim();
    const description = descriptionInput.value.trim();
    const fileName = fileNameInput.value.trim();
    const access = accessInput.value;
    const price = Number(priceInput.value) || 0;
    const selectedFile = fileInput.files[0];
    const adminToken = localStorage.getItem("adminToken");


    if (!projectName || !description || !fileName) {

        alert("Please fill all required fields.");
        return;

    }


    if (!adminToken) {

        alert("Admin login required.");
        return;

    }


    try {

        const uploadFormData = new FormData();

        uploadFormData.append("file", selectedFile);


        const uploadResponse =
            await fetch(
                `${API_BASE}/api/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: uploadFormData
                }
            );


        const uploadData =
            await uploadResponse.json();


        if (!uploadResponse.ok) {

            throw new Error(
                uploadData.message ||
                uploadData.error ||
                "File upload failed."
            );

        }


        if (!uploadData.file) {

            throw new Error(
                "Uploaded file name was not returned by the server."
            );

        }


        const resourceData = {

            projectName,
            description,
            fileName,
            file: uploadData.file,
            access,
            price: access === "paid" ? price : 0

        };


        const resourceResponse =
            await fetch(
                `${API_BASE}/api/resources`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(resourceData)
                }
            );


        const resourceResult =
            await resourceResponse.json();


        if (!resourceResponse.ok) {

            throw new Error(
                resourceResult.message ||
                resourceResult.error ||
                "Failed to save project resource."
            );

        }


        alert("Project resource added successfully!");


        if (resourceForm) {
            resourceForm.style.display = "none";
        }


        projectNameInput.value = "";
        descriptionInput.value = "";
        fileNameInput.value = "";
        fileInput.value = "";
        accessInput.value = "free";
        priceInput.value = "0";


    } catch (error) {

        console.error("Resource error:", error);

        alert(error.message);

    }

}


/* =========================================================
   MANAGE PROJECT RESOURCES
========================================================= */

const manageResourcesBtn =
    document.getElementById("manageResourcesBtn");

const resourcesList =
    document.getElementById("resourcesList");


if (manageResourcesBtn) {

    manageResourcesBtn.addEventListener(
        "click",
        loadProjectResources
    );

}


async function loadProjectResources() {

    if (!resourcesList) return;


    const adminToken =
        localStorage.getItem("adminToken");


    if (!adminToken) {

        resourcesList.innerHTML =
            "<p>Admin login required.</p>";

        return;

    }


    resourcesList.innerHTML = `
        <div class="resource-loading">
            Loading project resources...
        </div>
    `;


    try {

        const response =
            await fetch(`${API_BASE}/api/resources`);


        const resources =
            await response.json();


        if (!response.ok) {

            resourcesList.innerHTML =
                `<p>${
                    esc(resources.message) ||
                    "Failed to load resources."
                }</p>`;

            return;

        }


        resourcesList.innerHTML = "";


        if (!resources.length) {

            resourcesList.innerHTML =
                "<p>No project resources found.</p>";

            return;

        }


        resources.forEach((resource) => {

            const access = resource.access || "free";
            const price = Number(resource.price) || 0;


            resourcesList.innerHTML += `
                <div class="admin-resource">
                    <h3>${esc(resource.projectName) || "Untitled Project"}</h3>
                    <p><strong>Description:</strong> ${esc(resource.description) || "No description"}</p>
                    <p><strong>File:</strong> ${esc(resource.fileName) || "Unknown file"}</p>
                    <p><strong>Access:</strong> ${esc(access)}</p>
                    ${
                        access === "paid"
                            ? `<p><strong>Price:</strong> Rs. ${esc(price)}</p>`
                            : `<p><strong>Price:</strong> Free</p>`
                    }
                    <div class="admin-resource-actions">
                        <button type="button" class="edit-resource-btn" data-resource-id="${esc(resource._id)}">Edit</button>
                        <button type="button" class="delete-resource-btn" data-resource-id="${esc(resource._id)}">Delete</button>
                    </div>
                </div>
            `;

        });


        resourcesList
            .querySelectorAll(".edit-resource-btn")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    editProjectResource(button.dataset.resourceId);
                });
            });


        resourcesList
            .querySelectorAll(".delete-resource-btn")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    deleteProjectResource(button.dataset.resourceId);
                });
            });


    } catch (error) {

        console.error("Manage resources failed:", error);

        resourcesList.innerHTML =
            "<p>Failed to load project resources.</p>";

    }

}


/* =========================================================
   EDIT PROJECT RESOURCE
========================================================= */

async function editProjectResource(id) {

    const adminToken =
        localStorage.getItem("adminToken");


    if (!adminToken) {

        alert("Admin login required.");
        return;

    }


    try {

        const response =
            await fetch(`${API_BASE}/api/resources`);


        const resources =
            await response.json();


        if (!response.ok) {

            alert(
                resources.message ||
                "Failed to load resources."
            );

            return;

        }


        const resource =
            resources.find((item) => item._id === id);


        if (!resource) {

            alert("Project resource not found.");
            return;

        }


        const projectNameInput =
            document.getElementById("resourceProjectName");

        const descriptionInput =
            document.getElementById("resourceDescription");

        const fileNameInput =
            document.getElementById("resourceFileName");

        const accessInput =
            document.getElementById("resourceAccess");

        const priceInput =
            document.getElementById("resourcePrice");


        if (projectNameInput) {
            projectNameInput.value = resource.projectName || "";
        }

        if (descriptionInput) {
            descriptionInput.value = resource.description || "";
        }

        if (fileNameInput) {
            fileNameInput.value = resource.fileName || "";
        }

        if (accessInput) {
            accessInput.value = resource.access || "free";
        }

        if (priceInput) {
            priceInput.value = resource.price || 0;
        }


        if (resourceForm) {

            resourceForm.style.display = "block";

            resourceForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }


        resourceForm.dataset.editId = resource._id;


        alert("Resource loaded for editing.");


    } catch (error) {

        console.error("Edit resource failed:", error);

        alert("Failed to load project resource.");

    }

}


/* =========================================================
   DELETE PROJECT RESOURCE
========================================================= */

async function deleteProjectResource(id) {

    const adminToken =
        localStorage.getItem("adminToken");


    if (!adminToken) {

        alert("Admin login required.");
        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this project resource?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/resources/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                data.error ||
                "Failed to delete resource."
            );

            return;

        }


        alert("Project resource deleted successfully!");

        loadProjectResources();


    } catch (error) {

        console.error("Delete resource failed:", error);

        alert("Server connection failed.");

    }

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.clearProductForm = clearProductForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveWork = saveWork;
window.editWork = editWork;
window.updateWork = updateWork;
window.deleteWork = deleteWork;
window.loadProjectResources = loadProjectResources;
window.editProjectResource = editProjectResource;
window.deleteProjectResource = deleteProjectResource;