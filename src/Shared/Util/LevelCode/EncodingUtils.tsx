import {LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";
import Level from "@/src/Shared/Classes/Level";
import {
  getMatrixOfSize,
  getMatrixWithConditionalFill,
  matricesAreEqual,
  trimMatrixOnEachSide
} from "@/src/Shared/Util/MatrixUtils";
import {
  BASE64_BITS,
  binaryStringToBase64String,
  decimalToBase64
} from "@/src/Shared/Util/LevelCode/BaseConversionUtils";
import {
  ALT_SEPARATOR,
  bitmapToBinaryString,
  canMaskBeUsedOnBitmap,
  compressBase64String,
  coordinatesToTileId,
  SEPARATOR,
  trimmedPlayableMaskToWallBitmap
} from "@/src/Shared/Util/LevelCode/LevelCodeUtils";
import {getStringWithChangedCharAt} from "@/src/Shared/Util/StringUtils";

export default function getLevelCodeFromLevel(level: Level): string {
  const levelCode = createCode(level);
  const transLevelCode = createCode(level.getLevelTransposed());
  if (transLevelCode.length < levelCode.length) {
    return getStringWithChangedCharAt(transLevelCode, ALT_SEPARATOR, transLevelCode.indexOf(SEPARATOR));
  }
  return levelCode;
}

function createCode(level: Level): string {
  return decimalToBase64(level.lenX)
      + SEPARATOR + decimalToBase64(level.lenY)
      + SEPARATOR + decimalToBase64(coordinatesToTileId(level.initialPlayer, level.lenY))
      + getCodePartForWalls(level)
      + getCodePartForTileType(level, LevelTileEnum.GOAL, level.getPlayableAreaMask())
      + getCodePartForTileType(level, LevelTileEnum.BOX, level.getViableBoxMask());
}

function getCodePartForWalls(level: Level): string {
  const wallBitmap = getBitmapByTileType(level, LevelTileEnum.WALL);
  const trimmedPlayableMask = trimMatrixOnEachSide(level.getPlayableAreaMask());
  if (matricesAreEqual(wallBitmap, trimmedPlayableMaskToWallBitmap(trimmedPlayableMask))) {
    return ALT_SEPARATOR + bitmapToCompressedString(trimmedPlayableMask);
  } else {
    return getCodePartForTileType(level, LevelTileEnum.WALL);
  }
}

function getCodePartForTileType(level: Level, tileType: LevelTileEnum, mask: boolean[][] = []): string {
  const tileBitmap = getBitmapByTileType(level, tileType);
  if (mask.length != 0 && canMaskBeUsedOnBitmap(tileBitmap, mask)) {
    return ALT_SEPARATOR + bitmapToCompressedString(tileBitmap, mask);
  } else {
    return SEPARATOR + bitmapToCompressedString(tileBitmap);
  }
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
  return binaryString + binaryString[binaryString.length-1].repeat((bits - binaryString.length % bits) % bits);
}