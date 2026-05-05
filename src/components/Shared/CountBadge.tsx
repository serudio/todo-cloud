import { useState } from "react";
import { Button, Popover, Stack, Typography } from "@mui/material";

type CountBadgeProps = {
  count: number;
  onReset: () => void;
};

export function CountBadge({ count, onReset }: CountBadgeProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorElement);

  return (
    <>
      <button type="button" onClick={(event) => setAnchorElement(event.currentTarget)}>
        count: {count}
      </button>

      <Popover
        open={isOpen}
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Stack spacing={1} sx={{ minWidth: 118, p: 1.25 }}>
          <Typography
            color="text.secondary"
            sx={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Count
          </Typography>
          <Button size="small" type="button" variant="contained" onClick={onReset} sx={{ borderRadius: 999, whiteSpace: "nowrap" }}>
            Reset to 0
          </Button>
        </Stack>
      </Popover>
    </>
  );
}
