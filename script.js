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
.toLowerCase();

let cards =
document.querySelectorAll(".shop-card");

cards.forEach(card => {

let text =
card.innerText.toLowerCase();

if(text.includes(input)){

card.style.display = "block";

}

else{

card.style.display = "none";

}

});

}
