import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type ThemeMode, useThemeMode } from "../../theme";

export const ThemeSelector: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      color="warning"
      value={mode}
      onChange={(_e, value) => {
        if (!value) return;
        setMode(value as ThemeMode);
      }}
    >
      <ToggleButton value="light">Light</ToggleButton>
      <ToggleButton value="system">System</ToggleButton>
      <ToggleButton value="dark">Dark</ToggleButton>
    </ToggleButtonGroup>
  );
};
