import { supabase } from "../../supabase";
import type { PointEntry, PointGoalMode, PointGoalRow, PointTask } from "../../types/points";
import { DEFAULT_TARGET_POINTS } from "../points";

const GOAL_COLUMNS = "id, mode, name, target_points, entries, tasks, updated_at";

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function getPointGoals(userId: string) {
  return getSupabaseClient()
    .from("point_goals")
    .select(GOAL_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<PointGoalRow[]>();
}

export async function getPointGoal(goalId: string) {
  return getSupabaseClient().from("point_goals").select(GOAL_COLUMNS).eq("id", goalId).maybeSingle<PointGoalRow>();
}

export async function createPointGoal(userId: string, mode: PointGoalMode, name: string) {
  return getSupabaseClient()
    .from("point_goals")
    .insert({ user_id: userId, mode, name, target_points: DEFAULT_TARGET_POINTS, entries: [], tasks: [] })
    .select(GOAL_COLUMNS)
    .single<PointGoalRow>();
}

export async function updatePointGoal(
  goalId: string,
  name: string,
  targetPoints: number,
  entries: PointEntry[],
  tasks: PointTask[],
) {
  return getSupabaseClient()
    .from("point_goals")
    .update({ name, target_points: targetPoints, entries, tasks })
    .eq("id", goalId);
}

export async function deletePointGoal(goalId: string) {
  return getSupabaseClient().from("point_goals").delete().eq("id", goalId);
}
