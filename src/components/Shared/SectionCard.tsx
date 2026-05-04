import { Card } from "@mui/joy";
import { SectionHeader } from "./SectionHeader";
import { useState } from "react";

type Props = React.ComponentProps<typeof Card> & {
  title: string;
  onActionButtonClick?: () => void;
  children: React.ReactNode;
  collapsed?: boolean;
};

export const SectionCard: React.FC<Props> = ({
  title,
  onActionButtonClick,
  children,
  collapsed,
  ...cardProps
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const handleClick = () => setIsCollapsed((prev) => !prev);

  return (
    <Card size="sm" {...cardProps}>
      <SectionHeader
        title={title}
        onClick={handleClick}
        onActionButtonClick={onActionButtonClick}
      />
      {!isCollapsed && children}
    </Card>
  );
};
