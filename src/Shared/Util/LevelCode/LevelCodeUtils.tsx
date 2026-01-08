import {splitStringGroupsWhichExceedMaximumLength, splitStringToRepeatingGroups} from "@/src/Shared/Util/StringUtils";
import {
  BASE64_LEN,
  BASE64_ONES_CHAR,
  BASE64_ZEROS_CHAR,
  base64ToDecimal,
  decimalToBase64
} from "@/src/Shared/Util/LevelCode/BaseConversionUtils";
import GridCoordinates from "@/src/Shared/Classes/GridCoordinates";
import {enlargeMatrixOnEachSide, getMatrixOfSize, getMatrixWithConditionalFill} from "@/src/Shared/Util/MatrixUtils";

export const SEPARATOR = "-";
export const ALT_SEPARATOR = "_";

export const ESCAPE_CHAR_0 = "(";
export const ESCAPE_CHAR_1 = ")";

export function compressBase64String(base64String: string): string {
  const repeatingGroups = splitStringToRepeatingGroups(base64String);
  const groupsToCompress = splitStringGroupsWhichExceedMaximumLength(repeatingGroups, BASE64_LEN-1);
  let ret = "";
  for (let i = 0; i < groupsToCompress.length; i++) {
    const group = groupsToCompress[i];
    const useEscapeChar =
        group.startsWith(BASE64_ZEROS_CHAR) ? ESCAPE_CHAR_0 :
        group.startsWith(BASE64_ONES_CHAR) ? ESCAPE_CHAR_1 :
        "";
    if (group.length > 2 && useEscapeChar != "") {
      ret += useEscapeChar + decimalToBase64(group.length);
    } else {
      ret += group;
    }
  }
  return ret;
}

export function decompressBase64String(str: string): string {
  let ret = "";
  for (let i = 0; i < str.length; i++) {
    const charToRepeat =
        str[i] == ESCAPE_CHAR_0 ? BASE64_ZEROS_CHAR :
        str[i] == ESCAPE_CHAR_1 ? BASE64_ONES_CHAR :
        "";
    if (charToRepeat != "") {
      ret += charToRepeat.repeat(base64ToDecimal(str[i+1]));
      i++;
    } else {
      ret += str[i];
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