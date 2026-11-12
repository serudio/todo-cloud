import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

type Props = {
  done: number;
  target: number;
  /** Taller cells for the week's own total, which is read first. */
  height?: number;
};

/**
 * One cell per time it should happen, filled as they are done.
 *
 * A continuous bar says "about two thirds"; this says "three of five, two to
 * go", which is the question actually being asked. It also matches the row of
 * targets above it, so the cells and the number that set them read as the same
 * thing.
 */
export const WeeklyProgressCells: React.FC<Props> = ({ done, target, height = 10 }) => {
  const filled = Math.min(done, target);
  const isDone = filled >= target;
  // Done more than asked: the cells are all full, so the surplus is said rather
  // than drawn. The row cannot grow past the target without losing its meaning.
  const extra = Math.max(0, done - target);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box sx={{ display: "flex", gap: 0.5, flex: 1, minWidth: 0 }} role="img" aria-label={`${done} of ${target} done`}>
        {Array.from({ length: target }, (_unused, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              minWidth: 6,
              height,
              borderRadius: 1,
              border: 1,
              borderColor: index < filled ? "transparent" : "divider",
              bgcolor: (theme) =>
                index < filled
                  ? theme.palette[isDone ? "success" : "warning"].main
                  : alpha(theme.palette.text.primary, 0.06),
            }}
          />
        ))}
      </Box>

      {extra > 0 && (
        <Typography variant="caption" color="success.main" sx={{ flexShrink: 0 }}>
          +{extra}
        </Typography>
      )}
    </Box>
  );
};
