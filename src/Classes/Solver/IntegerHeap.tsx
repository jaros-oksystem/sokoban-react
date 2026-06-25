const INIT_SIZE = 32;

// Custom heap for objects with integer cost
export class IntegerHeap<T> {
  heap: Array<Array<T>>;
  heapIdxAtPos: Array<number>;
  minPos: number;
  maxPos: number;
  maxSize: number;
  retrievedLastValue: boolean;

  constructor() {
    this.heap = [...Array(INIT_SIZE)].map(() => new Array<T>());
    this.heapIdxAtPos = new Array<number>(INIT_SIZE).fill(0);
    this.minPos = 0;
    this.maxPos = 0;
    this.maxSize = INIT_SIZE;
    this.retrievedLastValue = false;
  }

  increaseSizeToIdx(idx: number) {
    const newSize = 2 ** (Math.floor(Math.log2(idx)) + 1);
    for (let i = this.maxSize; i < newSize; i++) {
      this.heap[i] = new Array<T>();
      this.heapIdxAtPos[i] = 0;
    }
    this.maxSize = newSize;
  }

  add(idx: number, value: T) {
    if (idx < this.minPos) {
      this.minPos = idx;
    }
    if (idx >= this.maxSize) {
      this.increaseSizeToIdx(idx);
    }
    if (this.maxPos < idx) {
      this.maxPos = idx;
    }
    this.heap[idx].push(value);
  }

  getNext(): T | null {
    if (this.retrievedLastValue) {
      // Sanity check
      throw new Error("The last value has already been retrieved");
    }
    while (true) {
      // Check if all values have been retrieved
      if (this.minPos > this.maxPos) {
        this.retrievedLastValue = true;
        return null;
      }

      // If the current position has an element to retrieve, return it
      const curPosArrLen = this.heap[this.minPos].length;
      if (curPosArrLen > this.heapIdxAtPos[this.minPos]) {
        return this.heap[this.minPos][this.heapIdxAtPos[this.minPos]++]
      }

      // Allow the current array to be collected by GC and move to the next one
      if (curPosArrLen !== 0) {
        this.heap[this.minPos] = new Array<T>();
        this.heapIdxAtPos[this.minPos] = 0;
      }
      this.minPos++;
    }
  }

}