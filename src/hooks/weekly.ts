import { useCallback, useEffect, useRef, useState } from "react";
import type { WeeklyActivity } from "../types/weekly";
import {
  createWeeklyActivity,
  deleteWeeklyActivity,
  getWeeklyActivities,
  updateWeeklyActivity,
} from "../utils/db/weeklyActivities";
import {
  DEFAULT_WEEKLY_TARGET,
  markWeeklyDone,
  parseWeeklyActivity,
  pruneDoneDates,
  sortWeeklyActivities,
  undoWeeklyDone,
} from "../utils/weekly";

/**
 * The week's quotas.
 *
 * Counting one off is what this gets used for, often from a phone and often in
 * a hurry, so it is applied locally first and written afterwards. A failed
 * write puts the server's version back rather than leaving a number on screen
 * that nothing agrees with.
 *
 * Every change is derived from a ref rather than from the activity the caller
 * is holding. Two taps inside one frame both see the same rendered props, so
 * reading the second one's starting point from props would compute it from a
 * count that is already out of date and quietly drop a tap.
 */
export function useWeeklyActivities(userId: string | undefined) {
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The same list the state holds, assigned as the change is made rather than
  // after the render it causes.
  const activitiesRef = useRef<WeeklyActivity[]>([]);

  const putActivities = useCallback((newActivities: WeeklyActivity[]) => {
    activitiesRef.current = newActivities;
    setActivities(newActivities);
  }, []);

  const loadActivities = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error: loadError } = await getWeeklyActivities(userId);
    setIsLoading(false);

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setError(null);
    putActivities(sortWeeklyActivities((data ?? []).map(parseWeeklyActivity)));
  }, [putActivities, userId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  /**
   * Applies a change to one activity and writes it.
   *
   * The write sends the whole of that activity's timestamps, so if two taps do
   * overlap on the wire the later write still carries both.
   */
  const applyChange = useCallback(
    async (activityId: string, change: (activity: WeeklyActivity) => WeeklyActivity) => {
      const currentActivity = activitiesRef.current.find((activity) => activity.id === activityId);

      if (!currentActivity) return;

      const changed = change(currentActivity);
      const doneDates = pruneDoneDates(changed.doneDates);

      // Nothing to say: an undo with nothing to take back would otherwise write
      // the row it just read. Compared value by value rather than by length,
      // because a count that prunes an old timestamp as it adds a new one
      // leaves the length where it was.
      const isUnchanged =
        doneDates.length === currentActivity.doneDates.length &&
        doneDates.every((doneDate, index) => doneDate === currentActivity.doneDates[index]);

      if (isUnchanged) return;

      const newActivity = { ...changed, doneDates };

      putActivities(
        activitiesRef.current.map((activity) => (activity.id === activityId ? newActivity : activity)),
      );

      const { error: saveError } = await updateWeeklyActivity(activityId, { doneDates });

      if (saveError) {
        setError(saveError.message);
        await loadActivities();
      }
    },
    [loadActivities, putActivities],
  );

  const countOne = useCallback(
    (activityId: string) => applyChange(activityId, (activity) => markWeeklyDone(activity)),
    [applyChange],
  );

  const undoOne = useCallback(
    (activityId: string) => applyChange(activityId, (activity) => undoWeeklyDone(activity)),
    [applyChange],
  );

  // Typing only touches local state; a commit is what reaches the database, the
  // same way the reward goals and decision lists handle their text.
  const changeActivity = useCallback(
    (activityId: string, input: { name?: string; target?: number }) => {
      putActivities(
        activitiesRef.current.map((activity) =>
          activity.id === activityId ? { ...activity, ...input } : activity,
        ),
      );
    },
    [putActivities],
  );

  const commitActivity = useCallback(
    async (activityId: string, input: { name?: string; target?: number }) => {
      changeActivity(activityId, input);

      const newActivity = activitiesRef.current.find((activity) => activity.id === activityId);

      if (!newActivity) return;

      const { error: saveError } = await updateWeeklyActivity(activityId, {
        name: newActivity.name.trim(),
        target: newActivity.target,
      });

      if (saveError) setError(saveError.message);
    },
    [changeActivity],
  );

  const addActivity = useCallback(async () => {
    if (!userId) return null;

    const currentActivities = activitiesRef.current;
    const sortOrder = currentActivities.length
      ? Math.max(...currentActivities.map((activity) => activity.sortOrder)) + 1
      : 0;

    const { data, error: createError } = await createWeeklyActivity(userId, "", DEFAULT_WEEKLY_TARGET, sortOrder);

    if (createError || !data) {
      setError(createError?.message ?? "That could not be added.");
      return null;
    }

    const newActivity = parseWeeklyActivity(data);

    putActivities(sortWeeklyActivities([...activitiesRef.current, newActivity]));

    return newActivity.id;
  }, [putActivities, userId]);

  const removeActivity = useCallback(
    async (activityId: string) => {
      putActivities(activitiesRef.current.filter((activity) => activity.id !== activityId));

      const { error: deleteError } = await deleteWeeklyActivity(activityId);

      if (deleteError) {
        setError(deleteError.message);
        await loadActivities();
      }
    },
    [loadActivities, putActivities],
  );

  return {
    activities,
    isLoading,
    error,
    addActivity,
    changeActivity,
    commitActivity,
    countOne,
    undoOne,
    removeActivity,
    reloadActivities: loadActivities,
  };
}
