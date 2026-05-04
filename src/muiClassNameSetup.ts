import { unstable_ClassNameGenerator as JoyClassNameGenerator } from "@mui/joy/className";
import { unstable_ClassNameGenerator as MaterialClassNameGenerator } from "@mui/material/className";

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

if (import.meta.env.DEV && isLocalhost) {
  const keepMuiClassName = (componentName: string) => componentName;

  JoyClassNameGenerator.configure(keepMuiClassName);
  MaterialClassNameGenerator.configure(keepMuiClassName);
}
