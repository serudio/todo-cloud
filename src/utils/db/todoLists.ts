import { supabase } from "../../supabase";
import type { Todo, TodoListRow } from "../../types/todo";

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function getFirstTodoList(userId: string) {
  return getSupabaseClient()
    .from("todo_lists")
    .select("id, name, items")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<TodoListRow>();
}

export async function createTodoList(userId: string) {
  return getSupabaseClient()
    .from("todo_lists")
    .insert({ user_id: userId, items: [] })
    .select("id, name, items")
    .single<TodoListRow>();
}

export async function updateTodoListItems(todoListId: string, items: Todo[]) {
  return getSupabaseClient()
    .from("todo_lists")
    .update({ items })
    .eq("id", todoListId);
}

export async function updateTodoListName(todoListId: string, name: string) {
  return getSupabaseClient()
    .from("todo_lists")
    .update({ name })
    .eq("id", todoListId);
}
