import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { TodoTag } from "../types/todo";
import { SECTIONS, type SectionKey, type SectionSettings } from "../hooks/settings";
import { useIsMobile } from "../hooks/mobile";
import { TagsCard } from "./Tags/TagsCard";

type Props = {
  open: boolean;
  onClose: () => void;
  sections: SectionSettings;
  onToggleSection: (key: SectionKey) => void;
  tags: TodoTag[];
  updateTags: (tags: TodoTag[]) => void;
  onDeleteTag: (id: string) => void;
  setNotification: (message: string) => void;
};

// Settings sit over the cloud rather than replacing it: everything in here
// changes what that page looks like, so you want to see the change land.
export const SettingsDialog: React.FC<Props> = ({
  open,
  onClose,
  sections,
  onToggleSection,
  tags,
  updateTags,
  onDeleteTag,
  setNotification,
}) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
        {/* A span: DialogTitle is already the heading, and an <h6> inside its
            <h2> is invalid HTML that React warns about. */}
        <Typography
          component="span"
          variant="subtitle2"
          sx={{ flexGrow: 1, textTransform: "uppercase", letterSpacing: 2 }}
        >
          Settings
        </Typography>
        <IconButton onClick={onClose} aria-label="Close settings" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
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
        </Box>

        {/* Tags live here rather than in the left panel: they are set up once and
            then used from a task's own actions. */}
        <TagsCard
          tags={tags}
          updateTags={updateTags}
          setNotification={setNotification}
          search=""
          onDeleteTag={onDeleteTag}
        />
      </DialogContent>
    </Dialog>
  );
};
