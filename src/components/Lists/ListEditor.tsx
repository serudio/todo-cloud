import { Alert, Box, Button, Chip, InputBase, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import type { DecisionOption } from "../../types/lists";
import { useDecisionList } from "../../hooks/lists";
import { getWinningOptionId } from "../../utils/lists";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { OptionCard } from "./OptionCard";

type Props = {
  listId?: string;
  shareToken?: string;
  onBack?: () => void;
  onShare?: () => void;
};

export const ListEditor: React.FC<Props> = ({ listId, shareToken, onBack, onShare }) => {
  const { list, isLoading, isSaving, error, changeList, commitList } = useDecisionList({ listId, shareToken });

  if (isLoading) return <LoadingComponent loading />;
  if (error && !list) return <Alert severity="error">{error}</Alert>;
  if (!list) return null;

  const winningOptionId = getWinningOptionId(list.options);

  const changeOption = (newOption: DecisionOption) =>
    list.options.map((option) => (option.id === newOption.id ? newOption : option));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {onBack && (
          <Button onClick={onBack} color="secondary" sx={{ minWidth: 0 }} aria-label="Back to all lists">
            <ArrowBackIcon />
          </Button>
        )}
        <InputBase
          value={list.title}
          placeholder="what are you deciding?"
          onChange={(event) => changeList(event.target.value, list.options)}
          onBlur={() => commitList(list.title, list.options)}
          sx={{ flex: 1, fontSize: "1.1rem", fontWeight: 500 }}
        />
        {isSaving && (
          <Typography variant="caption" color="text.secondary">
            saving…
          </Typography>
        )}
        {onShare && (
          <Button onClick={onShare} color="secondary" sx={{ minWidth: 0 }} aria-label="Share this list">
            <ShareIcon />
          </Button>
        )}
      </Box>

      {shareToken && <Chip label="Shared with you — your edits are saved for everyone" size="small" />}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
        {list.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            showName={list.kind === "compare"}
            splitBySign={list.kind === "pros_cons"}
            isWinner={option.id === winningOptionId}
            onChange={(newOption) => changeList(list.title, changeOption(newOption))}
            onCommit={(newOption) => commitList(list.title, changeOption(newOption))}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary">
        {list.kind === "compare"
          ? "Weigh each reason from −5 to +5. A negative weight makes it a reason against, and the score is the sum."
          : "Weigh each reason from 1 to 5. Cons count as negative, so the score is the sum of both columns."}
      </Typography>
    </Box>
  );
};
