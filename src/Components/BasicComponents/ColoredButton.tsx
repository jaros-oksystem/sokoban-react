import {ReactNode} from "react";
import {ColorEnum} from "@/src/Enum/ColorEnum";

interface Props {
  content?: ReactNode,
  onClick?: () => void,
  color?: ColorEnum,
  paddedText?: boolean,
  disabled?: boolean,
}

export default function ColoredButton({content = "Button", onClick, color = ColorEnum.BLUE, paddedText = true, disabled = false}: Readonly<Props>) {
  const className =
      getBackgroundColorClassName(color) +
      (paddedText ? "py-2 px-4 " : "") +
      (disabled ? "disabled " : "") +
      "text-white font-bold rounded ";
  return (
      <button
          className={className}
          onClick={onClick}
          disabled={disabled}>
        {content}
      </button>
  );
}

function getBackgroundColorClassName(color: ColorEnum): string {
  switch (color) {
    case ColorEnum.BLUE: return "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-800  ";
    case ColorEnum.GREEN: return "bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-green-800  ";
    case ColorEnum.RED: return "bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-800  ";
    case ColorEnum.CYAN: return "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 disabled:bg-cyan-800  ";
  }
}