import { useState } from "react";
import { Alert, Box, Button, Card, Chip, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ShareIcon from "@mui/icons-material/Share";
import type { DecisionListKind, DecisionListSummary } from "../../types/lists";
import { useDecisionLists } from "../../hooks/lists";
import { getListPath, navigate, todosPath } from "../../hooks/route";
import { formatDateKey } from "../../utils/todos";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { ConfirmDialog } from "../Shared/ConfirmDialog";
import { ShareDialog } from "./ShareDialog";

type Props = {
  userId: string;
};

export const ListsPage: React.FC<Props> = ({ userId }) => {
  const { lists, isLoading, error, createList, removeList } = useDecisionLists(userId);
  const [listPendingDelete, setListPendingDelete] = useState<DecisionListSummary | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const handleCreate = async (kind: DecisionListKind) => {
    const newListId = await createList(kind);
    if (newListId) navigate(getListPath(newListId));
  };

  const handleDeleteConfirm = () => {
    if (listPendingDelete) removeList(listPendingDelete.id);
    setListPendingDelete(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button onClick={() => navigate(todosPath)} color="secondary" sx={{ minWidth: 0 }} aria-label="Back to tasks">
          <ArrowBackIcon />
        </Button>
        <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: 2, mr: "auto" }}>
          Lists
        </Typography>
        <Button size="small" onClick={() => handleCreate("pros_cons")}>
          new pros and cons
        </Button>
        <Button size="small" onClick={() => handleCreate("compare")}>
          new comparison
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <LoadingComponent loading />}

      {!isLoading && !lists.length && <Typography>Create a list to weigh a decision.</Typography>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {lists.map((list) => (
          <Card key={list.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
            <Box
              onClick={() => navigate(getListPath(list.id))}
              sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
              role="button"
            >
              <Typography noWrap>{list.title}</Typography>
              {list.updatedAt && (
                <Typography variant="caption" color="text.secondary">
                  {formatDateKey(list.updatedAt)}
                </Typography>
              )}
            </Box>
            <Chip label={list.kind === "compare" ? "comparison" : "pros and cons"} size="small" variant="outlined" />
            <IconButton size="small" onClick={() => setShareToken(list.shareToken)} aria-label="Share this list">
              <ShareIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setListPendingDelete(list)} aria-label="Delete this list">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Card>
        ))}
      </Box>

      <ShareDialog shareToken={shareToken} onClose={() => setShareToken(null)} />

      <ConfirmDialog
        open={Boolean(listPendingDelete)}
        title="Delete list?"
        message={`"${listPendingDelete?.title ?? ""}" will be gone for everyone it was shared with.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setListPendingDelete(null)}
      />
    </Box>
  );
};
