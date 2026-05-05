import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { IconButton, Popover, Tooltip } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { formatDateKey } from "../../utils/todos";

type Props = {
  value: number | null;
  onChange: (date: number | null) => void;
  onOpen?: () => void;
};

export const DatePicker: React.FC<Props> = ({ value, onChange, onOpen }) => {
  const [calendarAnchorElement, setCalendarAnchorElement] = useState<HTMLElement | null>(null);
  const tooltip = value ? `Due ${formatDateKey(value)}` : "Set due date";
  const isCalendarOpen = Boolean(calendarAnchorElement);

  function handleDueDateChange(date: Dayjs | null) {
    onChange(date ? date.startOf("day").valueOf() : null);
    setCalendarAnchorElement(null);
  }

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          aria-label="Set due date"
          color={value ? "warning" : "default"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpen?.();
            setCalendarAnchorElement(event.currentTarget);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          size="small"
          sx={{
            bgcolor: value ? "warning.light" : undefined,
            "&:hover": {
              bgcolor: value ? "warning.main" : undefined,
            },
          }}
        >
          <CalendarMonthIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={isCalendarOpen}
        anchorEl={calendarAnchorElement}
        onClose={() => setCalendarAnchorElement(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar value={value ? dayjs(value) : null} onChange={handleDueDateChange} />
        </LocalizationProvider>
      </Popover>
    </>
  );
};