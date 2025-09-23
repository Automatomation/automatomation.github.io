// circuit.js
class Circuit {
  constructor() {
    this.gates = [];
    this.connections = [];
  }

  addGate(gate) {
    this.gates.push(gate);
  }

  connect(fromGate, fromIdx, toGate, toIdx) {
    this.connections.push({ fromGate, fromIdx, toGate, toIdx });
  }

  evaluate() {
    for (let gate of this.gates) {
      gate.evaluate();
    }
    for (let conn of this.connections) {
      const val = conn.fromGate.getOutputs()[conn.fromIdx];
      conn.toGate.inputValues[conn.toIdx] = val;
      conn.toGate.evaluate();
    }
  }

   generateTruthTable() {
    // Step 1: Identify the input gates
    const inputGates = this.gates.filter(g => g instanceof InputGate);

    // Step 2: Generate all possible input combinations
    const numInputs = inputGates.length;
    const inputCombinations = this._generateCombinations(numInputs);
    const truthTable = [];

    for (let combination of inputCombinations) {
      // Set the input values for each input gate in the current combination
      for (let i = 0; i < combination.length; i++) {
        inputGates[i].setValue(combination[i]);  // Call setValue to set the gate's output value
      }

      // Evaluate the circuit with the current combination of inputs
      this.evaluate();

      // Collect the outputs of all gates
      const outputGates = this.gates.filter(g => g instanceof OutputGate);
      const result = [];

      for (let outputGate of outputGates) {
        result.push(outputGate.value);
      }

      // Log the outputs (or process them as needed)
      truthTable.push({ inputs: combination, outputs: result });
    }

    return truthTable;
  };

  // Helper function to generate all input combinations (binary)
  _generateCombinations(numInputs) {
    const combinations = [];
    const totalCombinations = Math.pow(2, numInputs);

    for (let i = 0; i < totalCombinations; i++) {
      const combination = [];
      for (let j = 0; j < numInputs; j++) {
        combination.push(Boolean(i & (1 << (numInputs - j - 1))));
      }
      combinations.push(combination);
    }

    return combinations;
  }
}
