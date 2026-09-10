import { supabase } from "../../supabase";
import type { DecisionListKind, DecisionListRow, DecisionOption } from "../../types/lists";
import { getListTitle, getNewOptions } from "../lists";

const LIST_COLUMNS = "id, kind, title, options, share_token, updated_at";

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function getDecisionLists(userId: string) {
  return getSupabaseClient()
    .from("decision_lists")
    .select(LIST_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<DecisionListRow[]>();
}

export async function getDecisionList(listId: string) {
  return getSupabaseClient()
    .from("decision_lists")
    .select(LIST_COLUMNS)
    .eq("id", listId)
    .maybeSingle<DecisionListRow>();
}

export async function createDecisionList(userId: string, kind: DecisionListKind) {
  return getSupabaseClient()
    .from("decision_lists")
    .insert({ user_id: userId, kind, title: getListTitle(kind), options: getNewOptions(kind) })
    .select(LIST_COLUMNS)
    .single<DecisionListRow>();
}

export async function updateDecisionList(listId: string, title: string, options: DecisionOption[]) {
  return getSupabaseClient().from("decision_lists").update({ title, options }).eq("id", listId);
}

export async function deleteDecisionList(listId: string) {
  return getSupabaseClient().from("decision_lists").delete().eq("id", listId);
}

// Share-link reads and writes go through security-definer functions, because a link
// holder may have no account at all and so no row-level access to the table. Both
// functions return a single jsonb object, or null when the token matches nothing.
export async function getSharedDecisionList(shareToken: string) {
  const { data, error } = await getSupabaseClient().rpc("get_shared_decision_list", {
    p_share_token: shareToken,
  });

  return { data: (data ?? null) as DecisionListRow | null, error };
}

export async function saveSharedDecisionList(shareToken: string, title: string, options: DecisionOption[]) {
  const { data, error } = await getSupabaseClient().rpc("save_shared_decision_list", {
    p_share_token: shareToken,
    p_title: title,
    p_options: options,
  });

  return { data: (data ?? null) as DecisionListRow | null, error };
}
