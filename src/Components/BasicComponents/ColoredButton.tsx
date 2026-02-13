import {ReactNode} from "react";
import {ColorEnum} from "@/src/Enum/ColorEnum";

interface Props {
  content?: ReactNode,
  onClick?: () => void,
  color?: ColorEnum,
  paddedText?: boolean,
}

export default function ColoredButton({content = "Button", onClick, color = ColorEnum.BLUE, paddedText = true}: Readonly<Props>) {
  const className =
      getBackgroundColorClassName(color) +
      (paddedText ? "py-2 px-4 " : "") +
      "text-white font-bold rounded ";
  return (
      <button
          className={className}
          onClick={onClick}>
        {content}
      </button>
  );
}

function getBackgroundColorClassName(color: ColorEnum): string {
  switch (color) {
    case ColorEnum.BLUE: return "bg-blue-500 hover:bg-blue-700 ";
    case ColorEnum.GREEN: return "bg-green-500 hover:bg-green-700 ";
    case ColorEnum.RED: return "bg-red-500 hover:bg-red-700 ";
    case ColorEnum.CYAN: return "bg-cyan-500 hover:bg-cyan-700 ";
  }
}