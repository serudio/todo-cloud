import { useCallback, useState } from "react";
import type { CustomLink } from "../../types/todo";
import { LinkCreateForm } from "./LinkCreateForm";
import { SectionCard } from "../Shared/SectionCard";
import { LinkItem } from "./LinkItem";
import { Box } from "@mui/material";
import { normalizeCustomLinkUrl } from "../../utils/todos";
import { ConfirmDialog } from "../Shared/ConfirmDialog";

type LinksPanelProps = {
  links: CustomLink[];
  updateLinks: (links: CustomLink[]) => void;
  setNotification: (message: string) => void;
};

export function LinksCard({ links, updateLinks, setNotification }: LinksPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [linkIdPendingDelete, setLinkIdPendingDelete] = useState<string | null>(null);

  function handleLinkSubmit(name: string, url: string) {
    const trimmedName = name.trim().replace(/\s+/g, " "); // todo normalize
    const normalizedUrl = normalizeCustomLinkUrl(url);
    if (!trimmedName || !normalizedUrl) return;

    const existingLink = links.find((link) => link.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase());

    if (existingLink) {
      setNotification(`"${existingLink.name}" link already exists.`);
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

  const linkPendingDelete = links.find((link) => link.id === linkIdPendingDelete) ?? null;

  const handleDeleteConfirm = () => {
    const newLinks = links.filter((link) => link.id !== linkIdPendingDelete);
    updateLinks(newLinks);
    setLinkIdPendingDelete(null);
  };

  return (
    <SectionCard
      title="Links"
      onActionButtonClick={() => setShowForm((isOpen) => !isOpen)}
      sx={{ width: 300, marginLeft: "35%" }}
    >
      {/* //todo */}
      {showForm && <LinkCreateForm onSubmit={handleLinkSubmit} />}
      {links.length === 0 && <p>Add quick links you use often.</p>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {links.map((link) => (
          <LinkItem key={link.id} link={link} updateLink={updateLink} onDelete={setLinkIdPendingDelete} />
        ))}
      </Box>

      <ConfirmDialog
        open={Boolean(linkPendingDelete)}
        title="Delete link?"
        message={`"${linkPendingDelete?.name ?? ""}" will be removed from your links.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setLinkIdPendingDelete(null)}
      />
    </SectionCard>
  );
}
