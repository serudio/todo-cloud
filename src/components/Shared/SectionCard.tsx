import { Card } from "@mui/joy";
import { SectionHeader } from "./SectionHeader";
import { useState } from "react";

type Props = {
  title: string;
  onActionButtonClick: () => void;
  children: React.ReactNode;
  collapsed?: boolean;
};

export const SectionCard: React.FC<Props> = ({
  title,
  onActionButtonClick,
  children,
  collapsed,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const handleClick = () => setIsCollapsed((prev) => !prev);

  return (
    <Card size="sm">
      <SectionHeader
        title={title}
        onClick={handleClick}
        onActionButtonClick={onActionButtonClick}
      />
      {!isCollapsed && children}
    </Card>
  );
};
