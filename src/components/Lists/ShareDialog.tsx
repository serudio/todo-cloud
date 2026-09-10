import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputBase,
} from "@mui/material";
import { getShareUrl } from "../../hooks/route";

type Props = {
  shareToken: string | null;
  onClose: () => void;
};

export const ShareDialog: React.FC<Props> = ({ shareToken, onClose }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const shareUrl = shareToken ? getShareUrl(shareToken) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
    } catch {
      setHasCopied(false);
    }
  };

  const handleClose = () => {
    setHasCopied(false);
    onClose();
  };

  return (
    <Dialog open={Boolean(shareToken)} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share this list</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          Anyone with this link can edit the list, with or without an account. Only you can rename or delete it.
        </DialogContentText>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <InputBase
            value={shareUrl}
            readOnly
            onFocus={(event) => event.target.select()}
            sx={{ flex: 1, fontSize: "0.85rem", border: 1, borderColor: "divider", borderRadius: 1, px: 1 }}
          />
          <Button onClick={handleCopy}>{hasCopied ? "Copied" : "Copy"}</Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};
