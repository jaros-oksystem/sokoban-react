import {useState} from "react";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";

interface Props {
  textToCopy: string,
  text?: string
}

const copyEmoji = "\ud83d\udccb";

export default function CopyButton({textToCopy, text = copyEmoji + " Copy to clipboard"}: Readonly<Props>) {
  const [buttonText, setButtonText] = useState<string>(text);

  function handleClick() {
    navigator.clipboard.writeText(textToCopy).then(() => {});
    setButtonText(copyEmoji + " Copied!");
    setTimeout(() => setButtonText(text), 2000);
  }

  return (
      <ColoredButton content={buttonText} onClick={handleClick} />
  );
}