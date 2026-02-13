import Level from "@/src/Classes/Level";
import {base64StringToBinaryString, base64ToDecimal} from "@/src/Util/Codes/BaseConversionUtils";
import {
  ALT_SEPARATOR,
  binaryStringToBitmap,
  bitmapToCoordinates,
  decompressBase64String, getInvertedBitmap,
  SEPARATOR,
  tileIdToCoordinates,
  trimmedPlayableMaskToWallBitmap
} from "@/src/Util/Codes/GeneralCsbUtils";
import {getMatrixOfSize, getMatrixWithConditionalFill} from "@/src/Util/MatrixUtils";
import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";
import GridCoordinates from "@/src/Classes/GridCoordinates";

const INVALID_CODE_MESSAGE = "Invalid code";

export default function getLevelFromCsbCode(csbCode: string): Level {
  const codeParts = csbCode.replaceAll(ALT_SEPARATOR, SEPARATOR).split(SEPARATOR);
  if (codeParts.length != 6) {
    throw new Error(INVALID_CODE_MESSAGE);
  }
  const isAltSeparatorAt: boolean[] = csbCode.split('')
      .filter(c => c == ALT_SEPARATOR || c == SEPARATOR)
      .map(s => s == ALT_SEPARATOR)
      .reduce((list: boolean[], isAltSeparator: boolean) => [...list , isAltSeparator], []);
  try {
    const lenX = base64ToDecimal(codeParts[0]);
    const lenY = base64ToDecimal(codeParts[1]);
    const playerCoordinates = codeParts[2].length == 0 ? new GridCoordinates(-1,-1) :
        tileIdToCoordinates(base64ToDecimal(codeParts[2]), lenY);

    const wallBitmap = isAltSeparatorAt[2] ?
        trimmedPlayableMaskToWallBitmap(getBitmapFromCompressedString(codeParts[3], lenX-2, lenY-2)) :
        getBitmapFromCompressedString(codeParts[3], lenX, lenY);
    const level = new Level(lenX, lenY, getLevelTilesFromBitmaps(wallBitmap, getMatrixOfSize(lenX, lenY, false)), [], playerCoordinates);
    const wallMask = getInvertedBitmap(wallBitmap);

    const goalBitmap = getBitmapFromCompressedString(codeParts[4], lenX, lenY,
        isAltSeparatorAt[3] ? level.getPlayableAreaMask() : wallMask);
    level.levelTiles = getLevelTilesFromBitmaps(wallBitmap, goalBitmap);

    const boxBitmap = getBitmapFromCompressedString(codeParts[5], lenX, lenY,
        isAltSeparatorAt[4] ? level.getViableBoxMask() : wallMask);
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