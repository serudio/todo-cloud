import { Box, Button, Card, FormControlLabel, Switch, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { TodoTag } from "../types/todo";
import { SECTIONS, type SectionKey, type SectionSettings } from "../hooks/settings";
import { navigate, todosPath } from "../hooks/route";
import { TagsCard } from "./Tags/TagsCard";

type Props = {
  sections: SectionSettings;
  onToggleSection: (key: SectionKey) => void;
  tags: TodoTag[];
  updateTags: (tags: TodoTag[]) => void;
  onDeleteTag: (id: string) => void;
  setNotification: (message: string) => void;
};

export const SettingsPage: React.FC<Props> = ({
  sections,
  onToggleSection,
  tags,
  updateTags,
  onDeleteTag,
  setNotification,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button onClick={() => navigate(todosPath)} color="secondary" sx={{ minWidth: 0 }} aria-label="Back to tasks">
          <ArrowBackIcon />
        </Button>
        <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
          Settings
        </Typography>
      </Box>

      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Sections
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Hide the panels you do not use. This is kept on this device.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {SECTIONS.map((section) => (
            <FormControlLabel
              key={section.key}
              control={<Switch checked={sections[section.key]} onChange={() => onToggleSection(section.key)} />}
              label={
                <Box>
                  <Typography variant="body2">{section.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.description}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "center", py: 0.5, ml: 0 }}
            />
          ))}
        </Box>
      </Card>

      {/* Tags live here rather than in the left panel: they are set up once and
          then used from a task's own actions. */}
      <TagsCard
        tags={tags}
        updateTags={updateTags}
        setNotification={setNotification}
        search=""
        onDeleteTag={onDeleteTag}
      />
    </Box>
  );
};
