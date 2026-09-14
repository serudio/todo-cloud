import { type FormEvent, useState } from "react";
import { Box, Button, IconButton, InputBase, Popover, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import { normalizeCustomLinkUrl } from "../../utils/todos";

type Props = {
  link: string | null;
  onChange: (link: string | null) => void;
  onOpen?: () => void;
};

export const TodoLinkButton: React.FC<Props> = ({ link, onChange, onOpen }) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [draftLink, setDraftLink] = useState(link ?? "");
  const isOpen = Boolean(anchorElement);

  const closePopover = () => setAnchorElement(null);

  const openEditor = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOpen?.();
    setDraftLink(link ?? "");
    setAnchorElement(event.currentTarget);
  };

  const saveLink = () => {
    const normalizedLink = normalizeCustomLinkUrl(draftLink);

    onChange(normalizedLink || null);
    setDraftLink(normalizedLink);
    closePopover();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveLink();
  };

  const handleRemove = () => {
    onChange(null);
    setDraftLink("");
    closePopover();
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          "&:hover .todo-link-edit": { opacity: 1, pointerEvents: "auto" },
        }}
      >
        <Tooltip title={link ? `Open ${link}` : "Add a link"}>
          {/* Once a link is set the button is the link itself, so a click goes
              straight to it and editing moves to the hover action. */}
          <IconButton
            aria-label={link ? `Open ${link}` : "Add a link"}
            color={link ? "warning" : "default"}
            size="small"
            {...(link
              ? { component: "a" as const, href: link, target: "_blank", rel: "noreferrer" }
              : { onClick: openEditor })}
            onPointerDown={(event) => event.stopPropagation()}
            sx={{
              bgcolor: link ? "warning.light" : undefined,
              "&:hover": { bgcolor: link ? "warning.main" : undefined },
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {link && (
          <Tooltip title="Edit link">
            <IconButton
              className="todo-link-edit"
              aria-label="Edit link"
              size="small"
              onClick={openEditor}
              onPointerDown={(event) => event.stopPropagation()}
              sx={{
                position: "absolute",
                top: -7,
                right: -9,
                width: 16,
                height: 16,
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 120ms",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <EditIcon sx={{ fontSize: 11 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Popover
        open={isOpen}
        anchorEl={anchorElement}
        onClose={closePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 1 }}>
          <InputBase
            autoFocus
            value={draftLink}
            placeholder="example.com"
            onChange={(event) => setDraftLink(event.target.value)}
            // Enter is handled here rather than left to the form's implicit submit,
            // which does not fire for an input inside the popover's portal.
            onKeyDown={(event) => {
              if (event.key === "Escape") closePopover();

              if (event.key === "Enter") {
                event.preventDefault();
                saveLink();
              }
            }}
            sx={{ width: 220, fontSize: "0.85rem", border: 1, borderColor: "divider", borderRadius: 1, px: 1 }}
          />

          <Button type="submit" size="small">
            save
          </Button>

          {link && (
            <Button size="small" color="error" onClick={handleRemove}>
              remove
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
};
