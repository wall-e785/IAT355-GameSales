/* searching for ways to detect how to check if an element is in view (in this case, the top section), we found the intersection observer
referenced: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
Used to check when the user is at the top of the page, so we can hide the back-to-top button.*/
const button = document.getElementById("backtotop");
const topSection = document.getElementById("top");

const options = {
  threshold: 0.5
};

const callback = (entries, observer) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting){
        button.classList.add("hide");
    }else{
        button.classList.remove("hide");
    }
  });
};

const observer = new IntersectionObserver(callback, options);

observer.observe(topSection);