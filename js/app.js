console.log("app.js loaded");

const myRange = document.getElementById("coffee_per_week");
const displayValue = document.getElementById("displayValue");
const radios = document.querySelectorAll('input[name="coffeeType"]');
const weeklyTotalEl = document.getElementById("price_per_week");

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });



// set a default if you pre-check a radio; else leave 0 and show prompt
let coffeePrice = 0;

function updateWeeklyTotal() {
  const cups = parseInt(myRange.value) || 0;

  if (!coffeePrice) {
    weeklyTotalEl.textContent = "Pick a drink to see totals.";
    return;
  }

  const weeklyTotal = cups * coffeePrice;
  const monthly = weeklyTotal * 4.345; // average weeks per month
  const yearly  = weeklyTotal * 52;

  weeklyTotalEl.textContent =
    `Weekly: ${currency.format(weeklyTotal)} · Monthly: ${currency.format(monthly)} · Yearly: ${currency.format(yearly)}`;
}

// slider input
myRange.addEventListener("input", () => {
  displayValue.textContent = myRange.value;
  updateWeeklyTotal();
});

// radio buttons
radios.forEach(radio => {
  radio.addEventListener("change", () => {
    coffeePrice = parseFloat(radio.dataset.price || "0");
    updateWeeklyTotal();
  });
});

// initialize display
displayValue.textContent = myRange.value;
updateWeeklyTotal();
