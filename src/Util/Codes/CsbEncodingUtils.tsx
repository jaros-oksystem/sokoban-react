import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";
import Level from "@/src/Classes/Level";
import {
  getMatrixOfSize,
  getMatrixWithConditionalFill,
  matricesAreEqual,
  trimMatrixOnEachSide
} from "@/src/Util/MatrixUtils";
import {
  BASE64_BITS,
  binaryStringToBase64String,
  decimalToBase64
} from "@/src/Util/Codes/BaseConversionUtils";
import {
  ALT_SEPARATOR,
  bitmapToBinaryString,
  canMaskBeUsedOnBitmap,
  compressBase64String,
  coordinatesToTileId, getInvertedBitmap,
  SEPARATOR,
  trimmedPlayableMaskToWallBitmap
} from "@/src/Util/Codes/GeneralCsbUtils";
import {getStringWithChangedCharAt} from "@/src/Util/StringUtils";

export default function getCsbCodeFromLevel(level: Level): string {
  const csbCode = createCode(level);
  const transLevelCsbCode = createCode(level.getLevelTransposed());
  if (transLevelCsbCode.length < csbCode.length) {
    return getStringWithChangedCharAt(transLevelCsbCode, ALT_SEPARATOR, transLevelCsbCode.indexOf(SEPARATOR));
  }
  return csbCode;
}

function createCode(level: Level): string {
  return decimalToBase64(level.lenX) + SEPARATOR + decimalToBase64(level.lenY)
      + getCodePartForPlayer(level)
      + getCodePartForWalls(level)
      + getCodePartForGoals(level)
      + getCodePartForBoxes(level);
}

function getCodePartForPlayer(level: Level) {
  return SEPARATOR + (level.isInitialPlayerAtNoPlayerCoordinates() ? "" :
      decimalToBase64(coordinatesToTileId(level.initialPlayer, level.lenY)));
}

function getCodePartForWalls(level: Level): string {
  const wallBitmap = getBitmapByTileType(level, LevelTileEnum.WALL);
  const trimmedPlayableMask = trimMatrixOnEachSide(level.getPlayableAreaMask());
  if (matricesAreEqual(wallBitmap, trimmedPlayableMaskToWallBitmap(trimmedPlayableMask))) {
    return ALT_SEPARATOR + bitmapToCompressedString(trimmedPlayableMask);
  } else {
    return SEPARATOR + bitmapToCompressedString(wallBitmap);
  }
}

function getCodePartForGoals(level: Level): string {
  const goalBitmap = getBitmapByTileType(level, LevelTileEnum.GOAL);
  if (!level.isInitialPlayerAtNoPlayerCoordinates()) {
    const playableAreaMask = level.getPlayableAreaMask();
    if (canMaskBeUsedOnBitmap(goalBitmap, playableAreaMask)) {
      return ALT_SEPARATOR + bitmapToCompressedString(goalBitmap, playableAreaMask);
    }
  }
  return SEPARATOR + bitmapToCompressedString(goalBitmap, getWallMask(level));
}

function getCodePartForBoxes(level: Level): string {
  const boxBitmap = getBitmapByTileType(level, LevelTileEnum.BOX);
  if (!level.isInitialPlayerAtNoPlayerCoordinates()) {
    const viableBoxMask = level.getViableBoxMask();
    if (canMaskBeUsedOnBitmap(boxBitmap, viableBoxMask)) {
      return ALT_SEPARATOR + bitmapToCompressedString(boxBitmap, viableBoxMask);
    }
  }
  return SEPARATOR + bitmapToCompressedString(boxBitmap, getWallMask(level));
}

function getWallMask(level: Level): boolean[][] {
  return getInvertedBitmap(getBitmapByTileType(level, LevelTileEnum.WALL));
}

function getBitmapByTileType(level: Level, tileType: LevelTileEnum): boolean[][] {
  switch (tileType) {
    case LevelTileEnum.WALL:
    case LevelTileEnum.GOAL:
      return getMatrixWithConditionalFill(level.lenX, level.lenY, (x, y) =>
          level.levelTiles[x][y] == tileType
      );
    case LevelTileEnum.BOX: {
      const ret = getMatrixOfSize(level.lenX, level.lenY, false);
      for (const box of level.initialBoxes) {
        ret[box.x][box.y] = true;
      }
      return ret;
    }
    default:
      throw new Error("Bitmap encoding not supported for tile type: " + tileType);
  }
}

function bitmapToCompressedString(bitmap: boolean[][], mask: boolean[][] = []): string {
  const binaryString = bitmapToBinaryString(bitmap, mask);
  const stringToEncode = bitFillBinaryString(binaryString, BASE64_BITS);
  return compressBase64String(binaryStringToBase64String(stringToEncode));
}

function bitFillBinaryString(binaryString: string, bits: number) {
  if (binaryString.length == 0) {
    return binaryString;
  }
  const lastBit = binaryString.at(-1);
  if (lastBit === undefined) {
    throw new Error("Could not bit fill a binary string");
  }
  return binaryString + lastBit.repeat((bits - binaryString.length % bits) % bits);
}