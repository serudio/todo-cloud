import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./muiClassNameSetup";
import { CssVarsProvider } from "@mui/joy/styles";
import { createTheme, THEME_ID as MATERIAL_THEME_ID, ThemeProvider } from "@mui/material/styles";
import { ErrorBoundary } from "./components/AppState/ErrorBoundary";
import App from "./App";
import { CssBaseline } from "@mui/material";

const materialTheme = createTheme();
const scopedMaterialTheme = { [MATERIAL_THEME_ID]: materialTheme };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssVarsProvider>
      <CssBaseline />

      <ThemeProvider theme={scopedMaterialTheme}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </CssVarsProvider>
  </StrictMode>,
);
