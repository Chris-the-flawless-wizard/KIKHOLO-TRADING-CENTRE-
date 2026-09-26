function visit(){
    alert("Welcome to CHRIS' KIKHOLO TRADING HUB!");
}

const SEARCH_ALIASES = {
    phone: "phones",
    phones: "phones",
    smartphone: "phones",
    mobile: "phones",
    iphone: "phones",
    samsung: "phones",
    tecno: "phones",
    itel: "phones",
    repair: "phones",
    tv: "electronics",
    television: "electronics",
    radio: "electronics",
    fridge: "electronics",
    refrigerator: "electronics",
    speaker: "electronics",
    appliance: "electronics",
    electronics: "electronics",
    laptop: "computers",
    laptops: "computers",
    computer: "computers",
    computers: "computers",
    desktop: "computers",
    printer: "computers",
    pc: "computers",
    mac: "computers",
    notebook: "computers",
    sofa: "furniture",
    bed: "furniture",
    chair: "furniture",
    table: "furniture",
    furniture: "furniture",
    cabinet: "furniture",
    paint: "hardware",
    cement: "hardware",
    tools: "hardware",
    hardware: "hardware",
    construction: "hardware",
    nails: "hardware",
    hammer: "hardware",
    clothes: "fashion",
    clothing: "fashion",
    dress: "fashion",
    shoes: "fashion",
    bag: "fashion",
    bags: "fashion",
    fashion: "fashion",
    jewellery: "fashion",
    jewelry: "fashion",
    taxi: "transport",
    boda: "transport",
    car: "transport",
    delivery: "transport",
    logistics: "transport",
    transport: "transport",
    hire: "transport",
    supermarket: "retail",
    grocery: "retail",
    groceries: "retail",
    household: "retail",
    retail: "retail",
    shop: "retail",
    stationery: "retail"
};

function normalizeSearch(value){
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function cardSearchText(card){
    const name = card.getAttribute("data-name") || "";
    const keywords = card.getAttribute("data-keywords") || "";
    const visible = card.innerText || "";
    return normalizeSearch([name, keywords, visible].join(" "));
}

function cardMatchesQuery(card, query){
    if (!query) return true;

    const haystack = cardSearchText(card);
    const tokens = query.split(" ").filter(Boolean);
    const name = normalizeSearch(card.getAttribute("data-name") || "");

    return tokens.every((token) => {
        if (haystack.includes(token)) return true;
        const alias = SEARCH_ALIASES[token];
        if (alias && (haystack.includes(alias) || name === alias || name.includes(alias))) return true;
        return haystack.split(" ").some((word) => word.startsWith(token) || (token.startsWith(word) && word.length > 3));
    });
}

function setSuggestions(items, query){
    const box = document.getElementById("searchSuggestions");
    const input = document.getElementById("searchInput");
    if (!box || !input) return;

    if (!items.length || !query) {
        box.hidden = true;
        box.innerHTML = "";
        input.setAttribute("aria-expanded", "false");
        return;
    }

    box.hidden = false;
    input.setAttribute("aria-expanded", "true");
    box.innerHTML = items.map((item) => (
        '<button type="button" class="search-suggestion" role="option" data-name="' + item.name + '">' +
        '<i class="fa-solid fa-store"></i>' +
        '<span><strong>' + item.name + '</strong><small>' + item.blurb + '</small></span>' +
        '</button>'
    )).join("");
}

function runBusinessSearch(options){
    const opts = options || {};
    const input = document.getElementById("searchInput");
    const cards = document.querySelectorAll(".shop-card");
    const empty = document.getElementById("searchEmpty");
    const emptyText = document.getElementById("searchEmptyText");
    const status = document.getElementById("searchLiveStatus");
    const clearBtn = document.getElementById("clearSearch");
    if (!input || !cards.length) return 0;

    const query = normalizeSearch(input.value);
    if (clearBtn) clearBtn.hidden = !query;

    let visibleCount = 0;
    const matches = [];

    cards.forEach((card) => {
        const matched = cardMatchesQuery(card, query);
        card.classList.toggle("is-hidden-by-search", !matched);
        card.classList.toggle("is-search-match", Boolean(query && matched));
        card.style.display = matched ? "" : "none";
        if (matched) {
            visibleCount += 1;
            const name = card.getAttribute("data-name") || ((card.querySelector("h3") || {}).textContent || "Business");
            const blurb = (((card.querySelector("p") || {}).textContent || "")).trim();
            matches.push({ name: name, blurb: blurb });
        }
    });

    if (empty) {
        empty.hidden = !(query && visibleCount === 0);
    }
    if (emptyText && query && visibleCount === 0) {
        emptyText.textContent = 'No businesses matched “' + input.value.trim() + '”. Try phones, laptops, sofa, or taxi.';
    }

    if (status) {
        if (!query) {
            status.textContent = "";
        } else if (visibleCount === 0) {
            status.textContent = "No matching businesses";
        } else if (visibleCount === 1) {
            status.textContent = '1 business found for “' + input.value.trim() + '”';
        } else {
            status.textContent = visibleCount + ' businesses found for “' + input.value.trim() + '”';
        }
    }

    if (opts.showSuggestions !== false) {
        setSuggestions(query ? matches.slice(0, 6) : [], query);
    } else {
        setSuggestions([], "");
    }

    if (opts.scroll && query) {
        const target = document.getElementById("shops");
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    return visibleCount;
}

function searchBusiness(){
    runBusinessSearch({ showSuggestions: true, scroll: false });
}

function clearBusinessSearch(){
    const input = document.getElementById("searchInput");
    if (input) input.value = "";
    runBusinessSearch({ showSuggestions: false, scroll: false });
    if (input) input.focus();
}

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");
    const menuToggle = document.getElementById("menuToggle");
    const nav = document.querySelector("header nav");
    const form = document.getElementById("businessSearchForm");
    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearch");
    const resetBtn = document.getElementById("resetSearch");
    const suggestions = document.getElementById("searchSuggestions");

    if (form && input) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            runBusinessSearch({ showSuggestions: false, scroll: true });
        });

        input.addEventListener("input", () => {
            runBusinessSearch({ showSuggestions: true, scroll: false });
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                clearBusinessSearch();
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", clearBusinessSearch);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            clearBusinessSearch();
            const shops = document.getElementById("shops");
            if (shops) shops.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    if (suggestions) {
        suggestions.addEventListener("click", (event) => {
            const item = event.target.closest(".search-suggestion");
            if (!item || !input) return;
            input.value = item.getAttribute("data-name") || "";
            runBusinessSearch({ showSuggestions: false, scroll: true });
        });
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".marketplace-search")) {
            setSuggestions([], "");
        }
    });

    if (themeToggle) {
        const savedTheme = localStorage.getItem("kikholo-theme");
        if (savedTheme === "light") {
            document.body.classList.add("light-mode");
        }
        updateThemeButton();
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            localStorage.setItem("kikholo-theme", isLight ? "light" : "dark");
            updateThemeButton();
        });
    }

    function updateThemeButton() {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector("i");
        if (!icon) return;
        const isLight = document.body.classList.contains("light-mode");
        icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
        themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
        themeToggle.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
    }

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("mobile-open");
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            const icon = menuToggle.querySelector("i");
            if (icon) {
                icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
            }
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                nav.classList.remove("mobile-open");
                menuToggle.setAttribute("aria-expanded", "false");
                const icon = menuToggle.querySelector("i");
                if (icon) icon.className = "fa-solid fa-bars";
            });
        });
    }

});
