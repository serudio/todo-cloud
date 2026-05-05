import { Box } from "@mui/material";
import { TAG_COLORS } from "../../constants/tags";

type Props = {
  selectedColor: string;
  onClick: (color: string) => void;
  usedColors: Set<string>;
};

export const ColorPicker: React.FC<Props> = ({ selectedColor, onClick, usedColors }) => {
  const isColorDisabled = (color: string) => {
    return usedColors.has(color);
  };
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
      {TAG_COLORS.map((color) => {
        const disabled = isColorDisabled(color);
        return (
          <Box
            key={color}
            onClick={() => {
              if (!disabled) onClick(color);
            }}
            sx={{
              opacity: disabled ? 0.3 : 1,
              background: color,
              outline: selectedColor === color ? "2px solid red" : "none",
              width: 20,
              height: 20,
              borderRadius: "50%",
              cursor: disabled ? "default" : "pointer",
              margin: "0 4px",
            }}
          />
        );
      })}
    </Box>
  );
};
