function visit(){

alert(
"Welcome to CHRIS' KIKHOLO TRADING HUB!"
);

}

function searchBusiness(){

let input =
document
.getElementById("searchInput")
.value
.toLowerCase()
.trim();

let cards =
document.querySelectorAll(".shop-card");

cards.forEach(card => {

let text =
card.innerText.toLowerCase();

if(text.includes(input)){

card.style.display = "";

}

else{

card.style.display = "none";

}

});

}


/* ==============================
   DARK / LIGHT MODE
   ============================== */

document.addEventListener("DOMContentLoaded", () => {

const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector("header nav");

if (themeToggle) {

const savedTheme = localStorage.getItem("kikholo-theme");

if (savedTheme === "light") {
document.body.classList.add("light-mode");
}

updateThemeButton();

themeToggle.addEventListener("click", () => {

document.body.classList.toggle("light-mode");

const isLight =
document.body.classList.contains("light-mode");

localStorage.setItem(
"kikholo-theme",
isLight ? "light" : "dark"
);

updateThemeButton();

});

}

function updateThemeButton() {

if (!themeToggle) return;

const icon =
themeToggle.querySelector("i");

if (!icon) return;

const isLight =
document.body.classList.contains("light-mode");

icon.className =
isLight
? "fa-solid fa-sun"
: "fa-solid fa-moon";

themeToggle.setAttribute(
"aria-label",
isLight
? "Switch to dark mode"
: "Switch to light mode"
);

themeToggle.setAttribute(
"title",
isLight
? "Switch to dark mode"
: "Switch to light mode"
);

}


/* ==============================
   MOBILE MENU
   ============================== */

if (menuToggle && nav) {

menuToggle.addEventListener("click", () => {

const isOpen =
nav.classList.toggle("mobile-open");

menuToggle.setAttribute(
"aria-expanded",
isOpen ? "true" : "false"
);

const icon =
menuToggle.querySelector("i");

if (icon) {

icon.className =
isOpen
? "fa-solid fa-xmark"
: "fa-solid fa-bars";

}

});

nav.querySelectorAll("a").forEach(link => {

link.addEventListener("click", () => {

nav.classList.remove("mobile-open");

menuToggle.setAttribute(
"aria-expanded",
"false"
);

const icon =
menuToggle.querySelector("i");

if (icon) {
icon.className = "fa-solid fa-bars";
}

});

});

}

});
