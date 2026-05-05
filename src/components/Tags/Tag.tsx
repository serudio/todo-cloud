import { Box, Chip, ChipDelete, Input } from "@mui/joy";
import type { TodoTag } from "../../types/todo";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { TAG_Z } from "../../constants/ui";

type Props = {
  tag: TodoTag;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => boolean;
  onUpdateColor: (id: string, color: string) => void;
  usedColors: Set<string>;
};
export const Tag: React.FC<Props> = ({
  tag,
  onDelete,
  onRename,
  onUpdateColor,
  usedColors,
}) => {
  const { id, name, color } = tag;
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
    if (onRename(id, editName)) {
      setEdit(false);
    }
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
    setShowColors((current) => !current);
  };

  const handleColorSelect = (nextColor: string) => {
    onUpdateColor(id, nextColor);
    setShowColors(false);
  };

  return (
    <Box ref={tagRef} display="inline-flex" position="relative">
      <Chip
        size="sm"
        sx={{ color }}
        endDecorator={<ChipDelete onClick={() => onDelete(tag.id)} />}
      >
        <Box display="flex">
          {edit ? (
            <Input
              slotProps={{ input: { ref: editInputRef } }}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleEditKeyDown}
              sx={{
                background: "transparent",
                border: 0,
                fontSize: "inherit",
                width: "auto",
                minHeight: 0,
              }}
            />
          ) : (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box
                sx={{
                  width: 15,
                  height: 15,
                  background: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                onClick={handleColorClick}
              />
              <Box onDoubleClick={handleEditClick}>{name}</Box>
            </Box>
          )}
        </Box>
      </Chip>
      {showColors ? (
        <Box
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: TAG_Z,
            width: 180,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "md",
            p: 1,
            bgcolor: "background.surface",
            boxShadow: "lg",
          }}
        >
          <ColorPicker
            selectedColor={color}
            usedColors={usedColors}
            onClick={handleColorSelect}
          />
        </Box>
      ) : null}
    </Box>
  );
};
