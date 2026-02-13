import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import React, {useState} from "react";
import Image from "next/image";
import trashIcon from "@/src/Svg/Icon/trash.svg";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {ColorEnum} from "@/src/Enum/ColorEnum";

interface Props {
  title: string,
  onDelete: () => void
}

export default function DeleteDialogueButton({title, onDelete}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function handleOnDelete() {
    setIsOpen(false);
    onDelete();
  }

  return (
      <DialogBoxButton isOpen={isOpen} setIsOpen={setIsOpen} title={title} color={ColorEnum.RED} buttonContent={
        <div className="flex flex-row items-center">
          <Image draggable="false" src={trashIcon} alt="Delete" height={13} className="mr-2"/>
          <p>Delete</p>
        </div>
      } content={
        <div className="flex justify-center">
          <ColoredButton content={"\u2713 Yes"} color={ColorEnum.GREEN} onClick={handleOnDelete} />
          <div className="mx-5"></div>
          <ColoredButton content={"\u2573 No"} color={ColorEnum.RED} onClick={() => setIsOpen(false)} />
        </div>
      }/>
  );

}