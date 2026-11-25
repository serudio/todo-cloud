import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Box, Tooltip, useTheme } from "@mui/material";
import { getCloudPalette } from "../../constants/ui";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

dayjs.extend(relativeTime);

type Props = {
  lastAddedDate: string | null;
  // The cloud tile has no room in the flow, so there the badge floats in a corner.
  isFloating?: boolean;
};

// "STALE" said a task was old but not how old, which is the only part worth knowing.
export const StaleBadge: React.FC<Props> = ({ lastAddedDate, isFloating }) => {
  const cloud = getCloudPalette(useTheme().palette.mode);

  if (!lastAddedDate) return null;

  const age = dayjs(lastAddedDate).fromNow(true);

  return (
    <Tooltip title={`Added ${dayjs(lastAddedDate).fromNow()} and still not done`}>
      <Box
        aria-label={`Waiting ${age}`}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          flexShrink: 0,
          px: 0.5,
          borderRadius: 999,
          fontSize: "0.65rem",
          letterSpacing: 0,
          lineHeight: 1.6,
          whiteSpace: "nowrap",
          color: "text.secondary",
          backgroundColor: "action.hover",
          ...(isFloating
            ? {
                position: "absolute",
                bottom: -9,
                right: 14,
                color: cloud.muted,
                backgroundColor: cloud.raised,
                border: `1px solid ${cloud.tileBorder}`,
                textTransform: "none",
                fontWeight: 400,
              }
            : {}),
        }}
      >
        <HourglassBottomIcon sx={{ fontSize: "0.8rem" }} />
        {age}
      </Box>
    </Tooltip>
  );
};
