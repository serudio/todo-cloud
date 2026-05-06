import { Chip } from "@mui/material";

export const DueDateChip: React.FC = () => {
  return (
    <Chip
      label="today"
      color="info"
      sx={{
        position: "absolute",
        top: "-15%",
        left: "20%",
        letterSpacing: 2,
        "@keyframes pulse-animation": {
          "0%": { boxShadow: "0 0 0 0 rgba(244, 67, 54, 0)" },
          "10%": { boxShadow: "0 0 0 1px rgba(244, 67, 54, 0.8)" },
          "100%": { boxShadow: "0 0 0 3px rgba(244, 67, 54, 0)" },
        },
        animation: "pulse-animation 1.5s infinite",
      }}
    />
  );
};
