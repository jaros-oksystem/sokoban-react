import React, {ReactNode} from "react";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {ColorEnum} from "@/src/Enum/ColorEnum";

interface Props {
  buttonContent: ReactNode,
  title: string,
  content: ReactNode,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  onOpen?: () => void,
  color?: ColorEnum,
}

export default function DialogBoxButton({buttonContent, title, content, isOpen, setIsOpen, onOpen = () => {}, color = ColorEnum.BLUE}: Readonly<Props>) {

  function handleOnClick(open: boolean) {
    if (open) {
      onOpen();
    }
    setIsOpen(open);
  }

  return (
      <>
        <ColoredButton onClick={() => handleOnClick(true)} content={buttonContent} color={color} />
        {isOpen &&
          <>
            <div aria-hidden={true}
                 className="fixed top-0 left-0 w-screen h-screen bg-black/40"
                 onClick={() => handleOnClick(false)}>
            </div>
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col bg-white rounded">
              <div className={"rounded-t " + getBackgroundColorClassName(color)}>
                <button className={"float-right px-2.5 m-2 pt-1 pb-2 text-xl rounded " + getButtonHoverColorClassName(color)}
                        onClick={() => handleOnClick(false)}>
                  {"\u2573"}
                </button>
                <p className="float-left m-3.5 text-xl">{title}</p>
              </div>
              <div className="p-4">
                {content}
              </div>
            </div>
          </>
        }
      </>
  );
};

function getBackgroundColorClassName(color: ColorEnum): string {
  switch (color) {
    case ColorEnum.BLUE: return "bg-blue-200 ";
    case ColorEnum.GREEN: return "bg-green-200 ";
    case ColorEnum.RED: return "bg-red-200 ";
    case ColorEnum.CYAN: return "bg-cyan-200 ";
  }
}

function getButtonHoverColorClassName(color: ColorEnum): string {
  switch (color) {
    case ColorEnum.BLUE: return "hover:bg-blue-300 ";
    case ColorEnum.GREEN: return "hover:bg-green-300 ";
    case ColorEnum.RED: return "hover:bg-red-300 ";
    case ColorEnum.CYAN: return "hover:bg-cyan-300 ";
  }
}