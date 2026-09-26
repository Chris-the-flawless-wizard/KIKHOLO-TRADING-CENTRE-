/*
 CHRISXCHANGE catalogue
 Products are loaded from public online-seller catalogues:
 DummyJSON and Fake Store API.
 Each item is shown as sold by a marketplace company.
*/
const SELLERS = [
    "Jumia Uganda",
    "Amazon",
    "Kilimall",
    "AliExpress",
    "Jiji Uganda",
    "eBay",
    "Noon",
    "Alibaba",
    "Takealot",
    "Shoprite Online"
];

const titleMap = {
    electronics: "Electronics",
    phones: "Phones & Accessories",
    computers: "Computers",
    furniture: "Furniture",
    hardware: "Hardware",
    fashion: "Fashion",
    transport: "Transport",
    retail: "Retail Shop"
};

const state = { products: [], category: "all" };
const params = new URLSearchParams(location.search);
const requestedCategory = (params.get("category") || window.CHRISXCHANGE_DEFAULT_CATEGORY || "all").toLowerCase().trim();

function pickSeller(seed) {
    return SELLERS[Math.abs(Number(seed) || 0) % SELLERS.length];
}

function toUGX(usd) {
    return Math.round((Number(usd) || 1) * 3700);
}

function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, m => ({
        "&": "&",
        "<": "<",
        ">": ">",
        '"': "&quot;",
        "'": "&#039;"
    }[m]));
}

function money(p, c) {
    return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: c || "UGX",
        maximumFractionDigits: 0
    }).format(Number(p) || 0);
}

function mapCategory(value) {
    const s = String(value || "").toLowerCase();
    if (s.includes("phone") || s.includes("mobile") || s.includes("smart")) return "phones";
    if (s.includes("laptop") || s.includes("tablet") || s.includes("computer") || s.includes("pc")) return "computers";
    if (s.includes("electronic") || s.includes("monitor") || s.includes("tv") || s.includes("ssd") || s.includes("hard drive")) return "electronics";
    if (s.includes("furniture") || s.includes("home-decoration") || s.includes("decoration") || s.includes("sofa") || s.includes("bed")) return "furniture";
    if (s.includes("kitchen") || s.includes("tool") || s.includes("hardware") || s.includes("construction")) return "hardware";
    if (s.includes("shirt") || s.includes("shoe") || s.includes("dress") || s.includes("bag") || s.includes("watch") || s.includes("fashion") || s.includes("cloth") || s.includes("top") || s.includes("sunglass") || s.includes("jewel")) return "fashion";
    if (s.includes("vehicle") || s.includes("motor") || s.includes("transport") || s.includes("car")) return "transport";
    if (s.includes("groc") || s.includes("beauty") || s.includes("skin") || s.includes("fragrance") || s.includes("sport") || s.includes("retail") || s.includes("supermarket")) return "retail";
    return "retail";
}

function normalizeProduct(raw, index, source) {
    const name = raw.title || raw.name || "Marketplace product";
    const category = mapCategory(raw.category || raw.brand || name);
    const image = (Array.isArray(raw.images) && raw.images[0]) || raw.thumbnail || raw.image || raw.image_url || "";
    const usd = raw.price;
    return {
        id: source + "-" + (raw.id || index),
        name: name,
        description: raw.description || "Available from an online selling company on CHRISXCHANGE.",
        price: raw.currency === "UGX" ? Number(raw.price) : toUGX(usd),
        currency: "UGX",
        image_url: image,
        category: category,
        seller: raw.brand ? String(raw.brand) + " on " + pickSeller(raw.id || index) : pickSeller(raw.id || index),
        source: source,
        stock_quantity: raw.stock || 20,
        is_available: true,
        is_featured: Number(raw.rating && raw.rating.rate ? raw.rating.rate : raw.rating) >= 4.4
    };
}

const FALLBACK_PRODUCTS = [
    { name: "Samsung 43 Inch Smart TV", description: "Full HD smart television for home entertainment.", price: 980000, category: "electronics", image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80", seller: "Jumia Uganda" },
    { name: "Hisense Refrigerator", description: "Double-door fridge for home and shop use.", price: 1250000, category: "electronics", image_url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80", seller: "Kilimall" },
    { name: "Home Theatre Speaker Set", description: "Powerful speakers for movies and music.", price: 420000, category: "electronics", image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80", seller: "Amazon" },
    { name: "Tecno Spark Smartphone", description: "Affordable smartphone with a long-lasting battery.", price: 380000, category: "phones", image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", seller: "Jiji Uganda" },
    { name: "iPhone 13", description: "Premium smartphone with a sharp camera.", price: 2100000, category: "phones", image_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=900&q=80", seller: "Jumia Uganda" },
    { name: "Phone Charger and Earphones Pack", description: "Fast charger and wired earphones for daily use.", price: 35000, category: "phones", image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80", seller: "AliExpress" },
    { name: "HP 15 Laptop", description: "Everyday laptop for school, office and business.", price: 1850000, category: "computers", image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", seller: "Amazon" },
    { name: "Wireless Printer", description: "Print documents at home or in the office.", price: 540000, category: "computers", image_url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80", seller: "eBay" },
    { name: "Modern 3-Seater Sofa", description: "Comfortable living-room sofa.", price: 890000, category: "furniture", image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80", seller: "Jumia Uganda" },
    { name: "Office Study Desk", description: "Wooden desk for school and office work.", price: 260000, category: "furniture", image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80", seller: "Kilimall" },
    { name: "Hammer and Tool Kit", description: "Essential tools for home repairs.", price: 75000, category: "hardware", image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80", seller: "Jiji Uganda" },
    { name: "Interior Wall Paint 20L", description: "Quality paint for house finishing.", price: 145000, category: "hardware", image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80", seller: "Shoprite Online" },
    { name: "Cement 50kg Bag", description: "Building cement for construction work.", price: 42000, category: "hardware", image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80", seller: "Jiji Uganda" },
    { name: "Men Casual Sneakers", description: "Comfortable everyday shoes.", price: 95000, category: "fashion", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", seller: "Jumia Uganda" },
    { name: "Ladies Handbag", description: "Stylish bag for work and travel.", price: 78000, category: "fashion", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80", seller: "AliExpress" },
    { name: "City Taxi Ride Pack", description: "Local taxi and delivery service booking.", price: 25000, category: "transport", image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80", seller: "Jiji Uganda" },
    { name: "Motorcycle Helmet", description: "Protective helmet for boda and motorcycle riders.", price: 68000, category: "transport", image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80", seller: "Kilimall" },
    { name: "Family Grocery Basket", description: "Everyday household food items.", price: 54000, category: "retail", image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", seller: "Shoprite Online" },
    { name: "Kitchenware Starter Set", description: "Pots, plates and cooking tools.", price: 120000, category: "retail", image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80", seller: "Jumia Uganda" }
].map((p, i) => ({
    id: "local-" + i,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: "UGX",
    image_url: p.image_url,
    category: p.category,
    seller: p.seller,
    source: "local",
    stock_quantity: 15,
    is_available: true,
    is_featured: i % 3 === 0
}));

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not load " + url);
    return res.json();
}

async function loadSupabaseProducts() {
    try {
        const sb = window.supabase?.createClient(
            "https://wopjohlkjhqymhjjxqgi.supabase.co",
            "sb_publishable_ZAngJWvWaTYJWUF8JZWSZQ_tGh4lDwD"
        );
        if (!sb) return [];
        const { data, error } = await sb
            .from("products")
            .select("category_name,product_name,description,price,currency,image_url,source_url,availability,featured");
        if (error || !Array.isArray(data)) return [];
        return data.filter(p => p.product_name).map((p, i) => ({
            id: "supabase-" + i,
            name: p.product_name,
            description: p.description || "Available on CHRISXCHANGE.",
            price: Number(p.price) || 0,
            currency: p.currency || "UGX",
            image_url: p.image_url || "",
            category: mapCategory(p.category_name || p.product_name),
            seller: "CHRISXCHANGE Marketplace",
            source: p.source_url || "CHRISXCHANGE",
            stock_quantity: 20,
            is_available: String(p.availability || "").toLowerCase() !== "out of stock",
            is_featured: ["true","yes","1"].includes(String(p.featured).toLowerCase())
        }));
    } catch (e) {
        return [];
    }
}

async function loadOnlineProducts() {
    const results = await Promise.allSettled([
        fetchJson("https://dummyjson.com/products?limit=100"),
        fetchJson("https://fakestoreapi.com/products")
    ]);

    const online = [];
    const dummy = results[0].status === "fulfilled" ? (results[0].value.products || []) : [];
    const fake = results[1].status === "fulfilled" ? (results[1].value || []) : [];

    dummy.forEach((item, i) => online.push(normalizeProduct(item, i, "dummyjson")));
    fake.forEach((item, i) => online.push(normalizeProduct(item, i, "fakestore")));

    const dbProducts = await loadSupabaseProducts();
    const merged = dbProducts.length ? dbProducts.concat(FALLBACK_PRODUCTS) : online.concat(FALLBACK_PRODUCTS);
    const unique = [];
    const seen = new Set();
    merged.forEach(p => {
        const key = (p.name + "|" + p.category).toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(p);
    });
    return unique;
}

function renderFilters() {
    const cats = [...new Set(state.products.map(p => p.category))].filter(Boolean).sort();
    const box = document.querySelector("#categoryFilters");
    if (!box) return;
    box.innerHTML = ["all", ...cats].map(c =>
        '<button class="category-filter ' + (state.category === c ? "active" : "") + '" data-cat="' + escapeHtml(c) + '">' +
        escapeHtml(c === "all" ? "All" : titleMap[c] || c) +
        "</button>"
    ).join("");
    box.querySelectorAll(".category-filter").forEach(b => {
        b.onclick = () => {
            state.category = b.dataset.cat;
            render();
        };
    });
}

function render() {
    const searchBox = document.querySelector("#productSearch");
    const sortBox = document.querySelector("#sortProducts");
    const grid = document.querySelector("#productGrid");
    const status = document.querySelector("#productStatus");
    if (!grid) return;

    const q = (searchBox ? searchBox.value : "").toLowerCase().trim();
    let list = state.products.filter(p => {
        const catOk = state.category === "all" || p.category === state.category;
        const text = [p.name, p.description, p.category, p.seller, p.source].join(" ").toLowerCase();
        return catOk && (!q || text.includes(q));
    });

    const sort = sortBox ? sortBox.value : "featured";
    if (sort === "low") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name") list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    if (sort === "featured") list.sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));

    grid.innerHTML = list.length ? list.map(p => {
        const image = p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";
        return '<article class="product-card-cx">' +
            '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80\'">' +
            '<div class="product-body">' +
            '<span class="product-category">' + escapeHtml(titleMap[p.category] || p.category || "Product") + '</span>' +
            '<h3>' + escapeHtml(p.name) + '</h3>' +
            '<p class="product-seller"><i class="fa-solid fa-store"></i> Sold by ' + escapeHtml(p.seller || "Online seller") + '</p>' +
            '<p class="product-desc">' + escapeHtml(p.description || "Quality product from an online selling company.") + '</p>' +
            '<div class="product-price">' + money(p.price, p.currency) + '</div>' +
            '<div class="product-actions">' +
            '<a href="store-details.html?product=' + encodeURIComponent(p.name) + '&seller=' + encodeURIComponent(p.seller || '') + '">View</a>' +
            '<button type="button" data-name="' + escapeHtml(p.name) + '" data-seller="' + escapeHtml(p.seller || '') + '">Contact</button>' +
            '</div></div></article>';
    }).join("") : '<div class="empty-catalogue"><i class="fa-solid fa-box-open" style="font-size:2rem"></i><h2>No products found</h2><p>Try another search or category.</p></div>';

    if (status) {
        status.textContent = list.length
            ? list.length + " product" + (list.length === 1 ? "" : "s") + " from online selling companies"
            : "";
    }

    grid.querySelectorAll(".product-actions button").forEach(btn => {
        btn.onclick = () => {
            const name = btn.getAttribute("data-name");
            const seller = btn.getAttribute("data-seller");
            alert("Contact " + seller + " about: " + name);
        };
    });
}

async function loadProducts() {
    const status = document.querySelector("#productStatus");
    try {
        state.products = await loadOnlineProducts();
        state.category = titleMap[requestedCategory] ? requestedCategory : "all";
        const title = document.querySelector("#catalogueTitle");
        const subtitle = document.querySelector("#catalogueSubtitle");
        if (title) title.textContent = state.category === "all" ? "All Products" : (titleMap[state.category] || "Products");
        if (subtitle) {
            subtitle.textContent = state.category === "all"
                ? "Products sourced from online selling companies like Jumia, Amazon, Kilimall and Jiji."
                : "Browse " + (titleMap[state.category] || state.category) + " from online selling companies.";
        }
        renderFilters();
        render();
    } catch (e) {
        state.products = FALLBACK_PRODUCTS;
        state.category = titleMap[requestedCategory] ? requestedCategory : "all";
        renderFilters();
        render();
        if (status) status.textContent = "Showing saved marketplace products.";
    }
}

const searchInput = document.querySelector("#productSearch");
const sortInput = document.querySelector("#sortProducts");
if (searchInput) searchInput.addEventListener("input", render);
if (sortInput) sortInput.addEventListener("change", render);
loadProducts();
