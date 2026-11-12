import { useWeeklyActivities } from "../../hooks/weekly";
import { WeeklyChips } from "./WeeklyChips";

type Props = {
  userId: string;
  search: string;
};

// The strip fetches for itself rather than taking the week from App: it only
// mounts on the cloud, so the other pages do not pay for a query they never show.
export const WeeklyStrip: React.FC<Props> = ({ userId, search }) => {
  const { activities, isLoading, countOne } = useWeeklyActivities(userId);

  if (isLoading) return null;

  return <WeeklyChips activities={activities} search={search} onCountOne={countOne} />;
};
