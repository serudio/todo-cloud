import { useState } from "react";
import type { CustomLink } from "../../types/todo";
import { LinkCreateForm } from "./LinkCreateForm";
import { SectionCard } from "../Shared/SectionCard";
import { LinkItem } from "./LinkItem";
import { Box } from "@mui/joy";

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
  const [showForm, setShowForm] = useState(false);

  function handleLinkSubmit(name: string, url: string) {
    if (onCreateLink(name, url)) {
      setShowForm(false);
    }
  }

  function finishEditingLink(link: CustomLink) {
    const { id, name, url } = link;
    const trimmedName = name.trim().replace(/\s+/g, " ");
    const trimmedUrl = url.trim();

    onUpdateLink(id, trimmedName, trimmedUrl);
  }

  return (
    <SectionCard
      title="Links"
      onActionButtonClick={() => setShowForm((isOpen) => !isOpen)}
    >
      {showForm && <LinkCreateForm onSubmit={handleLinkSubmit} />}

      {links.length === 0 && <p>Add quick links you use often.</p>}
      <Box display="flex" flexDirection="column" gap={0.5}>
        {links.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            onDelete={onDeleteLink}
            onSubmit={finishEditingLink}
          />
        ))}
      </Box>
    </SectionCard>
  );
}
