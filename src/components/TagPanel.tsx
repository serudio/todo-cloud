import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TodoTag } from "../types/todo";
import { Panel } from "./Shared/Panel";
import { PanelHeader } from "./Shared/PanelHeader";
import { SectionAddButton } from "./Shared/SectionAddButton";
import { useMobileCollapsedState } from "./Shared/useMobileCollapsedState";
import "./TagPanel.css";

type TagPanelProps = {
  colors: string[];
  tags: TodoTag[];
  onCreateTag: (name: string, color: string) => boolean;
  onDeleteTag: (id: string) => void;
  onRenameTag: (id: string, name: string) => boolean;
  onUpdateTagColor: (id: string, color: string) => void;
};

export function TagPanel({
  colors,
  tags,
  onCreateTag,
  onDeleteTag,
  onRenameTag,
  onUpdateTagColor,
}: TagPanelProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isCollapsed, setIsCollapsed] = useMobileCollapsedState();
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [colorPickerTagId, setColorPickerTagId] = useState<string | null>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);
  const usedTagColors = useMemo(
    () => new Set(tags.map((tag) => tag.color)),
    [tags],
  );
  const firstAvailableColor = colors.find((color) => !usedTagColors.has(color));

  useEffect(() => {
    if (!editingTagId) return;

    editingInputRef.current?.focus();
    editingInputRef.current?.select();
  }, [editingTagId]);

  useEffect(() => {
    if (!firstAvailableColor) return;
    if (!selectedColor || usedTagColors.has(selectedColor)) {
      setSelectedColor(firstAvailableColor);
    }
  }, [firstAvailableColor, selectedColor, usedTagColors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firstAvailableColor) return;

    if (onCreateTag(name, selectedColor)) {
      setName("");
      setSelectedColor(firstAvailableColor);
      setIsTagFormOpen(false);
    }
  }

  function startEditingTag(tag: TodoTag) {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
  }

  function cancelEditingTag() {
    setEditingTagId(null);
    setEditingName("");
  }

  function toggleTagColorPicker(tagId: string) {
    setColorPickerTagId((currentTagId) =>
      currentTagId === tagId ? null : tagId,
    );
  }

  function selectTagColor(tagId: string, color: string) {
    onUpdateTagColor(tagId, color);
    setColorPickerTagId(null);
  }

  function finishEditingTag(tag: TodoTag) {
    const trimmedName = editingName.trim().replace(/\s+/g, " ");

    if (!trimmedName || trimmedName === tag.name) {
      cancelEditingTag();
      return;
    }

    if (onRenameTag(tag.id, trimmedName)) {
      cancelEditingTag();
    }
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>, tag: TodoTag) {
    event.preventDefault();
    finishEditingTag(tag);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditingTag();
    }
  }

  return (
    <Panel className="tag-panel">
      <PanelHeader onClick={() => setIsCollapsed((current) => !current)}>
        tags
        <SectionAddButton
          onClick={() => setIsTagFormOpen((isOpen) => !isOpen)}
        />
      </PanelHeader>
      {!isCollapsed && (
        <>
          {isTagFormOpen ? (
            <form className="tag-form" onSubmit={handleSubmit}>
              <input
                placeholder="Create tag"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="tag-color-grid">
                {colors.map((color) => {
                  const isColorUsed = usedTagColors.has(color);

                  return (
                    <button
                      aria-pressed={selectedColor === color}
                      className="tag-color-option"
                      disabled={isColorUsed}
                      key={color}
                      style={{ "--tag-option-color": color } as CSSProperties}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                    />
                  );
                })}
              </div>
              <button disabled={!firstAvailableColor} type="submit">
                Add tag
              </button>
            </form>
          ) : null}

          {tags.length === 0 ? (
            <p className="status">Create tags to color your tasks.</p>
          ) : (
            <ol className="tag-list">
              {tags.map((tag) => {
                const isEditing = editingTagId === tag.id;
                const isColorPickerOpen = colorPickerTagId === tag.id;

                return (
                  <li key={tag.id}>
                    <div className="tag-list-row">
                      <button
                        aria-expanded={isColorPickerOpen}
                        className="tag-color-dot tag-color-dot-button"
                        style={
                          { "--tag-option-color": tag.color } as CSSProperties
                        }
                        type="button"
                        onClick={() => toggleTagColorPicker(tag.id)}
                      />
                      {isEditing ? (
                        <form
                          className="tag-rename-form"
                          onSubmit={(event) => handleEditSubmit(event, tag)}
                        >
                          <input
                            ref={editingInputRef}
                            value={editingName}
                            onBlur={() => finishEditingTag(tag)}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            onKeyDown={handleEditKeyDown}
                          />
                        </form>
                      ) : (
                        <>
                          <span
                            className="tag-name"
                            style={
                              {
                                "--tag-option-color": tag.color,
                              } as CSSProperties
                            }
                          >
                            {tag.name}
                          </span>
                          <button
                            className="tag-list-action"
                            type="button"
                            onClick={() => startEditingTag(tag)}
                          >
                            <svg
                              viewBox="0 0 20 20"
                              focusable="false"
                              aria-hidden="true"
                            >
                              <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
                            </svg>
                          </button>
                          <button
                            className="tag-list-action"
                            type="button"
                            onClick={() => onDeleteTag(tag.id)}
                          >
                            x
                          </button>
                        </>
                      )}
                    </div>
                    {isColorPickerOpen ? (
                      <div className="tag-color-grid tag-color-grid-small">
                        {colors.map((color) => {
                          const isColorUsedByAnotherTag = tags.some(
                            (currentTag) =>
                              currentTag.id !== tag.id &&
                              currentTag.color === color,
                          );

                          return (
                            <button
                              aria-pressed={tag.color === color}
                              className="tag-color-option"
                              disabled={isColorUsedByAnotherTag}
                              key={color}
                              style={
                                { "--tag-option-color": color } as CSSProperties
                              }
                              type="button"
                              onClick={() => selectTagColor(tag.id, color)}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </Panel>
  );
}
