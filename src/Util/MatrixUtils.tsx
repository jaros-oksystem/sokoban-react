export function getMatrixOfSize<T>(lenX: number, lenY: number, fill: T): T[][] {
  return [...Array(lenX)].map(() => new Array(lenY).fill(fill));
}

export function getMatrixWithConditionalFill<T>(lenX: number, lenY: number, fill: (x: number, y: number) => T): T[][] {
  const ret = getMatrixOfSize(lenX, lenY, fill(0,0));
  for (let x = 0; x < lenX; x++) {
    for (let y = 0; y < lenY; y++) {
      ret[x][y] = fill(x, y);
    }
  }
  return ret;
}

export function getTransposedMatrix<T>(matrix: T[][]): T[][] {
  return getMatrixWithConditionalFill(matrix[0].length, matrix.length, (x,y) => matrix[y][x]);
}

export function matricesAreEqual<T>(matrix1: T[][], matrix2: T[][]): boolean {
  if (matrix1.length != matrix2.length) {
    return false;
  }
  for (let x = 0; x < matrix1.length; x++) {
    if (matrix1[x].length != matrix2[x].length) {
      return false;
    }
    for (let y = 0; y < matrix1[0].length; y++) {
      if (matrix1[x][y] != matrix2[x][y]) {
        return false;
      }
    }
  }
  return true;
}

export function enlargeMatrixOnEachSide<T>(matrix: T[][], fill: T, amount: number = 1): T[][] {
  if (matrix.length == 0) {
    return getMatrixOfSize(amount*2, amount*2, fill);
  }
  const newLenX = matrix.length + amount*2;
  const newLenY = matrix[0].length + amount*2;
  const ret = getMatrixOfSize(newLenX , newLenY, fill);
  for (let x = 0; x < matrix.length; x++) {
    for (let y = 0; y < matrix[0].length; y++) {
      ret[x+amount][y+amount] = matrix[x][y];
    }
  }
  return ret;
}

export function trimMatrixOnEachSide<T>(matrix: T[][], amount: number = 1): T[][] {
  if (matrix.length - amount*2 < 1 || matrix[0].length - amount*2 < 1) {
    return [];
  }
  return getMatrixWithConditionalFill(
      matrix.length - amount*2,
      matrix[0].length - amount*2,
      (x,y) => matrix[x+amount][y+amount]
  );
}