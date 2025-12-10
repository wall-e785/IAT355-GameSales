//script for mobile hamburger menu, based on this tutorial: https://www.w3schools.com/howto/howto_js_mobile_navbar.asp
let nav = document.getElementById("nav-mobile");
let hamburgerButton = document.getElementById("hamburger");

nav.classList.add("hide");

//eventlistener referenced from: https://www.w3schools.com/JS/js_htmldom_eventlistener.asp
hamburgerButton.addEventListener("click", function(){
    if(nav.classList.contains("hide")){
        nav.classList.remove("hide");
    }else{
        nav.classList.add("hide");
    }
});