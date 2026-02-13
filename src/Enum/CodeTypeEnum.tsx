export enum CodeTypeEnum {
  CSB_CODE,
  XSB_CODE
}

export function codeEnumToString(codeEnum: CodeTypeEnum) {
  switch (codeEnum) {
    case CodeTypeEnum.CSB_CODE: return "CSB code";
    case CodeTypeEnum.XSB_CODE: return "XSB code";
  }
}