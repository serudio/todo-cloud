import { type CSSProperties, useEffect, useState } from "react";
import type { TodoTag } from "../../types/todo";
import "./TagPicker.css";

type TagPickerProps = {
  selectedTagId: string | null;
  tags: TodoTag[];
  onAssignTag: (tagId: string | null) => void;
};

function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
      <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h5.2c.4 0 .8.2 1.1.4l5.8 5.8a1.5 1.5 0 0 1 0 2.1l-5.3 5.3a1.5 1.5 0 0 1-2.1 0l-5.8-5.8A1.5 1.5 0 0 1 3 9.7V4.5Zm3.2 2.7a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" />
    </svg>
  );
}

export function TagPicker({
  selectedTagId,
  tags,
  onAssignTag,
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTag = tags.find((tag) => tag.id === selectedTagId);

  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentPointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(".tag-picker-menu")
      ) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [isOpen]);

  function assignTag(tagId: string | null) {
    onAssignTag(tagId);
    setIsOpen(false);
  }

  return (
    <span className="tag-picker-menu">
      <button
        aria-expanded={isOpen}
        className={`tag-color-trigger${!selectedTag ? " tag-color-clear" : ""}`}
        style={
          {
            "--tag-option-color": selectedTag?.color,
          } as CSSProperties
        }
        type="button"
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
      >
        {selectedTag ? <span /> : <TagIcon />}
      </button>
      {isOpen ? (
        <span className="tag-picker-dropdown">
          <button
            aria-selected={!selectedTagId}
            type="button"
            onClick={() => assignTag(null)}
          >
            <span className="tag-picker-color tag-color-clear">
              <TagIcon />
            </span>
            <span>No tag</span>
          </button>
          {tags.map((tag) => (
            <button
              aria-selected={selectedTagId === tag.id}
              key={tag.id}
              type="button"
              onClick={() => assignTag(tag.id)}
            >
              <span
                className="tag-picker-color"
                style={
                  {
                    "--tag-option-color": tag.color,
                  } as CSSProperties
                }
              />
              <span>{tag.name}</span>
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}
