import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CustomLink } from "../../types/todo";
import { Panel } from "../Shared/Panel";
import { PanelHeader } from "../Shared/PanelHeader";
import { SectionAddButton } from "../Shared/SectionAddButton";
import { LinkCreateForm } from "./LinkCreateForm";
import { LinksList } from "./LinksList";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [editLinkId, setEditLinkId] = useState<string | null>(null);
  const [editLinkName, setEditLinkName] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const editLinkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editLinkId) return;

    editLinkInputRef.current?.focus();
    editLinkInputRef.current?.select();
  }, [editLinkId]);

  function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onCreateLink(linkName, linkUrl)) {
      setLinkName("");
      setLinkUrl("");
      setIsLinkFormOpen(false);
    }
  }

  function handleEditClick(link: CustomLink) {
    setEditLinkId(link.id);
    setEditLinkName(link.name);
    setEditLinkUrl(link.url);
  }

  function cancelEditingLink() {
    setEditLinkId(null);
    setEditLinkName("");
    setEditLinkUrl("");
  }

  function finishEditingLink(link: CustomLink) {
    const trimmedName = editLinkName.trim().replace(/\s+/g, " ");
    const trimmedUrl = editLinkUrl.trim();

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
    <Panel>
      <PanelHeader onClick={() => setIsCollapsed((current) => !current)}>
        links
        <SectionAddButton
          onClick={() => setIsLinkFormOpen((isOpen) => !isOpen)}
        />
      </PanelHeader>

      {!isCollapsed && (
        <>
          {isLinkFormOpen && (
            <LinkCreateForm
              name={linkName}
              url={linkUrl}
              onNameChange={setLinkName}
              onSubmit={handleLinkSubmit}
              onUrlChange={setLinkUrl}
            />
          )}

          {links.length === 0 ? (
            <p className="status">Add quick links you use often.</p>
          ) : (
            <LinksList
              editInputRef={editLinkInputRef}
              editLinkId={editLinkId}
              editLinkName={editLinkName}
              editLinkUrl={editLinkUrl}
              links={links}
              onCancelEditing={cancelEditingLink}
              onDeleteLink={onDeleteLink}
              onEditKeyDown={handleLinkEditKeyDown}
              onEditSubmit={handleLinkEditSubmit}
              onEditNameChange={setEditLinkName}
              onEditUrlChange={setEditLinkUrl}
              onEditClick={handleEditClick}
            />
          )}
        </>
      )}
    </Panel>
  );
}
