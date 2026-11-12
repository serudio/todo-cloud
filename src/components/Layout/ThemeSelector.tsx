import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type ThemeMode, useThemeMode } from "../../theme";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export const ThemeSelector: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode}
      onChange={(_e, value) => {
        if (!value) return;
        setMode(value as ThemeMode);
      }}
    >
      <ToggleButton value="light" aria-label="Light theme">
        <LightModeIcon fontSize="small" color={mode !== "light" ? "disabled" : "action"} />
      </ToggleButton>
      <ToggleButton value="system" aria-label="Follow the device theme">
        <SettingsBrightnessIcon fontSize="small" color={mode !== "system" ? "disabled" : "action"} />
      </ToggleButton>
      <ToggleButton value="dark" aria-label="Dark theme">
        <DarkModeIcon fontSize="small" color={mode !== "dark" ? "disabled" : "action"} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
