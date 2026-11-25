import { Box } from "@mui/material";
import { CLOUD_ACCENT } from "../../constants/ui";

// Due today: a small tag on the tile's edge in the cloud's accent, pulsing
// softly so it is noticed without shouting.
export const DueDateChip: React.FC = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: -9,
        left: 14,
        px: 0.75,
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        lineHeight: "16px",
        textTransform: "uppercase",
        color: "#0e0e0e",
        bgcolor: CLOUD_ACCENT,
        "@keyframes due-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(255, 98, 51, 0.6)" },
          "100%": { boxShadow: "0 0 0 6px rgba(255, 98, 51, 0)" },
        },
        animation: "due-pulse 1.6s ease-out infinite",
      }}
    >
      today
    </Box>
  );
};
