import {splitStringToRepeatingGroups} from "@/src/Util/StringUtils";
import {
  BASE64_ONES_CHAR,
  BASE64_ZEROS_CHAR,
  base64ToDecimal,
  decimalToBase64
} from "@/src/Util/LevelCode/BaseConversionUtils";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {enlargeMatrixOnEachSide, getMatrixOfSize, getMatrixWithConditionalFill} from "@/src/Util/MatrixUtils";

export const SEPARATOR = "-";
export const ALT_SEPARATOR = "_";

export const ESCAPE_CHAR_0 = "(";
export const ESCAPE_CHAR_1 = ")";

export function compressBase64String(base64String: string): string {
  const repeatingGroups = splitStringToRepeatingGroups(base64String);
  let ret = "";
  for (let i = 0; i < repeatingGroups.length; i++) {
    const group = repeatingGroups[i];
    const useEscapeChar =
        group.startsWith(BASE64_ZEROS_CHAR) ? ESCAPE_CHAR_0 :
        group.startsWith(BASE64_ONES_CHAR) ? ESCAPE_CHAR_1 :
        "";
    if (group.length > 2 && useEscapeChar != "") {
      const lengthBase64 = decimalToBase64(group.length);
      ret += useEscapeChar.repeat(lengthBase64.length) + lengthBase64;
    } else {
      ret += group;
    }
  }
  return ret;
}

export function decompressBase64String(str: string): string {
  let ret = "";
  for (let i = 0; i < str.length;) {
    const charToRepeat =
        str[i] == ESCAPE_CHAR_0 ? BASE64_ZEROS_CHAR :
        str[i] == ESCAPE_CHAR_1 ? BASE64_ONES_CHAR :
        "";
    if (charToRepeat == "") {
      ret += str[i++];
    } else {
      const iAtEscapeChar = i;
      while (str[i] == ESCAPE_CHAR_0 || str[i] == ESCAPE_CHAR_1) {
        i++;
      }
      const escapeLen = i - iAtEscapeChar;
      ret += charToRepeat.repeat(base64ToDecimal(str.substring(i, i + escapeLen)));
      i += escapeLen;
    }
  }
  return ret;
}

export function tileIdToCoordinates(tileId: number, lenY: number): GridCoordinates {
  return new GridCoordinates(
      Math.floor(tileId / lenY),
      tileId % lenY);
}

export function coordinatesToTileId(coordinates: GridCoordinates, lenY: number): number {
  return lenY*coordinates.x + coordinates.y;
}

export function getInvertedBitmap(bitmap: boolean[][]): boolean[][] {
  return getMatrixWithConditionalFill(bitmap.length, bitmap[0].length, (x,y) => !bitmap[x][y]);
}

export function bitmapToCoordinates(bitmap: boolean[][]): GridCoordinates[] {
  const ret: GridCoordinates[] = [];
  for (let x = 0; x < bitmap.length; x++) {
    for (let y = 0; y < bitmap[0].length; y++) {
      if (bitmap[x][y]) {
        ret.push(new GridCoordinates(x,y));
      }
    }
  }
  return ret;
}

export function canMaskBeUsedOnBitmap(tileBitmap: boolean[][], mask: boolean[][]) {
  for (let x = 0; x < tileBitmap.length; x++) {
    for (let y = 0; y < tileBitmap[0].length; y++) {
      if (tileBitmap[x][y] && !mask[x][y]) {
        return false;
      }
    }
  }
  return true;
}

export function bitmapToBinaryString(bitmap: boolean[][], mask: boolean[][] = []): string {
  let ret = "";
  for (let x = 0; x < bitmap.length; x++) {
    for (let y = 0; y < bitmap[0].length; y++) {
      if (mask.length == 0 || mask[x][y]) {
        ret += String(bitmap[x][y] ? "1" : "0");
      }
    }
  }
  return ret;
}

export function binaryStringToBitmap(binaryString: string, lenX: number, lenY: number, mask: boolean[][] = []): boolean[][] {
  const ret = getMatrixOfSize(lenX, lenY, false);
  let i = 0;
  for (let x = 0; x < lenX; x++) {
    for (let y = 0; y < lenY; y++) {
      if (mask.length == 0 || mask[x][y]) {
        ret[x][y] = Number.parseInt(binaryString[i]) == 1;
        i++;
      }
    }
  }
  return ret;
}

export function trimmedPlayableMaskToWallBitmap(mask: boolean[][]): boolean[][] {
  const enlargedMask = enlargeMatrixOnEachSide(mask, false);
  const lenX = enlargedMask.length;
  const lenY = enlargedMask[0].length;
  const shifts =
      [new GridCoordinates(-1,-1), new GridCoordinates(0,-1), new GridCoordinates(1,-1),
       new GridCoordinates(-1, 0),                            new GridCoordinates(1, 0),
       new GridCoordinates(-1, 1), new GridCoordinates(0, 1), new GridCoordinates(1, 1)];

  return getMatrixWithConditionalFill(lenX, lenY, (x, y) => {
    if (enlargedMask[x][y]) {
      return false;
    }
    let isWall = false;
    for (const shift of shifts) {
      const searchedX = x+shift.x;
      const searchedY = y+shift.y;
      if (searchedX < 0 || searchedY < 0 || searchedX >= lenX || searchedY >= lenY) {
        continue;
      }
      if (enlargedMask[searchedX][searchedY]) {
        isWall = true;
        break;
      }
    }
    return isWall;
  });
}