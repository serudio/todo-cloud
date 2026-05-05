import { Box, IconButton, Card, InputBase } from "@mui/material";
import type { TodoTag } from "../../types/todo";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { TAG_Z } from "../../constants/ui";
import ClearIcon from "@mui/icons-material/Clear";

type Props = {
  tag: TodoTag;
  updateTag: (tag: TodoTag) => void;
  onDelete: (id: string) => void;
  usedColors: Set<string>;
};
export const Tag: React.FC<Props> = ({ tag, updateTag, onDelete, usedColors }) => {
  const { name, color } = tag;
  const [edit, setEdit] = useState(false);
  const [editName, setEditName] = useState(name);
  const [showColors, setShowColors] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!edit) return;

    editInputRef.current?.focus();
  }, [edit]);

  useEffect(() => {
    if (!edit && !showColors) return;

    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (tagRef.current?.contains(event.target as Node)) return;

      setEditName(name);
      setEdit(false);
      setShowColors(false);
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [edit, name, showColors]);

  const handleEditClick = () => {
    setEditName(name);
    setShowColors(false);
    setEdit(true);
  };

  const handleEdit = () => {
    updateTag({ ...tag, name: editName });
    setEdit(false);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setEditName(name);
      setEdit(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleEdit();
    }
  };

  const handleColorClick = () => {
    setShowColors((prev) => !prev);
  };

  const handleColorSelect = (newColor: string) => {
    updateTag({ ...tag, color: newColor });
    setShowColors(false);
  };

  return (
    <Box
      ref={tagRef}
      sx={{
        display: "inline-flex",
        position: "relative",
        color,
        border: "1px solid black",
        borderRadius: 999,
        padding: "0 8px",
        fontSize: "0.85rem",
      }}
    >
      {edit && (
        <InputBase
          size="small"
          inputRef={editInputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleEditKeyDown}
          sx={{ color, lineHeight: 1, "& input": { padding: 0 } }}
        />
      )}
      {!edit && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box
            sx={{ width: 15, height: 15, background: color, borderRadius: "50%", cursor: "pointer" }}
            onClick={handleColorClick}
          />
          <Box onDoubleClick={handleEditClick}>{name}</Box>
          <IconButton onClick={() => onDelete(tag.id)} size="small" sx={{ padding: 0 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {showColors && (
        <Card sx={{ position: "absolute", top: "100%", zIndex: TAG_Z, p: 1 }}>
          <ColorPicker selectedColor={color} usedColors={usedColors} onClick={handleColorSelect} />
        </Card>
      )}
    </Box>
  );
};
