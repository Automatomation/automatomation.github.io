// main.js

// Example AND gate truth table
const AND_TABLE = [
  { inputs: [false, false], outputs: [false] },
  { inputs: [false, true],  outputs: [false] },
  { inputs: [true, false],  outputs: [false] },
  { inputs: [true, true],   outputs: [true] }
];

// Example NOR gate truth table
const NOR_TABLE = [
  { inputs: [false, false], outputs: [true] },
  { inputs: [false, true],  outputs: [false] },
  { inputs: [true, false],  outputs: [false] },
  { inputs: [true, true],   outputs: [false] }
];

// 1️⃣ Create circuit instance first
const circuit = new Circuit();

const canvas = document.getElementById("circuitCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 2️⃣ Create canvas manager, passing the circuit
const canvasManager = new CanvasManager("circuitCanvas", circuit);
canvasManager.initInteraction();

// 4️⃣ Draw everything
canvasManager.drawGates();

// Hook toolbar buttons
document.getElementById("add-and").addEventListener("click", () => {
  const g = new Gate("AND", 2, 1, AND_TABLE, "And");
  canvasManager.addGate(g, 50, 50);
  circuit.addGate(g);
  canvasManager.drawGates();
});

// Hook toolbar buttons
document.getElementById("add-nor").addEventListener("click", () => {
  const g = new Gate("NOR", 2, 1, NOR_TABLE, "nor");
  canvasManager.addGate(g, 50, 50);
  circuit.addGate(g);
  canvasManager.drawGates();
});

// NEW: Add Input Gate button
document.getElementById("add-input").addEventListener("click", () => {
  const g = new InputGate(" ");
  canvasManager.addGate(g, 50, 50);
  circuit.addGate(g);
  canvasManager.drawGates();
});

document.getElementById("add-output").addEventListener("click", () => {
  const g = new OutputGate(" ");
  canvasManager.addGate(g, 50, 50);
  circuit.addGate(g);
  canvasManager.drawGates();
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasManager.drawGates(); // redraw everything on resize
});
