import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./muiClassNameSetup";
import { ErrorBoundary } from "./components/AppState/ErrorBoundary";
import App from "./App";
import { AppThemeProvider } from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppThemeProvider>
  </StrictMode>,
);
