import { Box, Button, Card, Chip, InputBase, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { DecisionItem, DecisionOption } from "../../types/lists";
import { formatWeight, getCons, getItemsScore, getNewItem, getOptionScore, getPros } from "../../utils/lists";
import { ItemRow } from "./ItemRow";

type Props = {
  option: DecisionOption;
  showName: boolean;
  // A pros/cons list splits into two columns whose headers carry the sign. A
  // comparison gives each option one column, where each row is signed itself.
  splitBySign: boolean;
  isWinner: boolean;
  onChange: (option: DecisionOption) => void;
  onCommit: (option: DecisionOption) => void;
};

export const OptionCard: React.FC<Props> = ({ option, showName, splitBySign, isWinner, onChange, onCommit }) => {
  const score = getOptionScore(option);

  const changeItems = (items: DecisionItem[]) => onChange({ ...option, items });
  const commitItems = (items: DecisionItem[]) => onCommit({ ...option, items });

  // Both take the new item rather than reading it back from state, because a weight
  // click changes and commits in one tick, before this render's option is replaced.
  const withItem = (newItem: DecisionItem) => option.items.map((item) => (item.id === newItem.id ? newItem : item));

  const changeItem = (newItem: DecisionItem) => changeItems(withItem(newItem));
  const commitItem = (newItem: DecisionItem) => commitItems(withItem(newItem));

  const addItem = (weight: number) => changeItems([...option.items, getNewItem(weight)]);

  const removeItem = (id: string) => commitItems(option.items.filter((item) => item.id !== id));

  // Each column carries its own total, so both sides can be read on their own.
  const renderColumnHeader = (label: string, items: DecisionItem[], isCons: boolean) => (
    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="caption" color={isCons ? "error.main" : "success.main"}>
        {label}
      </Typography>
      <Typography variant="caption" color={isCons ? "error.main" : "success.main"} sx={{ fontWeight: 500 }}>
        {formatWeight(getItemsScore(items))}
      </Typography>
    </Box>
  );

  const renderItems = (items: DecisionItem[], newItemWeight: number) => (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            autoFocus={!item.text && index === items.length - 1 && index > 0}
            isSigned={!splitBySign}
            onChange={changeItem}
            onCommit={commitItem}
            onRemove={() => removeItem(item.id)}
            onEnter={() => addItem(newItemWeight)}
          />
        ))}
      </Box>
      <Button size="small" startIcon={<AddIcon />} onClick={() => addItem(newItemWeight)} sx={{ mt: 0.5, minWidth: 0 }}>
        add
      </Button>
    </>
  );

  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 280,
        p: 1.5,
        border: (theme) => (isWinner ? `1px solid ${theme.palette.success.main}` : "1px solid transparent"),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
        {showName ? (
          <InputBase
            value={option.name}
            placeholder="name this option"
            onChange={(event) => onChange({ ...option, name: event.target.value })}
            onBlur={() => onCommit(option)}
            sx={{ fontWeight: 500, "& input": { padding: 0 } }}
          />
        ) : (
          <Box />
        )}
        <Chip
          label={formatWeight(score)}
          size="small"
          variant={isWinner ? "filled" : "outlined"}
          color={score > 0 ? "success" : score < 0 ? "error" : "default"}
        />
      </Box>

      {splitBySign ? (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            {renderColumnHeader("pros", getPros(option), false)}
            {renderItems(getPros(option), 1)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            {renderColumnHeader("cons", getCons(option), true)}
            {renderItems(getCons(option), -1)}
          </Box>
        </Box>
      ) : (
        renderItems(option.items, 1)
      )}
    </Card>
  );
};
