// js/app.js
console.log("app.js loaded");

// ---- element refs ----
const myRange        = document.getElementById("coffee_per_week");
const displayValue   = document.getElementById("displayValue");
const radios         = document.querySelectorAll('input[name="coffeeType"]');
const outWeekly      = document.getElementById("out_weekly");
const outMonthly     = document.getElementById("out_monthly");
const outYearly      = document.getElementById("out_yearly");
const stockRowsEl    = document.getElementById("stock_rows");
const investSummaryEl= document.getElementById("invest_summary");

// tickers must match those written by your workflow
const PRESET_TICKERS = ["SPY", "VTI", "AAPL", "MSFT"];

// formatting helpers
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// start with price of pre-checked radio (if any)
const defaultChecked = document.querySelector('input[name="coffeeType"]:checked');
let coffeePrice = defaultChecked ? parseFloat(defaultChecked.dataset.price || "0") : 0;

// ---- data loader: read static JSON produced by GitHub Actions ----
async function getCachedQuotes() {
  const res = await fetch("./data/quotes.json", { cache: "no-store" });
  if (!res.ok) throw new Error("quotes.json missing");
  return res.json(); // { asOf, quotes: { TICKER: { price } } }
}

// ---- UI: render stock comparison table ----
async function renderComparisons(yearlyBudget, tickers = PRESET_TICKERS) {
  stockRowsEl.innerHTML = "";
  if (yearlyBudget <= 0) {
    investSummaryEl.textContent = "";
    return;
  }

  try {
    const { asOf, quotes } = await getCachedQuotes();
    investSummaryEl.textContent =
      `Using your yearly spend of ${currency.format(yearlyBudget)} (prices as of ${asOf || "latest run"}):`;

    for (const t of tickers) {
      const price = parseFloat(quotes?.[t]?.price);
      if (!price || Number.isNaN(price)) continue;

      const shares   = Math.floor((yearlyBudget / price) * 1000) / 1000; // 3 decimals
      const leftover = yearlyBudget - shares * price;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><code>${t}</code></td>
        <td>${currency.format(price)}</td>
        <td>${shares}</td>
        <td>${currency.format(leftover)}</td>
      `;
      stockRowsEl.appendChild(tr);
    }
  } catch (e) {
    console.error(e);
    investSummaryEl.textContent = "Prices unavailable right now.";
  }
}

// ---- totals calculation ----
function updateWeeklyTotal() {
  const cups = parseInt(myRange.value) || 0;

  if (!coffeePrice) {
    outWeekly.textContent  = "—";
    outMonthly.textContent = "—";
    outYearly.textContent  = "—";
    stockRowsEl.innerHTML  = "";
    investSummaryEl.textContent = "";
    return;
  }

  const weekly  = cups * coffeePrice;
  const monthly = weekly * 4.345; // avg weeks/month
  const yearly  = weekly * 52;

  outWeekly.textContent  = currency.format(weekly);
  outMonthly.textContent = currency.format(monthly);
  outYearly.textContent  = currency.format(yearly);

  // refresh comparison table
  renderComparisons(yearly);
}

// ---- event wiring ----
myRange.addEventListener("input", () => {
  displayValue.textContent = `${myRange.value} cups/week`;
  updateWeeklyTotal();
});

radios.forEach(radio => {
  radio.addEventListener("change", () => {
    coffeePrice = parseFloat(radio.dataset.price || "0");
    updateWeeklyTotal();
  });
});

// ---- init ----
displayValue.textContent = `${myRange.value} cups/week`;
updateWeeklyTotal();
