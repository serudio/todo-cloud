import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type ThemeMode, useThemeMode } from "../../theme";
import SystemSecurityUpdateGoodIcon from "@mui/icons-material/SystemSecurityUpdateGood";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export const ThemeSelector: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      color="secondary"
      value={mode}
      onChange={(_e, value) => {
        if (!value) return;
        setMode(value as ThemeMode);
      }}
    >
      <ToggleButton value="light">
        <LightModeIcon />
      </ToggleButton>
      <ToggleButton value="system">
        <SystemSecurityUpdateGoodIcon />
      </ToggleButton>
      <ToggleButton value="dark">
        <DarkModeIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
