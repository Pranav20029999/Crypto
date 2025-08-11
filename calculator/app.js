(function () {
  "use strict";

  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");
  const keysContainer = document.querySelector(".keys");
  const historyListEl = document.getElementById("history-list");
  const historyPanelEl = document.getElementById("history-panel");
  const toggleHistoryBtn = document.getElementById("toggle-history");
  const clearHistoryBtn = document.getElementById("clear-history");
  const copyLastBtn = document.getElementById("copy-last");
  const toggleThemeBtn = document.getElementById("toggle-theme");

  const HISTORY_STORAGE_KEY = "calc_history_v1";
  const THEME_STORAGE_KEY = "calc_theme";

  /** @type {Array<{expression: string, result: string, timestamp: number}>} */
  let historyItems = [];

  /** @type {string} */
  let currentExpression = "";

  /** @type {string} */
  let lastResult = "0";

  function formatForDisplay(expr) {
    return expr
      .replaceAll("*", "×")
      .replaceAll("/", "÷");
  }

  function vibrate(ms = 10) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function updateDisplay() {
    expressionEl.textContent = formatForDisplay(currentExpression);
    resultEl.textContent = lastResult;
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyItems));
    } catch {}
  }

  function renderHistory() {
    historyListEl.innerHTML = "";
    if (historyItems.length === 0) {
      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML = `<div class="expr">No history yet</div>`;
      historyListEl.appendChild(li);
      return;
    }

    for (let i = historyItems.length - 1; i >= 0; i--) {
      const item = historyItems[i];
      const li = document.createElement("li");
      li.className = "history-item";
      const d = new Date(item.timestamp);
      const time = d.toLocaleString();
      li.innerHTML = `
        <div class="expr">${formatForDisplay(item.expression)}</div>
        <div class="res">${item.result}</div>
        <div class="meta">${time}</div>
      `;
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.setAttribute("title", "Use this result");
      li.addEventListener("click", () => {
        currentExpression = item.result;
        lastResult = item.result;
        updateDisplay();
      });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      });
      historyListEl.appendChild(li);
    }
  }

  function sanitizeExpression(expr) {
    return expr.replace(/[^0-9+\-*/().% ]/g, "");
  }

  function transformPercent(expr) {
    // Replace standalone number% with (number/100)
    return expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  }

  function evaluateExpression(expr) {
    if (!expr || /[+\-*/.]$/.test(expr)) {
      return lastResult;
    }
    const sanitized = transformPercent(sanitizeExpression(expr));
    try {
      // eslint-disable-next-line no-new-func
      const compute = new Function(`return (${sanitized})`);
      const value = compute();
      if (typeof value === "number" && Number.isFinite(value)) {
        return String(roundSmart(value));
      }
      return "Error";
    } catch {
      return "Error";
    }
  }

  function roundSmart(n) {
    // Avoid floating point artifacts; keep up to 12 significant digits
    const fixed = Number.parseFloat(n.toPrecision(12));
    return Number.isInteger(fixed) ? fixed : Number(fixed.toString());
  }

  function isOperator(char) {
    return char === "+" || char === "-" || char === "*" || char === "/";
  }

  function appendValue(value) {
    const lastChar = currentExpression.slice(-1);

    if (value === ".") {
      // Prevent multiple decimals in the current number segment
      const lastNumberMatch = /([\d]*\.?[\d]*)$/.exec(currentExpression);
      const lastNumber = lastNumberMatch ? lastNumberMatch[0] : "";
      if (lastNumber.includes(".")) return;
      if (lastNumber === "") {
        currentExpression += "0";
      }
      currentExpression += ".";
      resultEl.textContent = evaluateExpression(currentExpression);
      expressionEl.textContent = formatForDisplay(currentExpression);
      return;
    }

    if (isOperator(value)) {
      if (currentExpression === "" && value !== "-") return; // allow leading minus only
      if (isOperator(lastChar)) {
        // Replace the last operator
        currentExpression = currentExpression.slice(0, -1) + value;
      } else {
        currentExpression += value;
      }
      resultEl.textContent = evaluateExpression(currentExpression);
      expressionEl.textContent = formatForDisplay(currentExpression);
      return;
    }

    // Numbers and percent
    currentExpression += value;
    const preview = evaluateExpression(currentExpression);
    if (preview !== "Error") lastResult = preview;
    updateDisplay();
  }

  function backspace() {
    if (!currentExpression) return;
    currentExpression = currentExpression.slice(0, -1);
    const preview = evaluateExpression(currentExpression);
    if (preview !== "Error") lastResult = preview;
    updateDisplay();
  }

  function clearAll() {
    currentExpression = "";
    lastResult = "0";
    updateDisplay();
  }

  function equals() {
    const res = evaluateExpression(currentExpression);
    if (res === "Error") {
      vibrate(30);
      resultEl.textContent = res;
      return;
    }
    if (currentExpression.trim() === "") return;

    const record = {
      expression: currentExpression,
      result: res,
      timestamp: Date.now(),
    };
    historyItems.push(record);
    saveHistory();
    renderHistory();

    currentExpression = res;
    lastResult = res;
    updateDisplay();
  }

  function toggleSign() {
    // Toggle sign of the last number segment
    const match = /(.*?)([\d.]+)$/.exec(currentExpression);
    if (!match) {
      if (currentExpression === "") {
        currentExpression = "-";
        updateDisplay();
      }
      return;
    }
    const prefix = match[1] ?? "";
    const number = match[2] ?? "";

    // Check if number already has a negative sign in prefix (like "+-3")
    const signMatch = /(.*?)([+\-/*(]|^)(-)?$/.exec(prefix);
    const insertIndex = prefix.length;

    // Determine the token before number
    const before = prefix.slice(-1);
    if (before === "-") {
      // Remove the minus
      currentExpression = prefix.slice(0, -1) + number;
    } else if (before === "+") {
      currentExpression = prefix.slice(0, -1) + "-" + number;
    } else if (before === "(" || before === "" || isOperator(before)) {
      currentExpression = prefix + "-" + number;
    } else {
      // Fallback: wrap in parentheses
      currentExpression = prefix + "(-" + number + ")";
    }

    const preview = evaluateExpression(currentExpression);
    if (preview !== "Error") lastResult = preview;
    updateDisplay();
  }

  function handleKey(e) {
    const key = e.key;

    if (/^[0-9]$/.test(key)) {
      appendValue(key);
      return;
    }
    if (key === ".") {
      appendValue(".");
      return;
    }
    if (key === "+" || key === "-" || key === "*" || key === "/") {
      appendValue(key);
      e.preventDefault();
      return;
    }
    if (key === "Enter" || key === "=") {
      equals();
      e.preventDefault();
      return;
    }
    if (key === "Backspace") {
      backspace();
      e.preventDefault();
      return;
    }
    if (key === "Escape" || key.toLowerCase() === "c") {
      clearAll();
      e.preventDefault();
      return;
    }
    if (key === "%") {
      appendValue("%");
      e.preventDefault();
      return;
    }
    if (key === "(") {
      appendValue("(");
      e.preventDefault();
      return;
    }
    if (key === ")") {
      appendValue(")");
      e.preventDefault();
      return;
    }
  }

  function attachEvents() {
    keysContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("key")) return;

      const action = target.getAttribute("data-action");
      const value = target.getAttribute("data-value");
      if (action === "clear-all") return clearAll();
      if (action === "equals") return equals();
      if (action === "backspace") return backspace();
      if (action === "toggle-sign") return toggleSign();
      if (value) return appendValue(value);
    });

    document.addEventListener("keydown", handleKey);

    toggleHistoryBtn.addEventListener("click", () => {
      const isOpen = historyPanelEl.classList.toggle("is-open");
      toggleHistoryBtn.setAttribute("aria-expanded", String(isOpen));
    });

    clearHistoryBtn.addEventListener("click", () => {
      historyItems = [];
      saveHistory();
      renderHistory();
    });

    copyLastBtn.addEventListener("click", async () => {
      if (!historyItems.length) return;
      const last = historyItems[historyItems.length - 1];
      try {
        await navigator.clipboard.writeText(last.result);
        copyLastBtn.textContent = "Copied";
        setTimeout(() => (copyLastBtn.textContent = "Copy last"), 1200);
      } catch {}
    });

    toggleThemeBtn.addEventListener("click", toggleTheme);
  }

  function init() {
    loadTheme();
    historyItems = loadHistory();
    renderHistory();
    updateDisplay();
    attachEvents();
  }

  init();
})();