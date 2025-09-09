// this runs because of "defer" in index.html
console.log("app.js loaded");

const myRange = document.getElementById("coffee_per_week");
const displayValue = document.getElementById("displayValue");

// set the initial value when page loads
displayValue.textContent = myRange.value;

// update value live when user moves slider
myRange.addEventListener("input", () => {
  displayValue.textContent = myRange.value;
});

document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll('input[name="coffeeType"]');
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      console.log("Selected coffee:", radio.value);
      // you can also update a <span id="chosenCoffee">...</span> in the DOM
    });
  });
});

