import type { HTMLAttributes, ReactNode } from "react";
import "./Panel.css";

type PanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Panel({ children, className = "", ...props }: PanelProps) {
  return (
    <aside className={`panel ${className}`} {...props}>
      {children}
    </aside>
  );
}
