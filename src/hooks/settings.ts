import { useCallback, useState } from "react";
import { SECTION_SETTINGS_STORAGE_KEY } from "../constants/ui";

export type SectionKey = "links" | "productiveWeek" | "notNow" | "notes" | "done" | "deleted";

// The order here is the order they appear in settings.
export const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
  { key: "links", label: "Links", description: "Quick links, in the left panel" },
  { key: "productiveWeek", label: "Productive Week", description: "The pile of tasks waiting for a push" },
  { key: "notNow", label: "Not Now", description: "Tasks set aside until the end of the month" },
  { key: "notes", label: "Notes", description: "A scratch pad in the left panel" },
  { key: "done", label: "Done", description: "Finished tasks, in the right panel" },
  { key: "deleted", label: "Deleted", description: "Recently deleted tasks, in the right panel" },
];

export type SectionSettings = Record<SectionKey, boolean>;

const ALL_SHOWN = Object.fromEntries(SECTIONS.map((section) => [section.key, true])) as SectionSettings;

// A section is shown unless it has been explicitly turned off, so a key added in a
// later version appears for everyone rather than hiding until they go looking.
function readSectionSettings(): SectionSettings {
  try {
    const stored = window.localStorage.getItem(SECTION_SETTINGS_STORAGE_KEY);
    if (!stored) return ALL_SHOWN;

    const parsed = JSON.parse(stored) as Record<string, unknown>;

    return Object.fromEntries(
      SECTIONS.map((section) => [section.key, parsed[section.key] !== false]),
    ) as SectionSettings;
  } catch {
    return ALL_SHOWN;
  }
}

export function useSectionSettings() {
  const [sections, setSections] = useState<SectionSettings>(readSectionSettings);

  const toggleSection = useCallback((key: SectionKey) => {
    setSections((currentSections) => {
      const newSections = { ...currentSections, [key]: !currentSections[key] };

      window.localStorage.setItem(SECTION_SETTINGS_STORAGE_KEY, JSON.stringify(newSections));

      return newSections;
    });
  }, []);

  return { sections, toggleSection };
}
