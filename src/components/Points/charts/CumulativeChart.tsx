import { Box, Typography, useTheme } from "@mui/material";
import type { DayTotal } from "../../../types/points";
import { formatDayLabel } from "../../../utils/points";

type Props = {
  days: DayTotal[];
  target: number;
};

const WIDTH = 420;
const HEIGHT = 180;
const PADDING = { top: 12, right: 12, bottom: 22, left: 34 };

// A running total against the target line: the "are we nearly there yet" view.
export const CumulativeChart: React.FC<Props> = ({ days, target }) => {
  const theme = useTheme();

  if (!days.length) return null;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  // Headroom above the highest value, so the target line and its label never sit
  // flush against the top edge — which is exactly where they land before any
  // running total has passed the target.
  const highestValue = Math.max(target, ...days.map((day) => day.total));
  const maxValue = highestValue * 1.12;

  const getX = (index: number) =>
    PADDING.left + (days.length === 1 ? plotWidth / 2 : (index / (days.length - 1)) * plotWidth);
  const getY = (value: number) => PADDING.top + plotHeight - (value / maxValue) * plotHeight;

  const linePoints = days.map((day, index) => `${getX(index)},${getY(day.total)}`).join(" ");
  const areaPoints = `${PADDING.left},${getY(0)} ${linePoints} ${getX(days.length - 1)},${getY(0)}`;
  const targetY = getY(target);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        running total
      </Typography>
      <Box
        component="svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Points collected over time"
        sx={{ width: "100%", height: "auto", display: "block" }}
      >
        <polygon points={areaPoints} fill={theme.palette.warning.main} opacity={0.18} />
        <polyline
          points={linePoints}
          fill="none"
          stroke={theme.palette.warning.main}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={targetY}
          y2={targetY}
          stroke={theme.palette.success.main}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text x={WIDTH - PADDING.right} y={targetY - 4} textAnchor="end" fontSize={9} fill={theme.palette.success.main}>
          target {target}
        </text>

        {days.map((day, index) => (
          <circle key={day.date} cx={getX(index)} cy={getY(day.total)} r={2.5} fill={theme.palette.warning.main} />
        ))}

        <line
          x1={PADDING.left}
          x2={PADDING.left}
          y1={PADDING.top}
          y2={HEIGHT - PADDING.bottom}
          stroke={theme.palette.divider}
        />
        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={HEIGHT - PADDING.bottom}
          y2={HEIGHT - PADDING.bottom}
          stroke={theme.palette.divider}
        />

        <text
          x={PADDING.left - 5}
          y={getY(highestValue) + 3}
          textAnchor="end"
          fontSize={9}
          fill={theme.palette.text.secondary}
        >
          {highestValue}
        </text>
        <text
          x={PADDING.left - 5}
          y={HEIGHT - PADDING.bottom}
          textAnchor="end"
          fontSize={9}
          fill={theme.palette.text.secondary}
        >
          0
        </text>
        <text x={PADDING.left} y={HEIGHT - 6} fontSize={9} fill={theme.palette.text.secondary}>
          {formatDayLabel(days[0].date)}
        </text>
        {days.length > 1 && (
          <text
            x={WIDTH - PADDING.right}
            y={HEIGHT - 6}
            textAnchor="end"
            fontSize={9}
            fill={theme.palette.text.secondary}
          >
            {formatDayLabel(days[days.length - 1].date)}
          </text>
        )}
      </Box>
    </Box>
  );
};
