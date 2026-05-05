import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { TodoTag } from "../../types/todo";
import { Box, Input } from "@mui/joy";
import { TAG_COLORS } from "../../constants/tags";
import { Tag } from "./Tag";
import { ColorPicker } from "./ColorPicker";
import { SectionCard } from "../Shared/SectionCard";

type Props = {
  tags: TodoTag[];
  updateTags: (tags: TodoTag[]) => void;
  showNotification: (message: string) => void;
  onDeleteTag: (id: string) => void;
};

export const TagsCard: React.FC<Props> = ({ tags, updateTags, showNotification, onDeleteTag }) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [showForm, setShowForm] = useState(false);
  const usedTagColors = useMemo(() => new Set(tags.map((tag) => tag.color)), [tags]);
  const firstAvailableColor = TAG_COLORS.find((color) => !usedTagColors.has(color));

  useEffect(() => {
    if (!firstAvailableColor) return;
    if (!selectedColor || usedTagColors.has(selectedColor)) {
      setSelectedColor(firstAvailableColor);
    }
  }, [firstAvailableColor, selectedColor, usedTagColors]);

  const handleAddClick = () => setShowForm((prev) => !prev);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    if (!firstAvailableColor) return;

    const trimmedName = name.trim().replace(/\s+/g, " ");
    if (!trimmedName) return;

    const existingTag = tags.find((tag) => tag.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase());

    if (existingTag) {
      showNotification(`"${existingTag.name}" tag already exists.`);
      return;
    }

    if (tags.some((tag) => tag.color === selectedColor)) {
      showNotification("That tag color is already used.");
      return false;
    }

    const newTags = [
      ...tags,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        color: selectedColor,
      },
    ];
    await updateTags(newTags);

    setName("");
    setSelectedColor(firstAvailableColor);
    setShowForm(false);
  }

  const updateTag = async (tag: TodoTag) => {
    const newTags = tags.map((x) => (x.id === tag.id ? tag : x));
    await updateTags(newTags);
  };

  return (
    <SectionCard title="Tags" onActionButtonClick={handleAddClick} collapsed>
      {showForm && (
        <Box>
          <form className="tag-form" onSubmit={handleSubmit}>
            <Input placeholder="tag name" value={name} onChange={(event) => setName(event.target.value)} />

            <ColorPicker selectedColor={selectedColor} onClick={setSelectedColor} usedColors={usedTagColors} />
          </form>
        </Box>
      )}

      {tags.length === 0 && <Box>Create tags to color your tasks.</Box>}

      <Box display="flex" gap={1} flexWrap="wrap">
        {tags.map((tag) => {
          const colorsUsedByOtherTags = new Set(
            tags.filter((currentTag) => currentTag.id !== tag.id).map((currentTag) => currentTag.color),
          );

          return (
            <Tag
              key={tag.id}
              tag={tag}
              usedColors={colorsUsedByOtherTags}
              updateTag={updateTag}
              onDelete={onDeleteTag}
            />
          );
        })}
      </Box>
    </SectionCard>
  );
};
