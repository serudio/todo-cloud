import { Box, Typography, useTheme } from "@mui/material";

type Props = {
  total: number;
  target: number;
  ratio: number;
};

const SIZE = 180;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ProgressRing: React.FC<Props> = ({ total, target, ratio }) => {
  const theme = useTheme();
  const isReached = total >= target;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ position: "relative", width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} role="img" aria-label={`${total} of ${target} points`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={theme.palette.action.disabledBackground}
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={isReached ? theme.palette.success.main : theme.palette.warning.main}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 400ms ease" }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 500, lineHeight: 1 }}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            of {target}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" color={isReached ? "success.main" : "text.secondary"} sx={{ mt: 1 }}>
        {isReached ? "Earned! 🎉" : `${target - total} points to go`}
      </Typography>
    </Box>
  );
};
