import { Box, IconButton, InputBase, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { DecisionItem } from "../../types/lists";
import { clampWeight, formatWeight, isWeightFilled, WEIGHT_SCALE, WEIGHT_STEPS } from "../../utils/lists";

type Props = {
  item: DecisionItem;
  autoFocus: boolean;
  // A signed row carries its own sign, so its scale spans both directions. An
  // unsigned row sits in a pros or cons column that has already fixed the sign.
  isSigned: boolean;
  onChange: (item: DecisionItem) => void;
  onCommit: (item: DecisionItem) => void;
  onRemove: () => void;
  onEnter: () => void;
};

export const ItemRow: React.FC<Props> = ({ item, autoFocus, isSigned, onChange, onCommit, onRemove, onEnter }) => {
  const isCon = item.weight < 0;
  const steps = isSigned ? WEIGHT_SCALE : WEIGHT_STEPS;

  const setWeight = (step: number) => {
    const newItem = { ...item, weight: isSigned ? step : clampWeight(step, isCon) };

    onChange(newItem);
    onCommit(newItem);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <InputBase
        autoFocus={autoFocus}
        value={item.text}
        placeholder={isSigned ? "a reason for or against" : isCon ? "a reason against" : "a reason for"}
        onChange={(event) => onChange({ ...item, text: event.target.value })}
        onBlur={() => onCommit(item)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          event.preventDefault();
          onCommit(item);
          onEnter();
        }}
        sx={{ flex: 1, minWidth: 60, fontSize: "0.875rem", "& input": { padding: "2px 0" } }}
      />

      <Typography
        variant="caption"
        color={isCon ? "error.main" : "success.main"}
        sx={{ width: 22, textAlign: "right", fontWeight: 500, flexShrink: 0 }}
      >
        {formatWeight(item.weight)}
      </Typography>

      {/* Signed rows get a diverging scale: left of the gap is a con, right a pro. */}
      <Box sx={{ display: "flex", gap: "3px", flexShrink: 0 }}>
        {steps.map((step) => {
          const isNegativeStep = isSigned ? step < 0 : isCon;
          const stepWeight = isSigned ? step : clampWeight(step, isCon);

          return (
            <Box
              key={step}
              component="button"
              type="button"
              aria-label={`Set weight to ${formatWeight(stepWeight)}`}
              aria-pressed={stepWeight === item.weight}
              onClick={() => setWeight(step)}
              sx={{
                width: 16,
                height: 24,
                padding: 0,
                border: 0,
                cursor: "pointer",
                borderRadius: "2px",
                marginRight: isSigned && step === -1 ? "9px" : 0,
                backgroundColor: (theme) =>
                  isWeightFilled(stepWeight, item.weight)
                    ? isNegativeStep
                      ? theme.palette.error.main
                      : theme.palette.success.main
                    : theme.palette.action.disabledBackground,
                "&:hover": {
                  backgroundColor: (theme) =>
                    isNegativeStep ? theme.palette.error.light : theme.palette.success.light,
                },
              }}
            />
          );
        })}
      </Box>

      <IconButton onClick={onRemove} size="small" aria-label="Remove item" sx={{ padding: 0, flexShrink: 0 }}>
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
