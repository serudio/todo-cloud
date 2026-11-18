import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import { Theme } from "@astryxdesign/core/theme";
import { defaultThemeSlug, themes } from "../../astryx-themes";
import { useThemeMode } from "../../theme";

/**
 * The Astryx theme around the Weekly page, the one page built with it so far.
 *
 * It follows the app's own light/dark/system setting from settings, so moving
 * between this page and the MUI ones never flips the colours. The stylesheets
 * are cascade-layered, so they sit under MUI's unlayered styles on the pages
 * that have not moved.
 */
export const WeeklyTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useThemeMode();

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={mode}>
      <div className="weekly-shell">{children}</div>
    </Theme>
  );
};
