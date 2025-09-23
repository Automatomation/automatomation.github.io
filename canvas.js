// canvas.js
class CanvasManager {
  constructor(canvasId, circuit) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.gates = [];
    this.draggedGate = null;
    this.selectedGate = null;
    this.dragging = false;

    this.circuit = circuit; // Reference to the Circuit instance
  }

  addGate(gate, x, y) {
    gate.x = x;
    gate.y = y;
    this.gates.push(gate);
    return gate;
  }

  drawGates() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid(20);

    for (let gate of this.gates) {
      const w = 60;
      const h = 40;

      // Highlight if selected and not dragging
      if (gate === this.selectedGate && !this.dragging) {
        this.ctx.strokeStyle = "orange";
        this.ctx.lineWidth = 3;
      } else {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
      }

      if (gate instanceof InputGate) {
        this.ctx.fillStyle = gate.value ? "green" : "red";
        this.ctx.beginPath();
        this.ctx.arc(gate.x + 30, gate.y + 20, 8, 0, 2 * Math.PI);
        this.ctx.fill();
      }

      if (gate instanceof OutputGate) {
        // Draw a small circle indicating the input state
        this.ctx.fillStyle = gate.value ? "green" : "red";
        this.ctx.beginPath();
        this.ctx.arc(gate.x + 30, gate.y + 20, 8, 0, 2 * Math.PI);
        this.ctx.fill();
      }

      // Draw gate box
      this.ctx.beginPath();
      this.ctx.rect(gate.x, gate.y, w, h);
      this.ctx.stroke();
      this.ctx.lineWidth = 1;

      // Draw label
      this.ctx.font = "14px sans-serif";
      this.ctx.fillStyle = "black";
      this.ctx.fillText(gate.label || gate.name, gate.x + 10, gate.y + h / 2);

      // Draw inputs
      const inputSpacing = h / (gate.inputs + 1);
      for (let i = 0; i < gate.inputs; i++) {
        const cx = gate.x - 5;
        const cy = gate.y + inputSpacing * (i + 1);
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
        this.ctx.stroke();
      }

      // Draw outputs
      const outputSpacing = h / (gate.outputs + 1);
      for (let i = 0; i < gate.outputs; i++) {
        const cx = gate.x + w + 5;
        const cy = gate.y + outputSpacing * (i + 1);
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
        this.ctx.stroke();
      }
    }

    // Draw connections with 2-bend elbows and color based on value
    for (let conn of this.circuit.connections) {
      const fromX = conn.fromGate.x + 60 + 5; // output node x
      const fromY = conn.fromGate.y + (40 / (conn.fromGate.outputs + 1)) * (conn.fromIdx + 1);
      const toX = conn.toGate.x - 5; // input node x
      const toY = conn.toGate.y + (40 / (conn.toGate.inputs + 1)) * (conn.toIdx + 1);

      // Determine value of this connection
      const val = conn.fromGate.getOutputs()[conn.fromIdx];
      this.ctx.strokeStyle = val ? "green" : "red"; // color based on value
      this.ctx.lineWidth = 2;

      // Elbow style: horizontal → vertical → horizontal
      const midX = (fromX + toX) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(midX, fromY);
      this.ctx.lineTo(midX, toY);
      this.ctx.lineTo(toX, toY);
      this.ctx.stroke();
    }

    // Reset stroke style
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
  }

  drawGrid(gridSize = 20) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "#ddd"; // light gray lines
    ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  initInteraction() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 2) { // right mouse button
        const { offsetX, offsetY } = e;
        const clickedGate = this.gates.find(
          g => offsetX >= g.x && offsetX <= g.x + 60 &&
               offsetY >= g.y && offsetY <= g.y + 40
        );

        if (clickedGate) {
          // Remove connections involving this gate
          this.circuit.connections = this.circuit.connections.filter(
            conn => conn.fromGate !== clickedGate && conn.toGate !== clickedGate
          );

          // Remove the gate itself
          const idx = this.gates.indexOf(clickedGate);
          if (idx !== -1) this.gates.splice(idx, 1);

          // Remove from circuit.gates array
          const cidx = this.circuit.gates.indexOf(clickedGate);
          if (cidx !== -1) this.circuit.gates.splice(cidx, 1);

          // Clear selection if it was selected
          if (this.selectedGate === clickedGate) this.selectedGate = null;

          // Recalculate circuit
          this.circuit.evaluate();

          // Redraw
          this.drawGates();
        }
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      const { offsetX, offsetY } = e;
      this.draggedGate = this.gates.find(
        g => offsetX >= g.x && offsetX <= g.x + 60 &&
             offsetY >= g.y && offsetY <= g.y + 40
      );
      if (this.draggedGate) this.dragging = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.draggedGate) {
        this.dragging = true;
        this.draggedGate.x = e.offsetX - 30;
        this.draggedGate.y = e.offsetY - 20;
        this.drawGates();
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (this.draggedGate && !this.dragging) {
        if (!this.selectedGate) {
          // Select this gate (even if it's an InputGate)
          this.selectedGate = this.draggedGate;
        } else if (this.selectedGate === this.draggedGate) {
          // Clicked the same gate → unhighlight
          this.selectedGate = null;
        } else {
          // Connect selected gate to this gate
          const sourceGate = this.selectedGate;
          const targetGate = this.draggedGate;

          // Find first free input index
          let freeInput = targetGate.inputValues.findIndex(
            (_, idx) => !this.circuit.connections.some(
              conn => conn.toGate === targetGate && conn.toIdx === idx
            )
          );

          if (freeInput !== -1) {
            // Register connection in circuit
            this.circuit.connect(sourceGate, 0, targetGate, freeInput);
          }

          // Re-evaluate circuit
          this.circuit.evaluate();

          // Clear selection
          this.selectedGate = null;
        }
      }

      this.draggedGate = null;
      this.dragging = false;
      this.drawGates();
    });

    this.canvas.addEventListener("dblclick", (e) => {
      const { offsetX, offsetY } = e;
      const clickedGate = this.gates.find(
        g => offsetX >= g.x && offsetX <= g.x + 60 &&
             offsetY >= g.y && offsetY <= g.y + 40
      );

      if (clickedGate instanceof InputGate) {
        clickedGate.toggle();
        this.circuit.evaluate();
        this.drawGates();
      }
    });

    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault(); // prevent the browser menu from appearing
    });
  }
}
