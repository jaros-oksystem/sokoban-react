export function reverseString(str: string): string {
  return [...str].reverse().join('');
}

export function chunkString(str: string, len: number): string[] {
  const ret: string[] = [];
  for (let i = 0; i < str.length; i+=len) {
    ret.push(str.substring(i, i+len));
  }
  return ret;
}

export function splitStringToRepeatingGroups(str: string): string[] {
  if (str.length < 2) {
    return [str];
  }
  const ret: string[] = [];
  let groupStart = 0;
  for (let groupEnd = 0; groupEnd < str.length+1; groupEnd++) {
    if (groupEnd == str.length || str.charAt(groupStart) != str.charAt(groupEnd)) {
      ret.push(str.substring(groupStart, groupEnd));
      groupStart = groupEnd;
    }
  }
  return ret;
}

export function isStringAPositiveInteger(str: string): boolean {
  return /^\d*[1-9]\d*$/.test(str);
}

export function getStringWithChangedCharAt(str: string, newChar: string, index: number): string {
  return str.substring(0, index) + newChar + str.substring(index + 1);
}
