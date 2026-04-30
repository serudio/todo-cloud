import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { CustomLink } from "../types/todo";
import "./LinksPanel.css";

type LinksPanelProps = {
  links: CustomLink[];
  onCreateLink: (name: string, url: string) => boolean;
  onDeleteLink: (id: string) => void;
  onUpdateLink: (id: string, name: string, url: string) => boolean;
};

export function LinksPanel({
  links,
  onCreateLink,
  onDeleteLink,
  onUpdateLink,
}: LinksPanelProps) {
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkName, setEditingLinkName] = useState("");
  const [editingLinkUrl, setEditingLinkUrl] = useState("");
  const editingLinkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingLinkId) return;

    editingLinkInputRef.current?.focus();
    editingLinkInputRef.current?.select();
  }, [editingLinkId]);

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

    if (trimmedName === link.name && trimmedUrl === link.url) {
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
    <aside className="links-panel">
      <div className="section-title-row">
        <p className="eyebrow">links</p>
        <button
          aria-expanded={isLinkFormOpen}
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
            placeholder="Link name"
            value={linkName}
            onChange={(event) => setLinkName(event.target.value)}
          />
          <input
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
                      value={editingLinkName}
                      onChange={(event) => setEditingLinkName(event.target.value)}
                      onKeyDown={handleLinkEditKeyDown}
                    />
                    <input
                      value={editingLinkUrl}
                      onChange={(event) => setEditingLinkUrl(event.target.value)}
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
                      className="tag-list-action"
                      type="button"
                      onClick={() => startEditingLink(link)}
                    >
                      <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                        <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
                      </svg>
                    </button>
                    <button
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
    </aside>
  );
}
