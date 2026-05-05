import { Card } from "@mui/material";
import { SectionHeader } from "./SectionHeader";
import { useState } from "react";

type Props = React.ComponentProps<typeof Card> & {
  title: string;
  onActionButtonClick?: () => void;
  children: React.ReactNode;
  collapsed?: boolean;
};

export const SectionCard: React.FC<Props> = ({ title, onActionButtonClick, children, collapsed, sx, ...cardProps }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const handleClick = () => setIsCollapsed((prev) => !prev);

  return (
    <Card {...cardProps} sx={{ p: 1, ...sx }}>
      <SectionHeader title={title} onClick={handleClick} onActionButtonClick={onActionButtonClick} />
      {!isCollapsed && children}
    </Card>
  );
};
