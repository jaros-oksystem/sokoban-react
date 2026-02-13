import {chunkString, reverseString} from "@/src/Util/StringUtils";

export const BASE64_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ*.";
export const BASE64_LEN = BASE64_CHARS.length;
export const BASE64_BITS = 6;
export const BASE64_ONES_CHAR = BASE64_CHARS[0];
export const BASE64_ZEROS_CHAR = BASE64_CHARS[BASE64_LEN-1];

export function decimalToBase64(num: number): string {
  if (num == 0) {
    return "0";
  }
  let ret = "";
  while (num > 0) {
    ret += BASE64_CHARS[num % BASE64_LEN];
    num = Math.floor(num / BASE64_LEN);
  }
  return reverseString(ret);
}

export function base64ToDecimal(num: string): number {
  let ret = 0;
  let multiplier = 1;
  const digits = reverseString(num);
  for (let i = 0; i < digits.length; i++) {
    const curDigitIdx = BASE64_CHARS.indexOf(digits[i]);
    if (curDigitIdx == -1) {
      throw new Error("Input is not in base64: " + num + ", at: " + num[i] + ", " + i);
    }
    ret += multiplier * curDigitIdx;
    multiplier *= BASE64_LEN;
  }
  return ret;
}

export function base64ToBinary(num: string): string {
  return base64ToDecimal(num).toString(2);
}

export function binaryToBase64(num: string): string {
  return decimalToBase64(Number.parseInt(num, 2));
}

export function binaryStringToBase64String(str: string): string {
  let ret = "";
  const strChunked = chunkString(str, BASE64_BITS);
  for (let i = 0; i < strChunked.length; i++) {
    ret += binaryToBase64(strChunked[i]);
  }
  return ret;
}

export function base64StringToBinaryString(str: string): string {
  let ret = "";
  const zeroPad = "0".repeat(BASE64_BITS);
  for (let i = 0; i < str.length; i++) {
    const binaryStr = base64ToBinary(str[i]);
    ret += (zeroPad+binaryStr).slice(-zeroPad.length);
  }
  return ret;
}