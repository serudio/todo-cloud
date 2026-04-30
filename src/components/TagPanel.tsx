import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
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
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkName, setEditingLinkName] = useState("");
  const [editingLinkUrl, setEditingLinkUrl] = useState("");
  const editingInputRef = useRef<HTMLInputElement>(null);
  const editingLinkInputRef = useRef<HTMLInputElement>(null);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onCreateTag(name, selectedColor)) {
      setName("");
      setSelectedColor(colors[0]);
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
      <p className="eyebrow">tags</p>
      <form className="tag-form" onSubmit={handleSubmit}>
        <input
          aria-label="New tag name"
          placeholder="Create tag"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="tag-color-grid" aria-label="Tag color">
          {colors.map((color) => (
            <button
              aria-label={`Use ${color} tag color`}
              aria-pressed={selectedColor === color}
              className="tag-color-option"
              key={color}
              style={{ "--tag-option-color": color } as CSSProperties}
              type="button"
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
        <button type="submit">Add tag</button>
      </form>

      {tags.length === 0 ? (
        <p className="status">Create tags to color your tasks.</p>
      ) : (
        <ol className="tag-list">
          {tags.map((tag) => {
            const isEditing = editingTagId === tag.id;

            return (
              <li key={tag.id}>
                <div className="tag-list-row">
                  <span
                    className="tag-color-dot"
                    style={{ "--tag-option-color": tag.color } as CSSProperties}
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
                <div className="tag-color-grid tag-color-grid-small">
                  {colors.map((color) => (
                    <button
                      aria-label={`Set ${tag.name} color to ${color}`}
                      aria-pressed={tag.color === color}
                      className="tag-color-option"
                      key={color}
                      style={{ "--tag-option-color": color } as CSSProperties}
                      type="button"
                      onClick={() => onUpdateTagColor(tag.id, color)}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="link-section">
        <p className="eyebrow">links</p>
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
