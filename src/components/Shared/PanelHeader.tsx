import type { MouseEventHandler, ReactNode } from "react";
import "./PanelHeader.css";

type PanelHeaderProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLParagraphElement>;
};

export function PanelHeader({ children, onClick }: PanelHeaderProps) {
  return (
    <p
      className={`panel-header${onClick ? " panel-header-clickable" : ""}`}
      onClick={onClick}
    >
      {children}
    </p>
  );
}
