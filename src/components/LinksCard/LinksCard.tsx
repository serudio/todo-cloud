import { useCallback, useState } from "react";
import type { CustomLink } from "../../types/todo";
import { LinkCreateForm } from "./LinkCreateForm";
import { SectionCard } from "../Shared/SectionCard";
import { LinkItem } from "./LinkItem";
import { Box } from "@mui/material";
import { normalizeCustomLinkUrl } from "../../utils/todos";

type LinksPanelProps = {
  links: CustomLink[];
  updateLinks: (links: CustomLink[]) => void;
  onDeleteLink: (id: string) => void;
  showNotification: (message: string) => void;
};

export function LinksCard({ links, updateLinks, onDeleteLink, showNotification }: LinksPanelProps) {
  const [showForm, setShowForm] = useState(false);

  function handleLinkSubmit(name: string, url: string) {
    const trimmedName = name.trim().replace(/\s+/g, " ");
    const normalizedUrl = normalizeCustomLinkUrl(url);
    if (!trimmedName || !normalizedUrl) return;

    const existingLink = links.find((link) => link.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase());

    if (existingLink) {
      showNotification(`"${existingLink.name}" link already exists.`);
      return;
    }

    const newLinks = [...links, { id: crypto.randomUUID(), name: trimmedName, url: normalizedUrl }];

    updateLinks(newLinks);
    setShowForm(false);
  }

  const updateLink = useCallback(
    (link: CustomLink) => {
      const newLinks = links.map((l) => (l.id === link.id ? link : l));
      updateLinks(newLinks);
    },
    [updateLinks],
  );

  return (
    <SectionCard title="Links" onActionButtonClick={() => setShowForm((isOpen) => !isOpen)}>
      {/* //todo */}
      {showForm && <LinkCreateForm onSubmit={handleLinkSubmit} />}
      {links.length === 0 && <p>Add quick links you use often.</p>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {links.map((link) => (
          <LinkItem key={link.id} link={link} updateLink={updateLink} onDelete={onDeleteLink} />
        ))}
      </Box>
    </SectionCard>
  );
}
