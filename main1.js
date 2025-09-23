// main1.js

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
document.getElementById("add-nor").addEventListener("click", () => {
  const g = new Gate("NOR", 2, 1, NOR_TABLE, "nor");
  canvasManager.addGate(g, 50, 50);
  circuit.addGate(g);
  canvasManager.drawGates();
});

// Add starting inputs/outputs

const in1 = new InputGate(" ");
canvasManager.addGate(in1, 50, 100);
circuit.addGate(in1);
canvasManager.drawGates();

const in2 = new InputGate(" ");
canvasManager.addGate(in2, 50, 200);
circuit.addGate(in2);
canvasManager.drawGates();

const out1 = new OutputGate(" ");
canvasManager.addGate(out1, 250, 150);
circuit.addGate(out1);
canvasManager.drawGates();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasManager.drawGates(); // redraw everything on resize
});

// Add this event listener to handle check answer functionality
document.getElementById("check-answer").addEventListener("click", () => {
  let correct = checkCircuitAnswer(circuit);
  
  if (correct) {
    alert("Congratulations! You've built the circuit correctly.");
  } else {
    alert("Oops! The circuit is incorrect. Try again.");
  }
});

function checkCircuitAnswer(circuit) {
  const answer = [
    { inputs: [false, false], outputs: [false] },
    { inputs: [false, true],  outputs: [true] },
    { inputs: [true, false],  outputs: [true] },
    { inputs: [true, true],   outputs: [true] }
  ];

  const tab = circuit.generateTruthTable();
  // Compare the answer and the generated truth table
  for (let i = 0; i < answer.length; i++) {
    // Compare inputs
    if (JSON.stringify(answer[i].inputs) !== JSON.stringify(tab[i].inputs)) {
      console.log(`Mismatch in inputs at index ${i}: expected ${answer[i].inputs}, got ${tab[i].inputs}`);
      return false;
    }

    // Compare outputs
    if (JSON.stringify(answer[i].outputs) !== JSON.stringify(tab[i].outputs)) {
      console.log(`Mismatch in outputs at index ${i}: expected ${answer[i].outputs}, got ${tab[i].outputs}`);
      return false;
    }
  }

  // If we pass all checks, the circuit is correct
  return true;
}