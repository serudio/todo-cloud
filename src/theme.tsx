import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export type ThemeMode = "light" | "dark" | "system";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const THEME_MODE_STORAGE_KEY = "todo-cloud:theme-mode";
const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);

    return savedMode === "light" || savedMode === "dark" || savedMode === "system" ? savedMode : "system";
  });

  useEffect(() => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  }, [mode]);

  const resolvedMode = mode === "system" ? (prefersDarkMode ? "dark" : "light") : mode;
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
        },
      }),
    [resolvedMode],
  );
  const contextValue = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error("useThemeMode must be used within AppThemeProvider.");
  }

  return value;
}
