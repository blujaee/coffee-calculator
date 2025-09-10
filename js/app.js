console.log("app.js loaded");

const myRange = document.getElementById("coffee_per_week");
const displayValue = document.getElementById("displayValue");
const radios = document.querySelectorAll('input[name="coffeeType"]');
const outWeekly  = document.getElementById("out_weekly");
const outMonthly = document.getElementById("out_monthly");
const outYearly  = document.getElementById("out_yearly");
const stockRowsEl = document.getElementById("stock_rows");
const investSummaryEl = document.getElementById("invest_summary");
const PRESET_TICKERS = ["SPY", "VTI", "AAPL", "MSFT"];


const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// start with the price of the pre-checked radio (if any)
const defaultChecked = document.querySelector('input[name="coffeeType"]:checked');
let coffeePrice = defaultChecked ? parseFloat(defaultChecked.dataset.price || "0") : 0;

function cacheGet(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > maxAgeMs) return null; // expired
    return v;
  } catch { return null; }
}
function cacheSet(key, value) {
  localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
}

async function fetchQuote(ticker) {
  const cacheKey = `av_quote_${ticker}`;
  const cached = cacheGet(cacheKey, 60 * 60 * 1000); // 1 hour
  if (cached) return cached; // { price, asOf }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${AV_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quote fetch failed ${res.status}`);
  const data = await res.json();
  const q = data["Global Quote"] || {};
  const price = parseFloat(q["05. price"]);
  const asOf  = q["07. latest trading day"] || "";
  if (!price || Number.isNaN(price)) throw new Error("No price in response");
  const out = { price, asOf };
  cacheSet(cacheKey, out);
  return out;
}

async function renderComparisons(yearlyBudget, tickers = PRESET_TICKERS) {
  // summary line
  investSummaryEl.textContent = yearlyBudget > 0
    ? `With ${currency.format(yearlyBudget)}, you could buy approximately:`
    : "";

  stockRowsEl.innerHTML = "";
  if (yearlyBudget <= 0) return;

  for (const t of tickers) {
    try {
      const { price } = await fetchQuote(t);
      const shares = Math.floor((yearlyBudget / price) * 1000) / 1000; // 3 dp
      const leftover = yearlyBudget - shares * price;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><code>${t}</code></td>
        <td>${currency.format(price)}</td>
        <td>${shares}</td>
        <td>${currency.format(leftover)}</td>
      `;
      stockRowsEl.appendChild(tr);
    } catch (e) {
      console.error(e);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><code>${t}</code></td>
        <td colspan="3" class="text-danger">Error fetching price</td>`;
      stockRowsEl.appendChild(tr);
    }
  }
}


function updateWeeklyTotal() {
  const cups = parseInt(myRange.value) || 0;

  if (!coffeePrice) {
    outWeekly.textContent  = "—";
    outMonthly.textContent = "—";
    outYearly.textContent  = "—";
    return;
  }

  const weekly  = cups * coffeePrice;
  const monthly = weekly * 4.345; // avg weeks/month
  const yearly  = weekly * 52;

  outWeekly.textContent  = currency.format(weekly);
  outMonthly.textContent = currency.format(monthly);
  outYearly.textContent  = currency.format(yearly);
  renderComparisons(yearly);

}

// slider input
myRange.addEventListener("input", () => {
  displayValue.textContent = `${myRange.value} cups/week`;
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
displayValue.textContent = `${myRange.value} cups/week`;
updateWeeklyTotal();
