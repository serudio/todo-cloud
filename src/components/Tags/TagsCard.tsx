import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { TodoTag } from "../../types/todo";
import { Box, Input } from "@mui/joy";
import { TAG_COLORS } from "../../constants/tags";
import { Tag } from "./Tag";
import { ColorPicker } from "./ColorPicker";
import { SectionCard } from "../Shared/SectionCard";

type Props = {
  tags: TodoTag[];
  onCreateTag: (name: string, color: string) => boolean;
  onDeleteTag: (id: string) => void;
  onRenameTag: (id: string, name: string) => boolean;
  onUpdateTagColor: (id: string, color: string) => void;
};

export const TagsCard: React.FC<Props> = ({
  tags,
  onCreateTag,
  onDeleteTag,
  onRenameTag,
  onUpdateTagColor,
}) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [showForm, setShowForm] = useState(false);
  const usedTagColors = useMemo(
    () => new Set(tags.map((tag) => tag.color)),
    [tags],
  );
  const firstAvailableColor = TAG_COLORS.find(
    (color) => !usedTagColors.has(color),
  );

  useEffect(() => {
    if (!firstAvailableColor) return;
    if (!selectedColor || usedTagColors.has(selectedColor)) {
      setSelectedColor(firstAvailableColor);
    }
  }, [firstAvailableColor, selectedColor, usedTagColors]);

  const handleAddClick = () => setShowForm((prev) => !prev);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    if (!firstAvailableColor) return;

    if (onCreateTag(name, selectedColor)) {
      setName("");
      setSelectedColor(firstAvailableColor);
      setShowForm(false);
    }
  }

  return (
    <SectionCard title="Tags" onActionButtonClick={handleAddClick} collapsed>
      {showForm && (
        <Box>
          <form className="tag-form" onSubmit={handleSubmit}>
            <Input
              placeholder="tag name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <ColorPicker
              selectedColor={selectedColor}
              onClick={setSelectedColor}
              usedColors={usedTagColors}
            />
          </form>
        </Box>
      )}

      {tags.length === 0 && <Box>Create tags to color your tasks.</Box>}

      <Box display="flex" gap={1} flexWrap="wrap">
        {tags.map((tag) => {
          const colorsUsedByOtherTags = new Set(
            tags
              .filter((currentTag) => currentTag.id !== tag.id)
              .map((currentTag) => currentTag.color),
          );

          return (
            <Tag
              key={tag.id}
              tag={tag}
              usedColors={colorsUsedByOtherTags}
              onDelete={onDeleteTag}
              onRename={onRenameTag}
              onUpdateColor={onUpdateTagColor}
            />
          );
        })}
      </Box>
    </SectionCard>
  );
};
