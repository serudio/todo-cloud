import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./muiClassNameSetup";
import { CssVarsProvider } from "@mui/joy/styles";
import { ErrorBoundary } from "./components/AppState/ErrorBoundary";
import App from "./App";
import "./styles.css";
import { CssBaseline } from "@mui/joy";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssVarsProvider>
      <CssBaseline />

      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </CssVarsProvider>
  </StrictMode>,
);
