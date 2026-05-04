import { Button, ToggleButtonGroup } from "@mui/joy";
import { useColorScheme } from "@mui/joy/styles";
type ThemeMode = "light" | "dark" | "system";

export const ThemeSelector: React.FC = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <ToggleButtonGroup
      size="sm"
      color="warning"
      value={mode}
      onChange={(_e, value) => {
        setMode(value as ThemeMode);
      }}
    >
      <Button value="light">Light</Button>
      <Button value="system">System</Button>
      <Button value="dark">Dark</Button>
    </ToggleButtonGroup>
  );
};
