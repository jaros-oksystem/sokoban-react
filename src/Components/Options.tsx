import {
  getOptionsFromLocalStorage,
  OptionInterface,
  saveOptionsToLocalStorage
} from "@/src/Util/LocalStorage/OptionStorageUtils";
import {useState} from "react";
import Checkbox from "@/src/Components/BasicComponents/Checkbox";

export default function Options() {
  const [options, setOptions] = useState<OptionInterface>(getOptionsFromLocalStorage());

  function handleOnChangeGrid() {
    const newOptions = structuredClone(options);
    newOptions.grid = !newOptions.grid;
    saveOptionsToLocalStorage(newOptions);
    setOptions(newOptions);
  }

  function handleOnChangeTextGraphics() {
    const newOptions = structuredClone(options);
    newOptions.textGraphics = !newOptions.textGraphics;
    saveOptionsToLocalStorage(newOptions);
    setOptions(newOptions);
  }

  return (
      <div>
        <div className="flex flex-row border-black border-2 w-50 p-2 mx-auto rounded-[10] bg-gray-100">
          <div className="pl-2 w-42">
            <p className="text-2xl mb-1">Appearance</p>
            <Checkbox text={"Show grid"} checked={options.grid} onChange={handleOnChangeGrid} />
            <br/>
            <Checkbox text={"Text based graphics"} checked={options.textGraphics} onChange={handleOnChangeTextGraphics} />
          </div>
        </div>
      </div>
  );
}