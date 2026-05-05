import { useState, type KeyboardEvent } from "react";
import type { CustomLink } from "../../types/todo";
import { Box, Button, IconButton, Input, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";

type Props = {
  link: CustomLink;
  updateLink: (link: CustomLink) => void;
  onDelete: (id: string) => void;
};
export const LinkItem: React.FC<Props> = ({ link, updateLink, onDelete }) => {
  const [edit, setEdit] = useState(false);
  const [editName, setEditName] = useState(link.name);
  const [editUrl, setEditUrl] = useState(link.url);

  const handelEditClick = () => {
    setEditName(link.name);
    setEditUrl(link.url);
    setEdit(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = editName.trim().replace(/\s+/g, " ");
    const trimmedUrl = editUrl.trim();
    updateLink({ ...link, name: trimmedName, url: trimmedUrl });
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
          <Input value={editName} onChange={(event) => setEditName(event.target.value)} onKeyDown={handleEditKeyDown} />
          <Input value={editUrl} onChange={(event) => setEditUrl(event.target.value)} onKeyDown={handleEditKeyDown} />
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
          <Link
            href={link.url}
            target="_blank"
            rel="noreferrer"
            sx={{
              color: "rgb(208, 173, 240)",
              fontWeight: 500,
            }}
          >
            {link.name}
          </Link>
          <Box sx={{ display: "inline-flex" }}>
            <IconButton size="small" onClick={handelEditClick} sx={{ width: 22, height: 22, minWidth: 0, minHeight: 0 }}>
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => onDelete(link.id)}
              sx={{ width: 22, height: 22, minWidth: 0, minHeight: 0 }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};
