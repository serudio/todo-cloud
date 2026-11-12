import { supabase } from "../../supabase";
import type { WeeklyActivityRow } from "../../types/weekly";

const ACTIVITY_COLUMNS = "id, name, target, done_dates, sort_order";

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function getWeeklyActivities(userId: string) {
  return getSupabaseClient()
    .from("weekly_activities")
    .select(ACTIVITY_COLUMNS)
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<WeeklyActivityRow[]>();
}

export async function createWeeklyActivity(userId: string, name: string, target: number, sortOrder: number) {
  return getSupabaseClient()
    .from("weekly_activities")
    .insert({ user_id: userId, name, target, done_dates: [], sort_order: sortOrder })
    .select(ACTIVITY_COLUMNS)
    .single<WeeklyActivityRow>();
}

export async function updateWeeklyActivity(
  activityId: string,
  input: { name?: string; target?: number; doneDates?: number[] },
) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.target !== undefined) patch.target = input.target;
  if (input.doneDates !== undefined) patch.done_dates = input.doneDates;

  return getSupabaseClient().from("weekly_activities").update(patch).eq("id", activityId);
}

export async function deleteWeeklyActivity(activityId: string) {
  return getSupabaseClient().from("weekly_activities").delete().eq("id", activityId);
}
