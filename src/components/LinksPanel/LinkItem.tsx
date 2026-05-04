import { useState, type KeyboardEvent } from "react";
import type { CustomLink } from "../../types/todo";
import { Box, Button, IconButton, Input, Link as JoyLink } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";

type Props = {
  link: CustomLink;
  onDelete: (id: string) => void;
  onSubmit: (link: CustomLink) => void;
};
export const LinkItem: React.FC<Props> = ({ link, onDelete, onSubmit }) => {
  const [edit, setEdit] = useState(false);
  const [editName, setEditName] = useState(link.name);
  const [editUrl, setEditUrl] = useState(link.url);

  const handelEditClick = () => {
    setEditName(link.name);
    setEditUrl(link.url);
    setEdit(true);
  };

  const handleSubmit = () => {
    onSubmit({ ...link, name: editName, url: editUrl });
    setEdit(false);
  };

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setEdit(false);
    }
  }

  return (
    <Box
      key={link.id}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {edit && (
        <form onSubmit={handleSubmit}>
          <Input
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            onKeyDown={handleEditKeyDown}
          />
          <Input
            value={editUrl}
            onChange={(event) => setEditUrl(event.target.value)}
            onKeyDown={handleEditKeyDown}
          />
          <div className="link-edit-actions">
            <Button type="submit">Save</Button>
            <Button type="button" onClick={() => setEdit(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {!edit && (
        <>
          <JoyLink
            to={link.url}
            target="_blank"
            rel="noreferrer"
            sx={{
              color: "rgb(208, 173, 240)",
              fontWeight: "500",
            }}
          >
            {link.name}
          </JoyLink>
          <Box display="inline-flex">
            <IconButton
              size="sm"
              onClick={handelEditClick}
              sx={{ width: 22, height: 22, minWidth: 0, minHeight: 0 }}
            >
              <EditIcon fontSize="sm" />
            </IconButton>

            <IconButton
              size="sm"
              onClick={() => onDelete(link.id)}
              sx={{ width: 22, height: 22, minWidth: 0, minHeight: 0 }}
            >
              <ClearIcon fontSize="sm" />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};
