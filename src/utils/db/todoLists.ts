import { supabase } from "../../supabase";
import type { TodoListItems, TodoListRow } from "../../types/todo";

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function getFirstTodoList(userId: string) {
  return getSupabaseClient()
    .from("todo_lists")
    .select("id, name, items, tags, links, notes, version")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<TodoListRow>();
}

export async function createTodoList(userId: string) {
  return getSupabaseClient()
    .from("todo_lists")
    .insert({ user_id: userId, items: [], tags: [], links: [], notes: "" })
    .select("id, name, items, tags, links, notes, version")
    .single<TodoListRow>();
}

/**
 * Saves the whole list, but only over the version it was read at.
 *
 * The list is one document and a save replaces all of it, so a tab holding an
 * old copy would otherwise wipe out whatever was written since: another tab's
 * tasks, a phone's counts, a restore. Filtering on the version turns that into
 * a save that touches no rows, which the caller sees as `data: null` and can
 * answer by reloading instead of overwriting. The database refuses any save
 * that does not move the version up by exactly one (migration 0012), so this
 * holds even for code that never learned to ask.
 */
export async function updateTodoListItems(todoListId: string, items: TodoListItems, expectedVersion: number) {
  return getSupabaseClient()
    .from("todo_lists")
    .update({
      items: items.todos,
      tags: items.tags,
      links: items.links,
      notes: items.notes,
      version: expectedVersion + 1,
    })
    .eq("id", todoListId)
    .eq("version", expectedVersion)
    .select("version")
    .maybeSingle<{ version: number }>();
}

export async function updateTodoListName(todoListId: string, name: string) {
  return getSupabaseClient()
    .from("todo_lists")
    .update({ name })
    .eq("id", todoListId);
}
