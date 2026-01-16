interface Props {
  text: string,
  checked: boolean,
  onChange: () => void
}

export default function Checkbox({text, checked, onChange}: Readonly<Props>) {
  return (
      <label className="select-none"><input
          className="mr-1"
          type="checkbox"
          checked={checked}
          onChange={onChange}/>
        {text}
      </label>
  );
}