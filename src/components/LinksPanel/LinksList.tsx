import { type FormEvent, type KeyboardEvent, type RefObject } from "react";
import type { CustomLink } from "../../types/todo";
import { LinkEditForm } from "./LinkEditForm";

type LinksListProps = {
  editInputRef: RefObject<HTMLInputElement | null>;
  editLinkId: string | null;
  editLinkName: string;
  editLinkUrl: string;
  links: CustomLink[];
  onCancelEditing: () => void;
  onDeleteLink: (id: string) => void;
  onEditKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onEditSubmit: (
    event: FormEvent<HTMLFormElement>,
    link: CustomLink,
  ) => void;
  onEditClick: (link: CustomLink) => void;
  onEditNameChange: (name: string) => void;
  onEditUrlChange: (url: string) => void;
};

export function LinksList({
  editInputRef,
  editLinkId,
  editLinkName,
  editLinkUrl,
  links,
  onCancelEditing,
  onDeleteLink,
  onEditKeyDown,
  onEditSubmit,
  onEditClick,
  onEditNameChange,
  onEditUrlChange,
}: LinksListProps) {
  return (
    <ol className="link-list">
      {links.map((link) => {
        const isEditing = editLinkId === link.id;

        return (
          <li key={link.id}>
            {isEditing ? (
              <LinkEditForm
                inputRef={editInputRef}
                name={editLinkName}
                url={editLinkUrl}
                onCancel={onCancelEditing}
                onKeyDown={onEditKeyDown}
                onNameChange={onEditNameChange}
                onSubmit={(event) => onEditSubmit(event, link)}
                onUrlChange={onEditUrlChange}
              />
            ) : (
              <div className="link-list-row">
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.name}
                </a>
                <button
                  className="tag-list-action"
                  type="button"
                  onClick={() => onEditClick(link)}
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
  );
}
