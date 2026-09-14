import { useCallback, useEffect, useMemo, useState } from "react";
import type { PointEntry, PointGoal, PointGoalMode, PointTask } from "../types/points";
import { createPointGoal, deletePointGoal, getPointGoal, getPointGoals, updatePointGoal } from "../utils/db/pointGoals";
import { getGoalEntries, getTaskNames, parsePointGoal } from "../utils/points";

export function usePointGoals(userId: string | undefined) {
  const [goals, setGoals] = useState<PointGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error: loadError } = await getPointGoals(userId);
    setIsLoading(false);

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setError(null);
    setGoals((data ?? []).map(parsePointGoal));
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const createGoal = useCallback(
    async (mode: PointGoalMode, name: string) => {
      if (!userId) return null;

      const { data, error: createError } = await createPointGoal(userId, mode, name);

      if (createError || !data) {
        setError(createError?.message ?? "The reward could not be created.");
        return null;
      }

      await loadGoals();

      return parsePointGoal(data).id;
    },
    [loadGoals, userId],
  );

  const removeGoal = useCallback(async (goalId: string) => {
    const { error: deleteError } = await deletePointGoal(goalId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== goalId));
  }, []);

  // Task names come from every reward, so autocomplete still knows a task that was
  // only ever logged against something the kid has already earned.
  const allTaskNames = useMemo(() => getTaskNames(goals.flatMap(getGoalEntries)), [goals]);

  return { goals, allTaskNames, isLoading, error, createGoal, removeGoal, reloadGoals: loadGoals };
}

export function usePointGoal(goalId: string | undefined) {
  const [goal, setGoal] = useState<PointGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false;

    async function loadGoal() {
      if (!goalId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error: loadError } = await getPointGoal(goalId);

      if (isStale) return;

      setIsLoading(false);

      if (loadError) {
        setError(loadError.message);
        return;
      }

      if (!data) {
        setError("That reward does not exist.");
        return;
      }

      setError(null);
      setGoal(parsePointGoal(data));
    }

    loadGoal();

    return () => {
      isStale = true;
    };
  }, [goalId]);

  const saveGoal = useCallback(
    async (name: string, targetPoints: number, entries: PointEntry[], tasks: PointTask[]) => {
      if (!goal) return;

      setIsSaving(true);
      const { error: saveError } = await updatePointGoal(goal.id, name.trim(), targetPoints, entries, tasks);
      setIsSaving(false);

      setError(saveError ? saveError.message : null);
    },
    [goal],
  );

  // Typing only touches local state; a commit is what reaches the database.
  const changeGoal = useCallback((name: string, targetPoints: number, entries: PointEntry[], tasks: PointTask[]) => {
    setGoal((currentGoal) => (currentGoal ? { ...currentGoal, name, targetPoints, entries, tasks } : currentGoal));
  }, []);

  const commitGoal = useCallback(
    (name: string, targetPoints: number, entries: PointEntry[], tasks: PointTask[]) => {
      changeGoal(name, targetPoints, entries, tasks);
      saveGoal(name, targetPoints, entries, tasks);
    },
    [changeGoal, saveGoal],
  );

  return { goal, isLoading, isSaving, error, changeGoal, commitGoal };
}
