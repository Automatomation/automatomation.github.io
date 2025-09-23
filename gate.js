// gate.js
class Gate {
  constructor(name, inputs, outputs, truthTable, label) {
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
    this.truthTable = truthTable;
    this.label = label;

    // Track input/output logically only
    this.inputValues = new Array(inputs).fill(false);
    this.outputValues = new Array(outputs).fill(false);

    this.evaluate(); // ensure outputs match initial inputs
  }

  setInputs(values) {
    if (values.length !== this.inputs) {
      throw new Error(`Gate ${this.name} expects ${this.inputs} inputs`);
    }
    this.inputValues = values;
    this.evaluate();
  }

  evaluate() {
    for (let row of this.truthTable) {
      if (row.inputs.every((val, idx) => val === this.inputValues[idx])) {
        this.outputValues = row.outputs.slice();
        return this.outputValues;
      }
    }
    this.outputValues = new Array(this.outputs).fill(false);
    return this.outputValues;
  }

  getOutputs() {
    return this.outputValues;
  }
}

class InputGate extends Gate {
  constructor(label) {
    super("INPUT", 0, 1, [{ inputs: [], outputs: [false] }], label);
    this.value = false;   // current output value
    this.updateOutput();
  }

  // Toggle between 0 and 1
  toggle() {
    this.value = !this.value;
    this.updateOutput();
  }

  // Update outputValues to match current value
  updateOutput() {
    this.outputValues[0] = this.value;
  }

  setValue(val) {
    this.value = val;
  }

  // No inputs, evaluate just sets output
  evaluate() {
    this.updateOutput();
    return this.outputValues;
  }

  // Clicking can toggle (optional)
  handleClick() {
    this.toggle();
  }
}

class OutputGate extends Gate {
  constructor(label) {
    super("OUTPUT", 1, 0, [{ inputs: [false], outputs: [] }], label); // 1 input, 0 outputs
    this.value = false; // store current input value
  }

  // Evaluate just stores input value
  evaluate() {
    if (this.inputValues.length > 0) {
      this.value = this.inputValues[0]; // take first input
    } else {
      this.value = false;
    }
    return []; // no outputs
  }
}
