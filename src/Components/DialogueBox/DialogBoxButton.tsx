import React, {ReactNode} from "react";
import BlueButton from "@/src/Components/BasicComponents/BlueButton";

interface Props {
  buttonText: string,
  title: string,
  content: ReactNode,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  onOpen?: () => void
}

export default function DialogBoxButton({buttonText, title, content, isOpen, setIsOpen, onOpen = () => {}}: Readonly<Props>) {

  function handleOnClick(open: boolean) {
    if (open) {
      onOpen();
    }
    setIsOpen(open);
  }

  return (
      <>
        <BlueButton onClick={() => handleOnClick(true)} text={buttonText} />
        {isOpen &&
          <>
            <div aria-hidden={true}
                 className="fixed top-0 left-0 w-screen h-screen bg-black/40"
                 onClick={() => handleOnClick(false)}>
            </div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col bg-white rounded">
              <div className="bg-blue-200 rounded-t">
                <button className="float-right px-2.5 m-2 pt-1 pb-2 text-xl rounded hover:bg-blue-300"
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