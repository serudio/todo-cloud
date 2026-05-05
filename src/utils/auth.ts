import { supabase } from "../supabase";

// Signs the current user out through Supabase auth.
export async function signOut() {
  if (!supabase) return;

  await supabase.auth.signOut();
}
