import { BubbleSortStepper } from './bubbleSort.js';

const barContainer = document.getElementById("bar-container");
const moneyDisplay = document.getElementById("money");
const sortButton = document.getElementById("sort-button");
const autoToggle = document.getElementById("auto-toggle");
const stepCountDisplay = document.getElementById("step-count");
const ramUpgradeBtn = document.getElementById("ram-upgrade");
const barUpgradeBtn = document.getElementById("bar-upgrade");

let money = 0;
let bars = [];
let stepper = null;
let stepCount = 0;
let lastHighlighted = [];

let auto = false;
let interval = null;
let autoDelay = 300;
let numBars = 5;

// Upgrade flags
let ramLevel = 0;
let barLevel = 0;

function init() {
  bars = Array.from({ length: numBars }, () => Math.floor(Math.random() * 100) + 1);
  createBars();
  updateBars();
  stepper = new BubbleSortStepper(bars);
  clearHighlights();
  stepCount = 0;
  updateStepCounter();
  moneyDisplay.textContent = money;
  checkUpgrades();
}

function createBars() {
  barContainer.innerHTML = "";
  bars.forEach(() => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    barContainer.appendChild(bar);
  });
}

function updateBars() {
  const barElements = barContainer.children;
  bars.forEach((value, i) => {
    barElements[i].style.height = `${value * 2}px`;
  });
}

function clearHighlights() {
  lastHighlighted.forEach(i => {
    barContainer.children[i]?.classList.remove("comparing", "swapping");
  });
  lastHighlighted = [];
}

function updateStepCounter() {
  stepCountDisplay.textContent = stepCount;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function stepSort() {
  if (!stepper || stepper.done) {
    money += 10;
    moneyDisplay.textContent = money;
    checkUpgrades();
    await sleep(300);
    init();
    return;
  }

  clearHighlights();
  const step = stepper.nextStep();

  if (!step || step.done) {
    money += 10;
    moneyDisplay.textContent = money;
    checkUpgrades();
    await sleep(300);
    init();
    return;
  }

  const [i, j] = step.indices;
  const barsEls = barContainer.children;

  if (step.type === 'compare') {
    barsEls[i].classList.add('comparing');
    barsEls[j].classList.add('comparing');
  }

  if (step.type === 'swap') {
    barsEls[i].classList.add('swapping');
    barsEls[j].classList.add('swapping');
    [bars[i], bars[j]] = [bars[j], bars[i]];
    updateBars();
  }

  lastHighlighted = [i, j];
  stepCount++;
  updateStepCounter();
}

sortButton.addEventListener("click", stepSort);

autoToggle.addEventListener("click", () => {
  auto = !auto;
  autoToggle.textContent = `Auto: ${auto ? "On" : "Off"}`;
  if (auto) {
    interval = setInterval(stepSort, autoDelay);
  } else {
    clearInterval(interval);
  }
});

function checkUpgrades() {
  ramUpgradeBtn.disabled = money < 30 || ramLevel > 0;
  barUpgradeBtn.disabled = money < 20 || barLevel > 0;
}

// === Upgrade Handlers ===

ramUpgradeBtn.addEventListener("click", () => {
  if (money >= 30 && ramLevel === 0) {
    money -= 30;
    ramLevel++;
    autoDelay = 200; // 33% faster
    moneyDisplay.textContent = money;
    ramUpgradeBtn.disabled = true;
    if (auto) {
      clearInterval(interval);
      interval = setInterval(stepSort, autoDelay);
    }
  }
});

barUpgradeBtn.addEventListener("click", () => {
  if (money >= 20 && barLevel === 0) {
    money -= 20;
    barLevel++;
    numBars += 5;
    moneyDisplay.textContent = money;
    barUpgradeBtn.disabled = true;
    init(); // Reinitialize with more bars
  }
});

init();
