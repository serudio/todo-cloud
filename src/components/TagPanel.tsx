import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CustomLink, TodoTag } from "../types/todo";

type TagPanelProps = {
  colors: string[];
  links: CustomLink[];
  tags: TodoTag[];
  onCreateLink: (name: string, url: string) => boolean;
  onCreateTag: (name: string, color: string) => boolean;
  onDeleteLink: (id: string) => void;
  onDeleteTag: (id: string) => void;
  onRenameTag: (id: string, name: string) => boolean;
  onUpdateLink: (id: string, name: string, url: string) => boolean;
  onUpdateTagColor: (id: string, color: string) => void;
};

export function TagPanel({
  colors,
  links,
  tags,
  onCreateLink,
  onCreateTag,
  onDeleteLink,
  onDeleteTag,
  onRenameTag,
  onUpdateLink,
  onUpdateTagColor,
}: TagPanelProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [colorPickerTagId, setColorPickerTagId] = useState<string | null>(null);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkName, setEditingLinkName] = useState("");
  const [editingLinkUrl, setEditingLinkUrl] = useState("");
  const editingInputRef = useRef<HTMLInputElement>(null);
  const editingLinkInputRef = useRef<HTMLInputElement>(null);
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
    if (!editingLinkId) return;

    editingLinkInputRef.current?.focus();
    editingLinkInputRef.current?.select();
  }, [editingLinkId]);

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

  function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onCreateLink(linkName, linkUrl)) {
      setLinkName("");
      setLinkUrl("");
      setIsLinkFormOpen(false);
    }
  }

  function startEditingLink(link: CustomLink) {
    setEditingLinkId(link.id);
    setEditingLinkName(link.name);
    setEditingLinkUrl(link.url);
  }

  function cancelEditingLink() {
    setEditingLinkId(null);
    setEditingLinkName("");
    setEditingLinkUrl("");
  }

  function finishEditingLink(link: CustomLink) {
    const trimmedName = editingLinkName.trim().replace(/\s+/g, " ");
    const trimmedUrl = editingLinkUrl.trim();

    if (!trimmedName || !trimmedUrl) {
      cancelEditingLink();
      return;
    }

    if (
      trimmedName === link.name &&
      trimmedUrl === link.url
    ) {
      cancelEditingLink();
      return;
    }

    if (onUpdateLink(link.id, trimmedName, trimmedUrl)) {
      cancelEditingLink();
    }
  }

  function handleLinkEditSubmit(
    event: FormEvent<HTMLFormElement>,
    link: CustomLink,
  ) {
    event.preventDefault();
    finishEditingLink(link);
  }

  function handleLinkEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditingLink();
    }
  }

  return (
    <aside className="tag-panel" aria-label="Tags">
      <div className="section-title-row">
        <p className="eyebrow">tags</p>
        <button
          aria-expanded={isTagFormOpen}
          aria-label={isTagFormOpen ? "Hide tag form" : "Add tag"}
          className="section-add-button"
          type="button"
          onClick={() => setIsTagFormOpen((isOpen) => !isOpen)}
        >
          +
        </button>
      </div>
      {isTagFormOpen ? (
        <form className="tag-form" onSubmit={handleSubmit}>
          <input
            aria-label="New tag name"
            placeholder="Create tag"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="tag-color-grid" aria-label="Tag color">
            {colors.map((color) => {
              const isColorUsed = usedTagColors.has(color);

              return (
                <button
                  aria-label={
                    isColorUsed
                      ? `${color} tag color is already used`
                      : `Use ${color} tag color`
                  }
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
                    aria-label={`Change ${tag.name} color`}
                    className="tag-color-dot tag-color-dot-button"
                    style={{ "--tag-option-color": tag.color } as CSSProperties}
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
                        aria-label={`Rename ${tag.name}`}
                        value={editingName}
                        onBlur={() => finishEditingTag(tag)}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={handleEditKeyDown}
                      />
                    </form>
                  ) : (
                    <>
                      <span>{tag.name}</span>
                      <button
                        aria-label={`Rename ${tag.name}`}
                        className="tag-list-action"
                        type="button"
                        onClick={() => startEditingTag(tag)}
                      >
                        <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                          <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
                        </svg>
                      </button>
                      <button
                        aria-label={`Delete ${tag.name}`}
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
                          currentTag.id !== tag.id && currentTag.color === color,
                      );

                      return (
                        <button
                          aria-label={
                            isColorUsedByAnotherTag
                              ? `${color} is already used by another tag`
                              : `Set ${tag.name} color to ${color}`
                          }
                          aria-pressed={tag.color === color}
                          className="tag-color-option"
                          disabled={isColorUsedByAnotherTag}
                          key={color}
                          style={{ "--tag-option-color": color } as CSSProperties}
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

      <div className="link-section">
        <div className="section-title-row">
          <p className="eyebrow">links</p>
          <button
            aria-expanded={isLinkFormOpen}
            aria-label={isLinkFormOpen ? "Hide link form" : "Add link"}
            className="section-add-button"
            type="button"
            onClick={() => setIsLinkFormOpen((isOpen) => !isOpen)}
          >
            +
          </button>
        </div>
        {isLinkFormOpen ? (
          <form className="link-form" onSubmit={handleLinkSubmit}>
            <input
              aria-label="New link name"
              placeholder="Link name"
              value={linkName}
              onChange={(event) => setLinkName(event.target.value)}
            />
            <input
              aria-label="New link URL"
              placeholder="example.com"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <button type="submit">Add link</button>
          </form>
        ) : null}

        {links.length === 0 ? (
          <p className="status">Add quick links you use often.</p>
        ) : (
          <ol className="link-list">
            {links.map((link) => {
              const isEditing = editingLinkId === link.id;

              return (
                <li key={link.id}>
                  {isEditing ? (
                    <form
                      className="link-edit-form"
                      onSubmit={(event) => handleLinkEditSubmit(event, link)}
                    >
                      <input
                        ref={editingLinkInputRef}
                        aria-label={`Rename ${link.name}`}
                        value={editingLinkName}
                        onChange={(event) =>
                          setEditingLinkName(event.target.value)
                        }
                        onKeyDown={handleLinkEditKeyDown}
                      />
                      <input
                        aria-label={`Change ${link.name} URL`}
                        value={editingLinkUrl}
                        onChange={(event) =>
                          setEditingLinkUrl(event.target.value)
                        }
                        onKeyDown={handleLinkEditKeyDown}
                      />
                      <div className="link-edit-actions">
                        <button type="submit">Save</button>
                        <button type="button" onClick={cancelEditingLink}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="link-list-row">
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.name}
                      </a>
                      <button
                        aria-label={`Edit ${link.name}`}
                        className="tag-list-action"
                        type="button"
                        onClick={() => startEditingLink(link)}
                      >
                        <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                          <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
                        </svg>
                      </button>
                      <button
                        aria-label={`Delete ${link.name}`}
                        className="tag-list-action"
                        type="button"
                        onClick={() => onDeleteLink(link.id)}
                      >
                        x
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}
