import { Card, Chip, Tooltip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import type { WeeklyActivity } from "../../types/weekly";
import { navigate, weeklyPath } from "../../hooks/route";
import { getDaysLeftInWeek, getDoneThisWeek } from "../../utils/weekly";
import { matchesSearch } from "../../utils/search";

type Props = {
  activities: WeeklyActivity[];
  search: string;
  onCountOne: (activityId: string) => void;
};

/**
 * The week's quotas, one line, above the cloud.
 *
 * A page you have to go to is a page you stop opening, so the counts live
 * where the day is actually spent and a tap counts one off without leaving.
 * Everything else about them is on the page behind the label.
 */
export const WeeklyChips: React.FC<Props> = ({ activities, search, onCountOne }) => {
  const daysLeft = getDaysLeftInWeek();
  const shownActivities = activities.filter((activity) => matchesSearch(search, activity.name));

  // Nothing set up, or nothing matching what is being searched for: the strip
  // is a reminder, and an empty reminder is just a bar taking up room.
  if (!shownActivities.length) return null;

  return (
    <Card sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", px: 1, py: 0.5 }}>
      <Tooltip title="Open the week">
        <Typography
          variant="caption"
          color="text.secondary"
          onClick={() => navigate(weeklyPath)}
          role="button"
          sx={{ mr: 0.5, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5 }}
        >
          weekly
        </Typography>
      </Tooltip>

      {shownActivities.map((activity) => {
        const done = getDoneThisWeek(activity);
        const isDone = done >= activity.target;

        return (
          <Tooltip
            key={activity.id}
            title={isDone ? "Done for the week — tap to count another" : `Tap to count one · ${daysLeft} days left`}
          >
            <Chip
              onClick={() => onCountOne(activity.id)}
              size="small"
              variant={isDone ? "filled" : "outlined"}
              color={isDone ? "success" : "default"}
              icon={isDone ? <CheckIcon /> : undefined}
              label={`${activity.name || "untitled"} ${done}/${activity.target}`}
              sx={{ height: 22, fontSize: 12 }}
            />
          </Tooltip>
        );
      })}
    </Card>
  );
};
