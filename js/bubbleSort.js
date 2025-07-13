export class BubbleSortStepper {
  constructor(array) {
    this.array = array.slice();
    this.i = 0;
    this.j = 0;
    this.n = array.length;
    this.phase = 'compare'; // 'compare' → 'swap' (if needed)
    this.done = false;
    this._lastSwapped = false;
  }

  nextStep() {
    if (this.done) return { done: true };

    if (this.j >= this.n - this.i - 1) {
      this.j = 0;
      this.i++;
      if (this.i >= this.n - 1) {
        this.done = true;
        return { done: true };
      }
    }

    const left = this.j;
    const right = this.j + 1;

    if (this.phase === 'compare') {
      this.phase = 'swap';
      this._lastSwapped = this.array[left] > this.array[right];
      return {
        type: 'compare',
        indices: [left, right],
        array: this.array.slice(),
        done: false,
      };
    }

    if (this.phase === 'swap') {
      this.phase = 'compare';
      const didSwap = this._lastSwapped;

      if (didSwap) {
        [this.array[left], this.array[right]] = [this.array[right], this.array[left]];
      }

      const result = {
        type: didSwap ? 'swap' : 'noop',
        indices: [left, right],
        array: this.array.slice(),
        swapped: didSwap,
        done: false,
      };

      this.j++;
      return result;
    }
  }
}
