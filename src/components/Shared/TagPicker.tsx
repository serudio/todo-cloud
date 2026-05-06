import { useState, type MouseEvent } from "react";
import type { TodoTag } from "../../types/todo";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { IconButton, Popover, List, ListItemButton, ListItemText, Box } from "@mui/material";

type TagPickerProps = {
  selectedTagId: string | null;
  tags: TodoTag[];
  onTagSelect: (tagId: string | null) => void;
};

export const TagPicker: React.FC<TagPickerProps> = ({ selectedTagId, tags, onTagSelect }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  function handleTagSelect(tagId: string | null) {
    onTagSelect(tagId);
    handleClose();
  }

  return (
    <>
      <IconButton onClick={handleClick} sx={{ padding: 0 }}>
        {selectedTagId ? (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: tags.find((tag) => tag.id === selectedTagId)?.color,
            }}
          />
        ) : (
          <LocalOfferIcon fontSize="small" />
        )}
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List disablePadding component="div">
          <ListItemButton sx={{ padding: "0 16px" }} onClick={() => handleTagSelect(null)} selected={!selectedTagId}>
            <ListItemText primary="No tag" />
          </ListItemButton>
          {tags.map((tag) => (
            <ListItemButton
              selected={selectedTagId === tag.id}
              key={tag.id}
              onClick={() => handleTagSelect(tag.id)}
              sx={{ padding: "0 16px" }}
            >
              <Box
                sx={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: tag.color, marginRight: 1 }}
              ></Box>
              <ListItemText primary={tag.name} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};
