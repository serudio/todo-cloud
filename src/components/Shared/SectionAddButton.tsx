import type { MouseEvent } from "react";
import "./SectionAddButton.css";

type SectionAddButtonProps = {
  onClick: () => void;
};

export function SectionAddButton({ onClick }: SectionAddButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick();
  }

  return (
    <button className="section-add-button" type="button" onClick={handleClick}>
      +
    </button>
  );
}
