import React from "react";

interface Props {
  expanded: boolean,
  onExpand: () => void
}

export default function ExpandButton({expanded, onExpand}: Readonly<Props>) {
  return (
      <button className={"px-2.5 pt-1 pb-2 text-xl rounded hover:bg-black/20"} onClick={onExpand}>
        {expanded ? "\u2B9D" : "\u2B9F"}
      </button>
  );
}