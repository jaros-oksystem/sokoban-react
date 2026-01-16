import BlueButton from "@/src/Components/BasicComponents/BlueButton";
import {useState} from "react";

interface Props {
  textToCopy: string,
  text?: string
}

const copyEmoji = "\ud83d\udccb";

export default function CopyButton({textToCopy, text = copyEmoji + " Copy to clipboard"}: Readonly<Props>) {
  const [buttonText, setButtonText] = useState<string>(text);

  function handleClick() {
    navigator.clipboard.writeText(textToCopy);
    setButtonText(copyEmoji + " Copied!");
    setTimeout(() => setButtonText(text), 2000);
  }

  return (
      <BlueButton text={buttonText} onClick={handleClick} />
  );
}