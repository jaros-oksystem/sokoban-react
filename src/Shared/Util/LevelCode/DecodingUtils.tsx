import Level from "@/src/Shared/Classes/Level";
import {base64StringToBinaryString, base64ToDecimal} from "@/src/Shared/Util/LevelCode/BaseConversionUtils";
import {
  ALT_SEPARATOR,
  binaryStringToBitmap,
  bitmapToCoordinates,
  decompressBase64String,
  SEPARATOR,
  tileIdToCoordinates,
  trimmedPlayableMaskToWallBitmap
} from "@/src/Shared/Util/LevelCode/LevelCodeUtils";
import {getMatrixOfSize, getMatrixWithConditionalFill} from "@/src/Shared/Util/MatrixUtils";
import {LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";

const INVALID_CODE_MESSAGE = "Invalid code";

export default function getLevelFromLevelCode(levelCode: string): Level {
  const codeParts = levelCode.replaceAll(ALT_SEPARATOR, SEPARATOR).split(SEPARATOR);
  if (codeParts.length != 6) {
    throw new Error(INVALID_CODE_MESSAGE);
  }
  const isAltSeparatorAt: boolean[] = levelCode.split("")
      .filter(c => c == ALT_SEPARATOR || c == SEPARATOR)
      .map(s => s == ALT_SEPARATOR)
      .reduce((list: boolean[], isAltSeparator: boolean) => [...list , isAltSeparator], []);
  try {
    const lenX = base64ToDecimal(codeParts[0]);
    const lenY = base64ToDecimal(codeParts[1]);
    const playerCoordinates = tileIdToCoordinates(base64ToDecimal(codeParts[2]), lenY);

    const wallBitmap = isAltSeparatorAt[2] ?
        trimmedPlayableMaskToWallBitmap(getBitmapFromCompressedString(codeParts[3], lenX-2, lenY-2)) :
        getBitmapFromCompressedString(codeParts[3], lenX, lenY);
    const level = new Level(lenX, lenY, getLevelTilesFromBitmaps(wallBitmap, getMatrixOfSize(lenX, lenY, false)), [], playerCoordinates);

    const goalBitmap = getBitmapFromCompressedString(codeParts[4], lenX, lenY,
        isAltSeparatorAt[3] ? level.getPlayableAreaMask() : []);
    level.levelTiles = getLevelTilesFromBitmaps(wallBitmap, goalBitmap);

    const boxBitmap = getBitmapFromCompressedString(codeParts[5], lenX, lenY,
        isAltSeparatorAt[4] ? level.getViableBoxMask() : []);
    level.initialBoxes = bitmapToCoordinates(boxBitmap);

    if (isAltSeparatorAt[0]) {
      return level.getLevelTransposed();
    }
    return level;
  } catch {
    throw new Error(INVALID_CODE_MESSAGE);
  }
}

function getBitmapFromCompressedString(base64CompressedString: string, lenX: number, lenY: number, mask: boolean[][] = []): boolean[][] {
  const binaryString = base64StringToBinaryString(decompressBase64String(base64CompressedString));
  return binaryStringToBitmap(binaryString, lenX, lenY, mask);
}

function getLevelTilesFromBitmaps(wallBitmap: boolean[][], goalBitmap: boolean[][]): LevelTileEnum[][] {
  return getMatrixWithConditionalFill(wallBitmap.length, wallBitmap[0].length, (x, y) =>
      wallBitmap[x][y] ? LevelTileEnum.WALL :
      goalBitmap[x][y] ? LevelTileEnum.GOAL :
      LevelTileEnum.EMPTY
  );
}