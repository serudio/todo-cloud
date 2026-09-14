import { useEffect, useState } from "react";
import { InputBase } from "@mui/material";

type Props = {
  points: number;
  onCommit: (points: number) => void;
};

// Keeps the half-typed text locally so the field can be cleared and retyped, and
// only reports a whole, non-zero number back. Anything else snaps back on blur.
export const PointsInput: React.FC<Props> = ({ points, onCommit }) => {
  const [pointsText, setPointsText] = useState(String(points));

  useEffect(() => {
    setPointsText(String(points));
  }, [points]);

  const commitPoints = () => {
    const parsedPoints = Math.round(Number(pointsText));

    if (!pointsText.trim() || !Number.isFinite(parsedPoints) || parsedPoints === 0) {
      setPointsText(String(points));
      return;
    }

    if (parsedPoints !== points) onCommit(parsedPoints);
  };

  return (
    <InputBase
      type="number"
      value={pointsText}
      onChange={(event) => setPointsText(event.target.value)}
      onBlur={commitPoints}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        (event.target as HTMLInputElement).blur();
      }}
      slotProps={{ input: { "aria-label": "Points" } }}
      sx={{
        width: 54,
        flexShrink: 0,
        fontSize: "0.875rem",
        "& input": { padding: 0, textAlign: "right", MozAppearance: "textfield" },
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
      }}
    />
  );
};
